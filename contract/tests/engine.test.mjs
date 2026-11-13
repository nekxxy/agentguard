import test from 'node:test';import assert from 'node:assert/strict';import {Engine,amount} from '../src/engine.js';
const policy={cap:'60',budget:'100',recipient:'paid.testnet',method:'buy',args:'{}'};
function setup(){let e=new Engine('owner.testnet');e.configure('owner.testnet','agent.testnet',policy);return e;}
test('decimal boundary',()=>{for(let x of ['0','-1','1.0',1,true,'01',(1n<<128n).toString()])assert.throws(()=>amount(x));assert.equal(amount('1'),1n)});
test('owner configure',()=>assert.throws(()=>setup().configure('agent.testnet','other.testnet',policy)));
test('binding and limits',()=>{let e=setup();let r=e.reserve('agent.testnet','1','60',0);assert.equal(r.recipient,'paid.testnet');assert.equal(r.method,'buy');assert.throws(()=>e.reserve('agent.testnet','2','1',0));assert.throws(()=>e.reserve('attacker.testnet','1','1',0));});
test('fake callback',()=>{let e=setup();e.reserve('agent.testnet','1','60',0);assert.throws(()=>e.settle('agent.testnet','vault.testnet','agent.testnet','1',true));assert.throws(()=>e.settle('vault.testnet','vault.testnet','agent.testnet','2',true));});
test('success retains spend and nonce',()=>{let e=setup();e.reserve('agent.testnet','1','60',0);e.settle('vault.testnet','vault.testnet','agent.testnet','1',true);assert.throws(()=>e.reserve('agent.testnet','2','60',0));assert.throws(()=>e.reserve('agent.testnet','1','1',0));e.reserve('agent.testnet','2','40',0)});
test('failure conservatively retains budget',()=>{let e=setup();e.reserve('agent.testnet','1','60',0);e.settle('vault.testnet','vault.testnet','agent.testnet','1',false);assert.throws(()=>e.reserve('agent.testnet','2','60',0));});
test('daily boundary not while pending',()=>{let e=setup();e.reserve('agent.testnet','1','60',0);assert.throws(()=>e.reserve('agent.testnet','2','60',1));e.settle('vault.testnet','vault.testnet','agent.testnet','1',true);e.reserve('agent.testnet','2','60',1);});
test('bounded agents',()=>{let e=setup();for(let i=1;i<16;i++)e.configure('owner.testnet','agent'+i+'.testnet',policy);assert.throws(()=>e.configure('owner.testnet','extra.testnet',policy));});
test('pending policy locked',()=>{let e=setup();e.reserve('agent.testnet','1','1',0);assert.throws(()=>e.configure('owner.testnet','agent.testnet',policy));});
test('serialization roundtrip retains protections',()=>{let e=setup();e.reserve('agent.testnet','1','60',0);e=Object.assign(new Engine('x'),JSON.parse(JSON.stringify(e)));assert.throws(()=>e.reserve('agent.testnet','2','1',0));});
