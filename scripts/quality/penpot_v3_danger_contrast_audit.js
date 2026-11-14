// Run inside connected Bluent v3 Penpot. Read actual token values under both
// draft modes; restores the previously active mode. Numerical contrast only.
if(penpot.currentFile?.id!=="b64f6665-c9ab-80b5-8008-c4ac99d9d000")throw Error("Wrong design file");
const catalog=penpot.library.local.tokens,pg=penpotUtils.getPageByName("30 · Danger text contrast comparison · #418");
const board=pg?.getShapeById("acf5f619-7d81-80da-8008-c5ddf5c26686");if(!board)throw Error("Missing authored contrast board");
const modes=[["light","#B10E1C","#BC2F32","#FFFFFF"],["dark","#DC626D","#E37D80","#292929"]];
function ratio(a,b){const L=x=>{let v=x.trim().replace("#","");if(v.length!==6)throw Error("Nonopaque color "+x);const v3=[0,2,4].map(i=>{let n=parseInt(v.slice(i,i+2),16)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return v3[0]*.2126+v3[1]*.7152+v3[2]*.0722};const p=L(a),q=L(b);return(Math.max(p,q)+.05)/(Math.min(p,q)+.05)}
let errors=[],samples=[],checks=0;
try{for(const [mode,legacy,candidate,background] of modes){
const theme=catalog.themes.find(x=>x.group==="Bluent v3 / Mode"&&x.name.toLowerCase().startsWith(mode));
const set=catalog.sets.find(s=>s.name==="bluent-v3/418/a11y/"+mode);
if(!theme||!set){errors.push("Missing theme or set "+mode);continue}
if(!theme.active)theme.toggleActive();
if(!theme.activeSets.some(s=>s.id===set.id))errors.push("Set missing from theme "+mode);
const values=Object.fromEntries(set.tokens.map(t=>[t.name,t.resolvedValueString.toUpperCase()]));
for(const [name,expected] of [["bluent.a11y.danger.current",legacy],["bluent.a11y.danger.candidate",candidate]]){checks++;if(values[name]!==expected)errors.push("Color mismatch "+mode+"/"+name+": "+values[name])}
const normal=catalog.sets.find(s=>s.name==="bluent-v3/draft/"+mode)?.tokens.find(t=>t.name==="bluent.color.background1")?.resolvedValueString.toUpperCase();
checks++;if(normal!==background)errors.push("Background mismatch "+mode);
const orig=ratio(values["bluent.a11y.danger.current"],background),improved=ratio(values["bluent.a11y.danger.candidate"],background);
checks++;if((orig>=4.5)!==(mode==="light"))errors.push("Source risk changed "+mode);
checks++;if(improved<4.5)errors.push("Candidate still too low "+mode);
const label=board.children.find(s=>s.name==="Ratio "+(mode==="light"?"0":"1")+" / 1");
checks++;if(!label||!label.characters.includes(improved.toFixed(2)))errors.push("Board not matched "+mode);
samples.push({mode,source:legacy,candidate,background,sourceRatio:+orig.toFixed(3),candidateRatio:+improved.toFixed(3),tokenSetId:set.id});
}}finally{const light=catalog.themes.find(t=>t.group==="Bluent v3 / Mode"&&t.name==="Light · Draft");if(light&&!light.active)light.toggleActive()}
return {fileId:penpot.currentFile.id,revision:penpot.currentFile.revn,page:pg.id,board:board.id,pass:errors.length===0,checks,errors,samples,sourceCssChanged:false,approvedForProduct:false};