import { createServer } from 'node:http';
import { existsSync, statSync, createReadStream } from 'node:fs';
import { resolve, sep, extname, join } from 'node:path';

const root=resolve(process.argv[2]||'');
const origin=new URL(process.argv[3]||'http://127.0.0.1:0');
const prefix='/Bluent';
if(!existsSync(join(root,'index.html'))) throw new Error(`Release wwwroot has no index.html: ${root}`);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json','.woff':'font/woff','.woff2':'font/woff2','.dll':'application/octet-stream','.dat':'application/octet-stream','.bin':'application/octet-stream','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const server=createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,origin).pathname); } catch { res.writeHead(400);res.end();return; }
  if(pathname==='/'){res.writeHead(302,{location:prefix+'/'});res.end();return;}
  if(pathname!==prefix&&!pathname.startsWith(prefix+'/')){res.writeHead(404);res.end('Not found');return;}
  let rel=pathname.slice(prefix.length).replace(/^\/+/, '');
  if(!rel||rel.endsWith('/')) rel=join(rel,'index.html');
  const candidate=resolve(root,rel);
  if(candidate!==root&&!candidate.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  let target=candidate;
  if(!existsSync(target)||!statSync(target).isFile()){
    if(!extname(rel)) target=join(root,'index.html');
    else {res.writeHead(404);res.end('Not found');return;}
  }
  const headers={'content-type':types[extname(target).toLowerCase()]||'application/octet-stream','cache-control':'no-store'};
  res.writeHead(200,headers);
  if(req.method==='HEAD'){res.end();return;}
  createReadStream(target).on('error',()=>{if(!res.headersSent)res.writeHead(500);res.end();}).pipe(res);
});
server.listen(Number(origin.port),origin.hostname,()=>console.log(`Serving Release WASM ${root} at ${origin.origin}${prefix}/`));
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>server.close(()=>process.exit(0)));
