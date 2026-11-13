import {Worker} from 'near-workspaces';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const w=await Worker.init();const checks=[];async function check(name,fn){await fn();checks.push(name)}
try{
const root=w.rootAccount,vault=await root.createSubAccount('vault'),agent=await root.createSubAccount('agent'),agent2=await root.createSubAccount('agent2'),shop=await root.createSubAccount('shop'),bad=await root.createSubAccount('bad');
await vault.batch(vault).deployContract(await fs.readFile('build/agentguard.wasm')).functionCall('init',{owner:root.accountId},{gas:100000000000000n}).transact();await shop.deploy('build/recipient.wasm');await bad.deploy('build/adversarial-recipient.wasm');
const p={cap:'60',budget:'60',recipient:bad.accountId,method:'fail',args:'{}'},opts={gas:'100000000000000'};
await root.call(vault,'configure',{agent:agent.accountId,policy:p});
await check('recipient panic callback retains budget and clears pending',async()=>{const r=await agent.call(vault,'request',{nonce:'1',value:'60'},opts);assert.equal(r.status,'failure_budget_retained');const s=await vault.view('status',{});assert.equal(s.agents[agent.accountId].used,'60');assert.equal(s.agents[agent.accountId].pending,null)});
await root.call(vault,'configure',{agent:agent2.accountId,policy:{...p,method:'exhaust'}});
await check('recipient gas exhaustion callback retains budget and clears pending',async()=>{const r=await agent2.call(vault,'request',{nonce:'1',value:'60'},opts);assert.equal(r.status,'failure_budget_retained');const s=await vault.view('status',{});assert.equal(s.agents[agent2.accountId].used,'60');assert.equal(s.agents[agent2.accountId].pending,null)});
await check('failure cap cannot be reset by owner reconfigure',async()=>{await root.call(vault,'configure',{agent:agent.accountId,policy:{...p,recipient:shop.accountId,method:'buy',args:'{"sku":"fixed-demo"}'}});await assert.rejects(()=>agent.call(vault,'request',{nonce:'2',value:'1'},opts))});
const a3=await root.createSubAccount('agent3');await root.call(vault,'configure',{agent:a3.accountId,policy:{...p,recipient:shop.accountId,method:'buy',args:'{"sku":"fixed-demo"}'}});
await check('concurrent same-agent requests cannot exceed budget',async()=>{const r=await Promise.allSettled([a3.call(vault,'request',{nonce:'1',value:'60'},opts),a3.call(vault,'request',{nonce:'2',value:'60'},opts)]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);const s=await vault.view('status',{});assert.equal(s.agents[a3.accountId].used,'60');assert.equal(s.agents[a3.accountId].pending,null);const t=await shop.view('status',{});assert.equal(t.calls,1);assert.equal(t.total,'60')});
console.log(JSON.stringify({checksPassed:checks.length,checks,scope:'local sandbox only',state:await vault.view('status',{}),limitations:['recipient gas exhaustion is not callback gas exhaustion','No forced callback failure recovery or long-run storage stress tested']}));
}finally{await w.tearDown()}
