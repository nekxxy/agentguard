import {NearBindgen,call,view,near} from 'near-sdk-js';
// Local test fixture only. No external API or paid service is contacted.
@NearBindgen({})
export class Recipient {
  calls:number=0;
  total:string='0';
  last:any={};
  @call({payableFunction:true})
  buy({sku}:{sku:string}) {
    if(sku!=='fixed-demo')throw Error('sku');
    if(near.attachedDeposit()!==60n)throw Error('price');
    this.calls++;this.total=(BigInt(this.total)+near.attachedDeposit()).toString();
    this.last={caller:near.predecessorAccountId(),sku};
    return {ok:true,sku};
  }
  @view({}) status(){return {calls:this.calls,total:this.total,last:this.last};}
}
