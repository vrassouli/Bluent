// #425: fail-closed PNG byte/dimension/content integrity, not a design diff.
// Uses Node built-ins only. Never treats a screenshot as approved visual parity.
import {inflateSync} from "node:zlib";
import {createHash} from "node:crypto";

const SIGNATURE=Buffer.from([137,80,78,71,13,10,26,10]);
const CRC_TABLE=Uint32Array.from({length:256},(_,n)=>{
 let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);return c>>>0;
});
function crc32(buffer){
 let c=0xffffffff;
 for(const b of buffer)c=CRC_TABLE[(c^b)&255]^(c>>>8);
 return (c^0xffffffff)>>>0;
}
function bad(msg){throw Error("Invalid screenshot PNG: "+msg);}
export function inspectV3Png(buffer,{width:wantWidth,height:wantHeight}){
 if(!Buffer.isBuffer(buffer)||buffer.length<60)bad("missing or too short");
 if(!buffer.subarray(0,8).equals(SIGNATURE))bad("signature");
 if(!Number.isInteger(wantWidth)||!Number.isInteger(wantHeight)||wantWidth<1||wantHeight<1)bad("expected dimensions");
 let pos=8,header=null,ended=false,seenIdat=false;
 const data=[];
 while(pos<buffer.length){
  if(pos+12>buffer.length)bad("truncated chunk header");
  const length=buffer.readUInt32BE(pos),type=buffer.toString("ascii",pos+4,pos+8);
  if(length>buffer.length-pos-12)bad("truncated "+type);
  const start=pos+8,end=start+length;
  if(crc32(buffer.subarray(pos+4,end))!==buffer.readUInt32BE(end))bad(type+" CRC mismatch");
  if(!header&&type!=="IHDR")bad("missing initial IHDR");
  if(type==="IHDR"){
   if(header||length!==13)bad("repeated or malformed IHDR");
   header={width:buffer.readUInt32BE(start),height:buffer.readUInt32BE(start+4),
    depth:buffer[start+8],color:buffer[start+9],compression:buffer[start+10],
    filter:buffer[start+11],interlace:buffer[start+12]};
  }else if(type==="IDAT"){
   if(!header||ended)bad("out of order IDAT");
   seenIdat=true;data.push(buffer.subarray(start,end));
  }else if(type==="IEND"){
   if(length!==0||!seenIdat)bad("IEND before pixel data");
   ended=true;
   if(end+4!==buffer.length)bad("trailing bytes");
  }else if(type==="PLTE"){
   // RGB/RGBA Chrome screenshot color types do not require a palette.
  }else if(!/^[a-zA-Z]{4}$/.test(type))bad("invalid chunk type");
  pos=end+4;
  if(ended)break;
 }
 if(!ended||!header)bad("missing end");
 if(header.width!==wantWidth||header.height!==wantHeight)bad("wrong dimensions");
 if(header.depth!==8||![2,6].includes(header.color)||header.compression||header.filter||header.interlace)
  bad("unsupported/non-RGB screenshot format");
 const bpp=header.color===2?3:4,stride=header.width*bpp;
 if(stride>8_000_000||header.height>10000)bad("unexpectedly large screenshot");
 const expected=(stride+1)*header.height;
 let pixels;
 try{pixels=inflateSync(Buffer.concat(data),{maxOutputLength:expected+1});}
 catch(e){bad("IDAT inflate failed: "+String(e.message).slice(0,90));}
 if(pixels.length!==expected)bad("decompressed scanline count");
 const prev=Buffer.alloc(stride),curr=Buffer.alloc(stride),palette=new Set();
 let off=0,sampleCount=0;
 for(let y=0;y<header.height;y++){
  const filter=pixels[off++];
  if(filter>4)bad("unknown PNG row filter");
  for(let i=0;i<stride;i++){
   const x=pixels[off++],a=i>=bpp?curr[i-bpp]:0,b=prev[i],c=i>=bpp?prev[i-bpp]:0;
   let predictor=0;
   if(filter===1)predictor=a;
   if(filter===2)predictor=b;
   if(filter===3)predictor=Math.floor((a+b)/2);
   if(filter===4){
    const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);
    predictor=da<=db&&da<=dc?a:db<=dc?b:c;
   }
   curr[i]=(x+predictor)&255;
  }
  if(y%13===0||y===header.height-1){
   for(let x=0;x<header.width;x+=11){
    const k=x*bpp;
    palette.add(curr[k]+","+curr[k+1]+","+curr[k+2]+","+(bpp===4?curr[k+3]:255));
    sampleCount++;
   }
  }
  curr.copy(prev);
 }
 if(sampleCount<4||palette.size<4)bad("blank or near-uniform image");
 return {width:header.width,height:header.height,bytes:buffer.length,
  sha256:createHash("sha256").update(buffer).digest("hex"),
  sampledPixels:sampleCount,uniqueSampleColors:palette.size,
  evidenceLevel:"valid-nonblank-png-only-not-approved-visual-parity"};
}
