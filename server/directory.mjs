import { enabled, owner, requireId, fail, text, OWNER_UID } from './domain.mjs';
import { timestamp } from './firestore.mjs';
export function mayContact(a,b,ownerUid=OWNER_UID) {
  if(a.uid===b.uid||!enabled(a.profile,'chat')||!enabled(b.profile,'chat'))return false;
  const permits=(from,to)=>from.uid===ownerUid||to.uid===ownerUid||!['teachers','selected'].includes(from.profile.chatContactMode)||from.profile.chatContactMode==='selected'&&(from.profile.chatAllowedUsers||[]).includes(to.uid);
  return permits(a,b)&&permits(b,a);
}
export class DirectoryService {
  constructor({store,ownerUid=OWNER_UID,now=()=>Date.now()}){this.store=store;this.ownerUid=ownerUid;this.now=now;}
  async list(actor){
    const profiles=await this.store.list('users',{limit:500});
    return profiles.map(d=>({uid:d.path.split('/')[1],profile:d.data})).filter(other=>actor.owner||mayContact(actor,other,this.ownerUid)).map(other=>({uid:other.uid,name:text(other.profile.nickname||other.profile.displayName,80)||'Ученик',nickname:text(other.profile.nickname||other.profile.displayName,80)||'Ученик',role:other.uid===this.ownerUid?'admin':'student',...(actor.owner?{isBanned:!!other.profile.isBanned,allowedModules:other.profile.allowedModules??null,groupId:text(other.profile.groupId,80)}:{})}));
  }
  async open(actor,uid){
    requireId(uid);const other=await this.store.get('users/'+uid);
    if(!other||!mayContact(actor,{uid,profile:other.data},this.ownerUid))fail(403,'contact-denied','Этот контакт недоступен.');
    const participants=[actor.uid,uid].sort(),id=participants.join('_'),path='private_chats/'+id;
    await this.store.atomic(async()=>{const old=await this.store.get(path);if(old?.data.participants?.join('|')===participants.join('|'))return;await this.store.commit([{path,version:old?.version??null,data:{...old?.data,participants,version:1,updatedAt:timestamp(this.now())}}]);});
    return {id,participants};
  }
  async migration(actor){
    owner(actor,this.ownerUid);const assignments=await this.store.list('lmsAssignments',{limit:500}),missing=[];
    for(const a of assignments)for(const uid of a.data.studentIds||[]){requireId(uid);const path=`users/${uid}/assignments/${a.path.split('/')[1]}`;if(!await this.store.get(path)){const p=(await this.store.get(a.path+'/progress/'+uid))?.data;missing.push({path,data:{...a.data,studentIds:[uid],studentNames:undefined,_progress:{status:p?.status||'not_started',count:p?.result?.count||0,needsHelp:!!p?.needsHelp}}});}}
    // Additive projections only. Existing results and permissions are never changed.
    for(let i=0;i<missing.length;i+=100)await this.store.commit(missing.slice(i,i+100).map(d=>({...d,version:null})));
    return {projected:missing.length};
  }
}
