import {NearBindgen,call,near} from 'near-sdk-js';
@NearBindgen({})
export class AdversarialRecipient {
 @call({payableFunction:true})
 fail(){throw Error('intentional recipient failure');}
 @call({payableFunction:true})
 exhaust(){for(let i=0;i<1000000;i++)near.sha256(new Uint8Array(1024));return 'unreachable';}
}
