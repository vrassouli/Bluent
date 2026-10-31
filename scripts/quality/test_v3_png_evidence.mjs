import {test} from "node:test";
import assert from "node:assert/strict";
import {deflateSync} from "node:zlib";
import {inspectV3Png} from "./inspect_v3_png_evidence.mjs";

// Tiny independent PNG encoder, creating lossless RGBA fixtures for negative tests.
function crc32(buf){
 let c=0xffffffff;
 for(const v of buf){c^=v;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;}
 return (c^0xffffffff)>>>0;
}
function chunk(type,buf){
 const head=Buffer.alloc(8),kind=Buffer.from(type,"ascii"),tail=Buffer.alloc(4);
 head.writeUInt32BE(buf.length,0);kind.copy(head,4);
 tail.writeUInt32BE(crc32(Buffer.concat([kind,buf])),0);
 return Buffer.concat([head,buf,tail]);
}
function makePng(w=64,h=64,{blank=false,filter=0}={}){
 const raw=Buffer.alloc(h*(w*4+1));
 for(let y=0;y<h;y++){
  const start=y*(w*4+1);raw[start]=filter;
  for(let x=0;x<w;x++){
   const offset=start+1+x*4;
   const rgb=blank?0:((x>>3)+(y>>3))%2===0?20:220;
   raw[offset]=rgb;raw[offset+1]=blank?0:((x>>2)%2?30:180);
   raw[offset+2]=blank?0:((y>>2)%2?50:150);
   raw[offset+3]=255;
  }
 }
 const hdr=Buffer.alloc(13);hdr.writeUInt32BE(w,0);hdr.writeUInt32BE(h,4);hdr[8]=8;hdr[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),
  chunk("IHDR",hdr),chunk("IDAT",deflateSync(raw)),chunk("IEND",Buffer.alloc(0))]);
}
test("valid nonblank PNG decodes pixels and reports exact SHA/dimensions",()=>{
 const report=inspectV3Png(makePng(),{width:64,height:64});
 assert.equal(report.width,64);assert.equal(report.height,64);
 assert.ok(report.uniqueSampleColors>=4,report.uniqueSampleColors);
 assert.match(report.sha256,/^[0-9a-f]{64}$/);
 assert.match(report.evidenceLevel,/not-approved/);
});
test("wrong captured dimensions are rejected",()=>assert.throws(
 ()=>inspectV3Png(makePng(),{width:320,height:820}),/wrong dimensions/));
test("blank screenshot is rejected despite valid PNG/CRC",()=>assert.throws(
 ()=>inspectV3Png(makePng(64,64,{blank:true}),{width:64,height:64}),/blank or near-uniform/));
test("truncated PNG is rejected",()=>assert.throws(
 ()=>inspectV3Png(makePng().subarray(0,50),{width:64,height:64}),/truncated|too short/));
test("corrupt chunk CRC is rejected",()=>{
 const img=makePng();img[21]^=3;
 assert.throws(()=>inspectV3Png(img,{width:64,height:64}),/CRC mismatch/);
});
test("missing IEND is rejected",()=>{
 const img=makePng();assert.throws(
  ()=>inspectV3Png(img.subarray(0,img.length-12),{width:64,height:64}),/missing end/);
});
test("invalid PNG scanline filters are rejected",()=>assert.throws(
 ()=>inspectV3Png(makePng(64,64,{filter:7}),{width:64,height:64}),/unknown PNG row filter/));
test("garbage PNG bytes never count as visual evidence",()=>assert.throws(
 ()=>inspectV3Png(Buffer.alloc(120),{width:64,height:64}),/signature/));
