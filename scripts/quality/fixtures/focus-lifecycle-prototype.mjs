/** #552 Wave I: PURE focus lifecycle research only; NOT Bluent product API or live DOM. */
const eligible=e=>Boolean(e&&e.visible&&e.presentInDom&&e.navigable&&!e.disabled);
export class FocusLifecycleResearch {
 constructor(entries=[],{selectedId=null,triggerId=null}={}){
  this.epoch=0;this.disposed=false;this.open=true;this.inside=false;
  this.entries=entries;this.selectedId=selectedId;this.focusedId=null;
  this.triggerId=triggerId;this.pending=null;this.ticket=0;this.unknownExit=false;
 }
 get(id){return this.entries.find(e=>e.id===id);}
 canFocus(id){return eligible(this.get(id));}
 focusIn(id){
  if(this.disposed||!this.open||!this.canFocus(id))return false;
  this.inside=true;this.unknownExit=false;this.focusedId=id;this.epoch++;
  this.pending=null;return true;
 }
 focusOut({relatedWithin=null}={}){
  if(this.disposed||!this.open)return 'ignored';
  if(relatedWithin===true)return 'internal';
  if(relatedWithin===false){this.inside=false;this.unknownExit=false;this.pending=null;this.epoch++;return 'left';}
  this.unknownExit=true;return 'needs-active-element-check';
 }
 settle({activeId=null,activeWithin=false}={}){
  if(this.disposed||!this.open||!this.unknownExit)return false;
  this.unknownExit=false;
  if(activeWithin&&this.canFocus(activeId)){this.inside=true;this.focusedId=activeId;}
  else{this.inside=false;this.pending=null;}
  this.epoch++;return true;
 }
 updateItems(entries){
  if(this.disposed)return false;
  this.entries=entries;this.epoch++;this.pending=null;
  if(this.focusedId&&!this.canFocus(this.focusedId)){
   this.focusedId=null;this.inside=false;this.unknownExit=false;
  }
  return true;
 }
 tabStop(){
  const allowed=this.entries.filter(eligible);
  return (this.inside && this.canFocus(this.focusedId)?this.focusedId:null)
   ??(this.canFocus(this.selectedId)?this.selectedId:null)
   ??(this.canFocus(this.focusedId)?this.focusedId:null)
   ??allowed[0]?.id??null;
 }
 request(id){
  if(this.disposed||!this.open||!this.canFocus(id))return null;
  const ticket={id,epoch:this.epoch,serial:++this.ticket,kind:'move'};
  this.pending=ticket;return {...ticket};
 }
 authorize(ticket,{connected=false,ownerHasFocus=false,userMovedFocus=false}={}){
  if(!ticket||this.disposed||!this.open||!this.pending)return false;
  if(ticket.kind!=='move'||ticket.serial!==this.pending.serial||ticket.epoch!==this.epoch)return false;
  const allowed=connected && ownerHasFocus && !userMovedFocus && this.canFocus(ticket.id);
  this.pending=null;return allowed;
 }
 closePopup({activeInPopup=false,activeOutside=false}={}){
  if(this.disposed||!this.open)return null;
  this.open=false;this.inside=false;this.unknownExit=false;this.epoch++;this.pending=null;
  if(!activeInPopup||activeOutside||!this.triggerId)return null;
  const ticket={kind:'restore',id:this.triggerId,epoch:this.epoch,serial:++this.ticket};
  this.pending=ticket;return {...ticket};
 }
 authorizeRestore(ticket,{triggerConnected=false,focusStillOrphaned=false,userMovedFocus=false}={}){
  if(!ticket||this.disposed||this.open||!this.pending)return false;
  if(ticket.kind!=='restore'||ticket.serial!==this.pending.serial||ticket.epoch!==this.epoch)return false;
  const allowed=triggerConnected&&focusStillOrphaned&&!userMovedFocus;
  this.pending=null;return allowed;
 }
 dispose(){this.disposed=true;this.open=false;this.inside=false;this.unknownExit=false;this.pending=null;this.epoch++;}
}
