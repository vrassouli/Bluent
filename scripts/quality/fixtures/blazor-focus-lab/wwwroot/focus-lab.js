window.bluent552 = (() => {
  let serial=0;
  document.addEventListener("focusin",()=>{serial++},true);
  return {
    focusSerial:()=>serial,
    focusWithin:(id)=>{
      const el=document.getElementById(id);
      return !!(el&&el.contains(document.activeElement));
    },
    canFocus:(owner,target)=>{
      const root=document.getElementById(owner),el=document.getElementById(target);
      return !!(root&&el&&el.isConnected&&root.contains(document.activeElement));
    },
    canRestore:(trigger,previousSerial)=>{
      const el=document.getElementById(trigger),a=document.activeElement;
      return !!(el&&el.isConnected&&serial===previousSerial&&(a===document.body||a===document.documentElement));
    },
    observe:()=>({active:document.activeElement?.id||null,serial})
  };
})();
