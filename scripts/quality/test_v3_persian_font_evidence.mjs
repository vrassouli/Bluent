import {test} from "node:test";
import {strict as assert} from "node:assert";
import {assessPersianFontEvidence} from "./v3_persian_font_evidence.mjs";

const normal={lang:"fa",rtl:"rtl",chars:51,zwnj:true,fontFamily:"Segoe UI, sans-serif",
  width:335,height:24,hostWidth:420,hostHeight:48,visible:true};
test("Real platform glyph data gives full CDP telemetry evidence",()=>{
  const result=assessPersianFontEvidence([{family:"Segoe UI",glyphCount:50,isCustom:false}],normal);
  assert.deepEqual(result,{pass:true,evidenceLevel:"platform-glyph-observed",gap:null});
});
test("Missing Windows Server CDP font telemetry is explicit limited evidence",()=>{
  const result=assessPersianFontEvidence([],normal);
  assert.equal(result.pass,true);
  assert.equal(result.evidenceLevel,"semantic-layout-only");
  assert.match(result.gap,/visual acceptance remains unverified/);
});
test("Missing font telemetry never permits invisible, empty or invalid Persian text",()=>{
  for(const patch of [{width:0},{chars:0},{zwnj:false},{rtl:"ltr"},
    {lang:"en"},{visible:false},{height:0},{hostHeight:0},
    {hostWidth:0},{fontFamily:""}]){
    assert.equal(assessPersianFontEvidence([],{...normal,...patch}).pass,false,JSON.stringify(patch));
  }
});
test("Malformed nonempty platform telemetry is not silently downgraded to unavailable",()=>{
  for(const bogus of [[{family:"",glyphCount:50}],[{family:"Fake",glyphCount:0}],
    [{family:"Fake",glyphCount:-1}],null,{}]){
    assert.equal(assessPersianFontEvidence(bogus,normal).pass,false,JSON.stringify(bogus));
  }
});
test("Reported glyph families never overrule broken semantic/visual layout",()=>{
  assert.equal(assessPersianFontEvidence([{family:"Tahoma",glyphCount:50}],
    {...normal,width:0}).pass,false);
});
