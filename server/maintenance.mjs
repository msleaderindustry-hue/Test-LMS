import {DAY,OWNER_UID} from './domain.mjs';
// Ages are suggestions for operational logs only. Every deletion still needs
// the owner's exact confirmation. Learning results and backups are excluded.
export class MaintenanceService {
  constructor({store,control,now=()=>Date.now(),ownerUid=OWNER_UID}){Object.assign(this,{store,control,now,ownerUid});}
  async inspect(){
    const now=this.now(),pending=await this.store.query('lmsProposals',[['status','EQUAL','pending']],500),created=[];
    for(const [kind,days] of [['diagnostics',30],['activity',90],['chess',30]]){
      if(pending.some(d=>d.data.type==='cleanup'&&d.data.payload.kind===kind&&d.data.expiresAt>now))continue;
      try{const proposal=await this.control.proposeCleanup({uid:this.ownerUid,owner:true},{kind,before:now-days*DAY},{source:'maintenance',ttl:7*24*60});created.push(proposal.id);}
      catch(e){if(e.code!=='nothing-to-clean')throw e;}
    }
    return {created};
  }
}
