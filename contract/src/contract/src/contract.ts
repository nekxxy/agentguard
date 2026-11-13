import {NearBindgen,initialize,call,view,near,NearPromise} from 'near-sdk-js';
import {Engine} from './engine.js';
@NearBindgen({requireInit:true})
export class AgentGuard {
  state:any={owner:"",agents:{}};
  @initialize({})
  init({owner}:{owner:string}) {
    if(near.predecessorAccountId()!==near.currentAccountId())throw Error('contract self initialization only');
    if(!(/^[a-z0-9][a-z0-9._-]{1,63}$/).test(owner))throw Error('owner account');
    this.state={owner,agents:{}};
  }
  engine():Engine {return Object.assign(new Engine(this.state.owner),this.state);}
  @call({})
  configure({agent,policy}:{agent:string,policy:any}) {
    const e=this.engine();e.configure(near.predecessorAccountId(),agent,policy);this.state=e;
  }
  @call({})
  request({nonce,value}:{nonce:string,value:string}) {
    const caller=near.predecessorAccountId(),e=this.engine();
    const day=Number(near.blockTimestamp()/86400000000000n);
    const r=e.reserve(caller,nonce,value,day);this.state=e;
    return NearPromise.new(r.recipient).functionCall(r.method,r.args,BigInt(value),20000000000000n)
      .then(NearPromise.new(near.currentAccountId()).functionCall('settle',JSON.stringify({agent:caller,nonce}),0n,20000000000000n));
  }
  @call({privateFunction:true})
  settle({agent,nonce}:{agent:string,nonce:string}) {
    if(near.promiseResultsCount()!==1n)throw Error('one promise required');
    let success=true;try{near.promiseResult(0);}catch{success=false;}
    const e=this.engine();const result=e.settle(near.predecessorAccountId(),near.currentAccountId(),agent,nonce,success);this.state=e;return result;
  }
  @view({})
  status(){return this.state;}
}
