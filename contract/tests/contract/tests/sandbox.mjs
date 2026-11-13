import {Worker} from 'near-workspaces';
import assert from 'node:assert/strict';
const worker=await Worker.init();
let passed=0;
async function denied(fn){await assert.rejects(fn);passed++}
try{
 const root=worker.rootAccount;
 const vault=await root.createSubAccount('vault');
 const agent=await root.createSubAccount('agent');
 const attacker=await root.createSubAccount('attacker');
 await vault.deploy('build/agentguard.wasm');
 await denied(()=>attacker.call(vault,'init',{owner:attacker.accountId}));
 await vault.call(vault,'init',{owner:root.accountId});passed++;
 await denied(()=>attacker.call(vault,'configure',{agent:attacker.accountId,policy:{}}));
 const policy={cap:'60',budget:'100',recipient:'missing.test.near',method:'buy',args:'{}'};
 await root.call(vault,'configure',{agent:agent.accountId,policy});passed++;
 await denied(()=>attacker.call(vault,'request',{nonce:'1',value:'1'}));
 await denied(()=>agent.call(vault,'settle',{agent:agent.accountId,nonce:'1'}));
 await denied(()=>agent.call(vault,'request',{nonce:'1',value:'61'}));
 const result=await agent.call(vault,'request',{nonce:'1',value:'60'},{gas:'100000000000000'});
 assert.equal(result.status,'failure_budget_retained');passed++;
 const state=await vault.view('status',{});assert.equal(state.agents[agent.accountId].used,'60');assert.equal(state.agents[agent.accountId].pending,null);passed++;
 await denied(()=>agent.call(vault,'request',{nonce:'1',value:'1'}));
 await denied(()=>agent.call(vault,'request',{nonce:'2',value:'60'}));
 console.log(JSON.stringify({sandboxChecksPassed:passed,result,network:'local sandbox only; no public testnet',state}));
}finally{await worker.tearDown()}
