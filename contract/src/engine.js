// Private contract core. Integer amounts are decimal strings at the JSON boundary.
const MAX_AGENTS=16;
export function amount(s) {
  if(typeof s!=='string'||!(/^[1-9][0-9]{0,37}$/).test(s)) throw Error('positive bounded decimal required');
  const n=BigInt(s); if(n>=(1n<<128n))throw Error('u128 overflow');return n;
}
export class Engine {
  constructor(owner){this.owner=owner;this.agents={};}
  configure(caller,agent,p){
    if(caller!==this.owner)throw Error('owner only');
    if(!(/^[a-z0-9][a-z0-9._-]{1,63}$/).test(agent))throw Error('account');
    if(!this.agents[agent]&&Object.keys(this.agents).length>=MAX_AGENTS)throw Error('agent bound');
    if(this.agents[agent]?.pending)throw Error('pending policy locked');
    amount(p.cap);amount(p.budget);
    if(BigInt(p.cap)>BigInt(p.budget))throw Error('cap exceeds budget');
    if(!(/^[a-z0-9][a-z0-9._-]{1,63}$/).test(p.recipient)||!(/^[A-Za-z][A-Za-z0-9_]{0,63}$/).test(p.method))throw Error('binding');
    if(typeof p.args!=='string'||p.args.length>1024)throw Error('bounded args');
    JSON.parse(p.args);
    const old=this.agents[agent];
    this.agents[agent]={...p,nonce:old?.nonce||'0',day:old?.day||'0',used:old?.used||'0',count:old?.count||0,pending:null};
  }
  reserve(caller,nonce,value,day){
    const p=this.agents[caller];if(!p)throw Error('unknown agent');
    if(!Number.isSafeInteger(day)||day<0)throw Error('day');
    if(p.pending)throw Error('one pending per agent');
    const n=amount(nonce),v=amount(value);
    if(n!==BigInt(p.nonce)+1n)throw Error('monotonic nonce');
    if(BigInt(day)<BigInt(p.day))throw Error('clock reversed');
    const used=String(day)===p.day?BigInt(p.used):0n;
    const count=String(day)===p.day?p.count:0;
    if(v>BigInt(p.cap)||used+v>BigInt(p.budget)||count>=100)throw Error('limit');
    p.nonce=nonce;p.day=String(day);p.used=(used+v).toString();p.count=count+1;
    p.pending={nonce,value,recipient:p.recipient,method:p.method,args:p.args};
    return {...p.pending};
  }
  settle(caller,current,agent,nonce,success){
    if(caller!==current)throw Error('private callback');
    const p=this.agents[agent];if(!p?.pending||p.pending.nonce!==nonce)throw Error('callback identity');
    // Failure does not release budget: receipt failure/refund timing may be ambiguous.
    p.pending=null;
    return {nonce,status:success?'success':'failure_budget_retained'};
  }
}
