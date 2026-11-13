import {Worker} from 'near-workspaces';
import {KeyPair,transactions} from 'near-api-js';
import assert from 'node:assert/strict';
const worker=await Worker.init();let passed=0;const checks=[];
async function check(name,fn){await fn();passed++;checks.push(name)}
async function denied(name,fn,pattern){await check(name,async()=>{let error;try{await fn()}catch(e){error=e}assert.ok(error,'operation must reject');if(pattern)assert.match(String(error),pattern);console.log('DENIAL_REASON',name,String(error).slice(0,600), JSON.stringify({type:error.type,context:error.context}))});console.log('EXPECTED_DENIAL',name,String(pattern))}
try{
 const root=worker.rootAccount;
 const vault=await root.createSubAccount('vault');
 const agent=await root.createSubAccount('agent');
 const attacker=await root.createSubAccount('attacker');
 const shop=await root.createSubAccount('shop');
 const fs=await import('node:fs/promises');
 const atomic=await vault.batch(vault).deployContract(await fs.readFile('build/agentguard.wasm')).functionCall('init',{owner:root.accountId},{gas:100000000000000n}).transact();assert.equal(atomic.failed,false);
 await shop.deploy('build/recipient.wasm');
 const policy={cap:'60',budget:'120',recipient:shop.accountId,method:'buy',args:'{"sku":"fixed-demo"}'};
 await root.call(vault,'configure',{agent:agent.accountId,policy});
 const restricted=KeyPair.fromRandom('ed25519');
 await agent.batch(agent).addKey(restricted.getPublicKey(),transactions.functionCallAccessKey(vault.accountId,['request'],'1000000000000000000000000')).transact();
 const keyInfo=await agent.viewAccessKey(agent.accountId,restricted.getPublicKey().toString());console.log('REGISTERED_PERMISSION',JSON.stringify(keyInfo));
 const opts={gas:'100000000000000',signWithKey:restricted};
 await check('restricted key successful paid recipient fixture',async()=>{
  const r=await agent.call(vault,'request',{nonce:'1',value:'60',recipient:attacker.accountId,args:'{"sku":"evil"}'},opts);
  assert.equal(r.status,'success');
  const s=await shop.view('status',{});assert.equal(s.calls,1);assert.equal(s.total,'60');assert.equal(s.last.caller,vault.accountId);assert.equal(s.last.sku,'fixed-demo');
  const v=await vault.view('status',{});assert.equal(v.agents[agent.accountId].used,'60');assert.equal(v.agents[agent.accountId].pending,null);
 });
 await denied('restricted key cannot configure',()=>agent.call(vault,'configure',{agent:agent.accountId,policy},opts));
 await denied('restricted key cannot direct-call recipient',()=>agent.call(shop,'buy',{sku:'fixed-demo'},opts));
 await denied('restricted key cannot attach deposit',()=>agent.call(vault,'request',{nonce:'2',value:'60'},{...opts,attachedDeposit:'1'}));
 await denied('restricted key cannot transfer',()=>agent.batch(attacker).transfer(1n).transact(restricted),/full access key/i);
 await denied('restricted key cannot call private callback',()=>agent.call(vault,'settle',{agent:agent.accountId,nonce:'1'},opts));
 await denied('replay rejected after success',()=>agent.call(vault,'request',{nonce:'1',value:'60'},opts));
 await denied('oversized value rejected',()=>agent.call(vault,'request',{nonce:'2',value:'61'},opts));
 await denied('unknown caller rejected',()=>attacker.call(vault,'request',{nonce:'1',value:'60'}));
 await denied('low gas request rejected',()=>agent.call(vault,'request',{nonce:'2',value:'60'},{...opts,gas:'10000000000000'}));
 await check('low gas failure leaves reservation unchanged',async()=>{const v=await vault.view('status',{});assert.equal(v.agents[agent.accountId].used,'60');assert.equal(v.agents[agent.accountId].nonce,'1');assert.equal(v.agents[agent.accountId].pending,null)});
 await check('second bounded success',async()=>{const r=await agent.call(vault,'request',{nonce:'2',value:'60'},opts);assert.equal(r.status,'success');const s=await shop.view('status',{});assert.equal(s.calls,2);assert.equal(s.total,'120')});
 await denied('daily budget enforced after success',()=>agent.call(vault,'request',{nonce:'3',value:'1'},opts));
 await denied('reinit rejected',()=>vault.call(vault,'init',{owner:attacker.accountId}));
 console.log(JSON.stringify({sandboxChecksPassed:passed,checks,network:'local sandbox only',scope:'fixture paid in local yoctoNEAR, not a real API',state:await vault.view('status',{})}));
}finally{await worker.tearDown()}
