
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
 try{
  const requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const filename=path.resolve(root,'.'+(requestPath==='/'?'/index.html':requestPath));
  if(!filename.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  const data=await fs.readFile(filename);
  res.writeHead(200,{'Content-Type':mime[path.extname(filename).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(8080,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:8080'));
