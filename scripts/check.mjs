
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await fs.readFile(path.join(root,'data/catalogue.json'),'utf8'));
const ids=new Set();
const files=['index.html',...data.map(item=>'items/'+item.id+'.html')];
let checks=0;
for(const item of data){
 assert(!ids.has(item.id),'Duplicate slug'); ids.add(item.id);
 assert(/^[a-z0-9-]+$/.test(item.id),'Invalid slug');
 assert(Number.isFinite(item.price)&&item.price>0,'Invalid price');
 assert(['available','reserved','sold'].includes(item.status),'Invalid status');
 assert(item.photos.length>0,'Missing imagery');
 const html=await fs.readFile(path.join(root,'items',item.id+'.html'),'utf8');
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(match=>JSON.parse(match[1]));
 const product=scripts.find(s=>s['@type']==='Product');
 assert.equal(product.offers.price,item.price,'Price mismatch');
 assert.equal(product.offers.priceCurrency,item.currency||'USD');
 assert(html.includes((item.currency==='THB'?'฿':'$')+item.price.toLocaleString('en-US')+'<small>'+(item.currency||'USD')+'</small>'),'Missing visible price');
 assert(html.includes('mailto:contact@theglasselement.com?subject='),'Missing item enquiry');
 if(item.photoKind==='illustration'){
  assert(!product.image,'Illustration wrongly advertised as actual-item product photo');
  assert(html.includes('The image above is an illustration.'),'Missing illustration disclosure');
 }
 checks+=7;
}
for(const file of files){
 const html=await fs.readFile(path.join(root,file),'utf8');
 assert.equal((html.match(/<h1>/g)||[]).length,1,'Incorrect heading count: '+file);
 for(const [,href] of html.matchAll(/href="([^"]*)"/g)){
  if(href.startsWith('/')&&!href.startsWith('//')){
   const target=href.split('#')[0]||'/';
   if(target.startsWith('/images/'))continue;
   await fs.access(path.join(root,target==='/'?'index.html':target.slice(1)));
  }
 }
 checks++;
}
const home=await fs.readFile(path.join(root,'index.html'),'utf8');
assert.equal((home.match(/data-product /g)||[]).length,data.length,'Missing static products');
assert(!home.includes('docs.google.com'),'Unexpected runtime spreadsheet dependency');
const map=await fs.readFile(path.join(root,'sitemap.xml'),'utf8');
assert(!map.includes('hokkaido.html'),'Stale sitemap entry');
for(const item of data)assert(map.includes('/items/'+item.id+'.html'),'Missing sitemap item');
console.log('Passed '+checks+' content, link and price checks for '+data.length+' items.');

const sources=new Set();
for(const item of data.filter(x=>x.shopeeUrl)){
 assert(!sources.has(item.shopeeUrl),'Duplicate Shopee listing');sources.add(item.shopeeUrl);
 assert(/^https:\/\/shopee.co.th\/product\/1470634569\/\d+$/.test(item.shopeeUrl),'Invalid shop link');
 assert(['cameras','lenses','eyewear'].includes(item.category),'Unexpected import category');
 const html=await fs.readFile(path.join(root,'items',item.id+'.html'),'utf8');
 assert(html.includes(item.shopeeUrl),'Missing purchase link');
 assert(html.includes('Shopee listing price:'),'Missing source price disclosure');
 assert(!html.includes('Illustrative image'),'Stale photo disclosure');
 await fs.access(path.join(root,item.photos[0]));
}
console.log('Passed import provenance, category, duplicate, source-link and photograph checks for '+sources.size+' Shopee records.');
