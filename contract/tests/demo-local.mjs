import {Worker} from 'near-workspaces';
import {KeyPair,transactions} from 'near-api-js';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const say=(x)=>console.log(x);
const w=await Worker.init();
try{
const root=w.rootAccount,v=await root.createSubAccount('vault'),a=await root.createSubAccount('agent'),s=await root.createSubAccount('shop');
say('$ deploy local vault + fixed-purchase fixture');
await v.batch(v).deployContract(await fs.readFile('build/agentguard.wasm')).functionCall('init',{owner:root.accountId},{gas:100000000000000n}).transact();await s.deploy('build/recipient.wasm');
const policy={cap:'60',budget:'60',recipient:s.accountId,method:'buy',args:'{"sku":"fixed-demo"}'};
await root.call(v,'configure',{agent:a.accountId,policy});
say('Configured: cap=60, daily budget=60 local yoctoNEAR');
say('Binding: shop.test.near / buy / sku=fixed-demo');
const k=KeyPair.fromRandom('ed25519');await a.batch(a).addKey(k.getPublicKey(),transactions.functionCallAccessKey(v.accountId,['request'],'1000000000000000000000000')).transact();
const opts={gas:'100000000000000',signWithKey:k};
say('$ restricted-key request nonce=1 value=60');
const r=await a.call(v,'request',{nonce:'1',value:'60'},opts);assert.equal(r.status,'success');say('RESULT '+JSON.stringify(r));
say('$ recipient.status');const shop=await s.view('status',{});assert.equal(shop.calls,1);say('RESULT '+JSON.stringify(shop));
for(const [name,args] of [['replay',{nonce:'1',value:'60'}],['budget exceeded',{nonce:'2',value:'1'}]]){
say('$ request '+name+' '+JSON.stringify(args));let rejected=false;try{await a.call(v,'request',args,opts)}catch(e){rejected=true;assert.ok(String(e).includes(name==='replay'?'monotonic nonce':'limit'));say('REJECTED by contract: '+(String(e).includes('monotonic nonce')?'monotonic nonce':String(e).includes('limit')?'limit':'unexpected error'));}assert.ok(rejected);
}
say('$ vault.status');const st=await v.view('status',{});const p=st.agents[a.accountId];assert.equal(p.used,'60');assert.equal(p.nonce,'1');assert.equal(p.pending,null);say('RESULT '+JSON.stringify({used:p.used,nonce:p.nonce,pending:p.pending}));
say('DONE: actual local contract calls; no public-chain effects.');
say('Not a real API, anomaly scorer, hosted UI or production audit.');
}finally{await w.tearDown()}
