import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await fs.readFile(path.join(root,'data/catalogue.json'),'utf8'));
const imageData=JSON.parse(await fs.readFile(path.join(root,'data/image-manifest.json'),'utf8'));
const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const origin='https://theglasselement.com';
const primary=i=>i.shopeeUrl?{price:i.shopeePrice,currency:'THB',url:i.shopeeUrl}:{price:i.price,currency:i.currency||'USD',url:origin+'/items/'+i.id+'.html'};
const ids=new Set(),sources=new Set();
const files=['index.html','cameras/index.html','lenses/index.html','eyewear/index.html','repair/index.html','buying.html','photo-licensing.html',...data.map(i=>'items/'+i.id+'.html')];
let photos=0;
for(const i of data){
 assert(!ids.has(i.id),'Duplicate slug: '+i.id);ids.add(i.id);
 assert(/^[a-z0-9-]+$/.test(i.id));
 const sale=primary(i);
 assert(Number.isFinite(sale.price)&&sale.price>0);
 assert(['available','reserved','sold'].includes(i.status));
 const html=await fs.readFile(path.join(root,'items',i.id+'.html'),'utf8');
 const schema=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>JSON.parse(m[1]));
 const product=schema.find(x=>x['@type']==='Product');
 assert(product,'Missing product schema');
 assert.equal(product.offers.price,sale.price);
 assert.equal(product.offers.priceCurrency,sale.currency);
 assert.equal(product.offers.url,sale.url);
 assert(html.includes((sale.currency==='THB'?'฿':'$')+sale.price.toLocaleString('en-US')+'<small>'+sale.currency+'</small>'),'Visible / structured price mismatch');
 assert(html.includes('<h1>'+escape(i.brand+' '+i.name)+'</h1>'),'Product H1 lacks exact brand and model');
 assert(html.includes('lang="th"'),'Missing Thai text');
 assert(schema.some(x=>x['@type']==='BreadcrumbList'),'Missing breadcrumb');
 assert(!product.aggregateRating&&!product.review,'Unexpected review data');
 const photoSchema=schema.filter(x=>x['@type']==='ImageObject');
 assert.equal(photoSchema.length,i.photos.length);
 for(const p of photoSchema){
  assert.equal(p.license,origin+'/photo-licensing.html');
  assert.equal(p.acquireLicensePage,origin+'/photo-licensing.html');
  assert(p.copyrightNotice&&p.contentUrl&&p.width>0&&p.height>0);
 }
 if(i.shopeeUrl){
  assert(!sources.has(i.shopeeUrl),'Duplicate source: '+i.id);sources.add(i.shopeeUrl);
  assert(/^https:\/\/shopee.co.th\/product\/1470634569\/\d+$/.test(i.shopeeUrl));
  assert(html.includes(i.shopeeUrl),'Missing Shopee purchase link');
  assert(html.includes('Shopee listing price:'));
 }
 if(i.repair){
  assert(i.defects&&html.includes(escape(i.defects)),'Missing exact fault disclosure');
  assert(html.includes('class="fault-notice"'),'Fault not prominent');
 }
 for(const p of i.photos){
  await fs.access(path.join(root,p));
  assert(imageData[p],'Image missing from optimization manifest: '+p);
  for(const v of imageData[p].variants){
   await fs.access(path.join(root,v.path));
   assert(v.width>0&&v.height>0&&v.bytes>0);
  }
  photos++;
 }
}
const titles=new Set(),descriptions=new Set();
for(const file of files){
 const html=await fs.readFile(path.join(root,file),'utf8');
 assert.equal((html.match(/<h1>/g)||[]).length,1,'Incorrect H1 count: '+file);
 const title=html.match(/<title>(.*?)<\/title>/)?.[1],desc=html.match(/<meta name="description" content="([^"]*)"/)?.[1];
 assert(title&&desc,'Missing metadata: '+file);
 assert(!titles.has(title),'Duplicate title: '+file);titles.add(title);
 assert(!descriptions.has(desc),'Duplicate meta description: '+file);descriptions.add(desc);
 assert(/<link rel="canonical" href="https:\/\/theglasselement.com\//.test(html));
 assert(!html.includes('noindex'));
 assert(!html.includes('Illustrative image'),'Stale illustration disclosure');
 for(const [,value] of html.matchAll(/(?:href|src)="([^"]*)"/g)){
  if(!value.startsWith('/')||value.startsWith('//'))continue;
  const target=decodeURIComponent(value.split(/[?#]/)[0]);
  await fs.access(path.join(root,target==='/'?'index.html':target.endsWith('/')?target.slice(1)+'index.html':target.slice(1)));
 }
}
for(const key of ['cameras','lenses','eyewear','repair']){
 const html=await fs.readFile(path.join(root,key,'index.html'),'utf8');
 const expected=data.filter(i=>key==='repair'?i.repair:i.category===key);
 assert.equal((html.match(/data-product /g)||[]).length,expected.length,'Wrong category count');
 for(const i of expected)assert(html.includes('/items/'+i.id+'.html'),'Missing product category link');
}
const home=await fs.readFile(path.join(root,'index.html'),'utf8');
assert.equal((home.match(/data-product /g)||[]).length,data.length);
const sitemap=await fs.readFile(path.join(root,'sitemap.xml'),'utf8');
for(const file of files){
 const url=origin+'/'+(file==='index.html'?'':file.endsWith('/index.html')?file.replace('index.html',''):file);
 assert(sitemap.includes('<loc>'+url+'</loc>'),'URL missing from sitemap: '+file);
}
assert.equal((sitemap.match(/<image:image>/g)||[]).length,photos);
const robots=await fs.readFile(path.join(root,'robots.txt'),'utf8');
assert(robots.includes('User-agent: *\nAllow: /'));
assert(!robots.includes('Disallow'));
assert(robots.includes(origin+'/sitemap.xml'));
console.log('Passed search, pricing, condition, structured-data, image, sitemap and internal-link checks for '+data.length+' products, '+photos+' photographs and '+files.length+' pages.');
