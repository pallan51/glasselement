import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const items=JSON.parse(await fs.readFile(path.join(root,'data/catalogue.json'),'utf8'));
const images=JSON.parse(await fs.readFile(path.join(root,'data/image-manifest.json'),'utf8'));
const origin='https://theglasselement.com';
const modified='2026-10-25';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute=p=>/^https:\/\//.test(p)?p:origin+'/'+p.split('/').map(encodeURIComponent).join('/');
const relative=p=>'/'+p.split('/').map(encodeURIComponent).join('/');
const itemPath=i=>'/items/'+i.id+'.html';
const title=i=>i.brand+' '+i.name;
const fmt=(n,c)=>(c==='THB'?'฿':'$')+n.toLocaleString('en-US');
const offer=i=>i.shopeeUrl?{price:i.shopeePrice,currency:'THB',url:i.shopeeUrl}:{price:i.price,currency:i.currency||'USD',url:origin+itemPath(i)};
const money=i=>fmt(offer(i).price,offer(i).currency);
const categoryNames={eyewear:'Eyewear',cameras:'Cameras',lenses:'Lenses'};
const json=data=>JSON.stringify(data).replace(/</g,'\\u003c');
const categories={
 eyewear:{heading:'Japanese eyewear & sunglasses for sale',description:'Browse Eyevan, Kaneko Optical, Masunaga, Oliver Peoples, Tana Gokoro, Dita and Vuarnet eyewear in Thailand, with exact-item photographs and individual asking prices.',intro:'Japanese frames, distinctive sunglasses and carefully photographed details. Compare the actual pieces, inspect lens and frame close-ups, and confirm the measurements that matter for your fit.',thai:'เลือกดูแว่นตาและแว่นกันแดด พร้อมภาพสินค้าจริง ราคา และข้อมูลสำหรับสอบถามขนาดก่อนซื้อ'},
 cameras:{heading:'Collectible cameras for sale in Thailand',description:'Browse Canon, Fujifilm, Pentax, Olympus, Samsung and Sony cameras in Thailand. View actual photos, included accessories, prices and clearly disclosed repair listings.',intro:'Browse individual DSLRs, mirrorless cameras, compact cameras and film bodies from a private collection. Read the exact condition and included equipment: repair and untested bodies are clearly marked.',thai:'เลือกดูกล้อง DSLR มิเรอร์เลส กล้องคอมแพกต์ และกล้องฟิล์ม มีภาพจริงและแจ้งตำหนิ รวมถึงกล้องสำหรับซ่อมหรืออะไหล่'},
 lenses:{heading:'Camera lenses for sale in Thailand',description:'Find Zeiss Planar ZE, Fujinon XC, Sigma Nikon F, Lumix, Samsung NX and vintage Voigtländer lenses in Thailand. See exact-item photos, mount details and prices.',intro:'Compare fast primes, zooms and vintage lenses by model, mount, condition and what is included. Read the disclosed optical faults and compatibility notes before choosing a lens or converter.',thai:'เลือกดูเลนส์กล้องตามรุ่น เมาท์ ราคา และสภาพ พร้อมภาพจริง แจ้งปัญหาชิ้นเลนส์และอุปกรณ์ที่รวมอย่างชัดเจน'},
 repair:{heading:'Camera & lens repair projects and parts',description:'Shop camera and lens repair projects in Thailand with specific fault disclosures: damaged Canon and Fujifilm bodies, Pentax repair kits, untested film cameras and optical faults.',intro:'A dedicated view of items with known faults, repair needs or untested operation. Each page explains the reported symptom. Repair causes, costs and outcomes are not guaranteed.',thai:'กล้องและเลนส์สำหรับซ่อม บูรณะ หรืออะไหล่ อ่านอาการเสียที่แจ้งในแต่ละรายการก่อนสั่งซื้อ'}
};
const subset=key=>key==='repair'?items.filter(i=>i.repair):items.filter(i=>i.category===key);
const org={'@context':'https://schema.org','@type':'Organization','@id':origin+'/#seller',name:'The Glass Element',url:origin,email:'contact@theglasselement.com',sameAs:['https://shopee.co.th/second_hand_japan'],address:{'@type':'PostalAddress',addressCountry:'TH'}};
const website={'@context':'https://schema.org','@type':'WebSite','@id':origin+'/#website',url:origin,name:'The Glass Element',inLanguage:['en','th'],publisher:{'@id':origin+'/#seller'}};
function breadcrumb(entries){return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:entries.map(([name,url],n)=>({'@type':'ListItem',position:n+1,name,item:origin+url}))};}
function head(pageTitle,description,url,image,schema,type='website'){
 return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>'+e(pageTitle)+'</title><meta name="description" content="'+e(description)+'"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">'+
 (url===origin+'/'?'<meta name="google-site-verification" content="xkRNk9XsntpYj7R1dcKZNFCa5R7m9ZZuGA8lXigYarc">':'')+'<link rel="canonical" href="'+e(url)+'"><link rel="icon" href="/images/favicon-32x32.png"><link rel="stylesheet" href="/css/shop.css">'+
 '<meta property="og:site_name" content="The Glass Element"><meta property="og:type" content="'+type+'"><meta property="og:title" content="'+e(pageTitle)+'"><meta property="og:description" content="'+e(description)+'"><meta property="og:url" content="'+e(url)+'">'+
 (image?'<meta property="og:image" content="'+e(image)+'"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="'+e(image)+'">':'<meta name="twitter:card" content="summary">')+
 '<meta name="twitter:title" content="'+e(pageTitle)+'"><meta name="twitter:description" content="'+e(description)+'">'+
 '<script type="application/ld+json">'+json(schema)+'</script><script src="/js/shop.js" defer></script></head><body>';
}
const header='<a class="skip" href="#main">Skip to content</a><div class="topline">A private collection in Thailand · English / ภาษาไทย</div><header class="site-head"><div class="wrap head-inner"><a href="/" class="wordmark">The Glass Element<span>Eyewear, cameras &amp; lenses</span></a><nav aria-label="Main navigation"><a href="/eyewear/">Eyewear</a><a href="/cameras/">Cameras</a><a href="/lenses/">Lenses</a><a class="desktop" href="/buying.html">How to buy</a></nav></div></header>';
const footer='<footer class="footer"><div class="wrap"><div class="footer-inner"><div class="wordmark">The Glass Element<span>Private collection · Thailand</span></div><a href="mailto:contact@theglasselement.com">contact@theglasselement.com</a><p>© 2026 The Glass Element</p></div><nav class="footer-links" aria-label="Useful links"><a href="/eyewear/">Eyewear</a><a href="/cameras/">Cameras</a><a href="/lenses/">Lenses</a><a href="/repair/">Repair &amp; parts</a><a href="/buying.html">Buying &amp; contact</a><a href="/photo-licensing.html">Photo permissions</a></nav></div></footer></body></html>';
function imageTag(item,index=0,kind='card',eager=false){
 const p=item.photos[index],meta=images[p],v=meta.variants,small=v[0],large=v.at(-1);
 const src=kind==='card'||kind==='thumb'?small:large;
 const alt=kind==='thumb'?'':title(item)+' — actual item, view '+(index+1);
 return '<img '+(kind==='main'?'id="main-photo" ':'')+'src="'+relative(src.path)+'" '+
 (kind==='thumb'?'':'srcset="'+relative(small.path)+' '+small.width+'w, '+relative(large.path)+' '+large.width+'w" sizes="'+(kind==='main'?'(max-width:600px) 100vw, 60vw':'(max-width:600px) 50vw, (max-width:1000px) 50vw, 33vw')+'" ')+
 'alt="'+e(alt)+'" width="'+src.width+'" height="'+src.height+'" loading="'+(eager?'eager':'lazy')+'" '+(kind==='main'?'fetchpriority="high" ':'')+'decoding="async">';
}
function action(item,cls='button',label){
 const dest=item.shopeeUrl||'mailto:contact@theglasselement.com?subject='+encodeURIComponent('Enquiry: '+title(item));
 return item.status==='sold'?'<span class="'+cls+'" aria-disabled="true">Sold</span>':'<a class="'+cls+'" href="'+e(dest)+'"'+(item.shopeeUrl?' target="_blank" rel="noopener" data-outbound="shopee"':'')+'>'+e(label||(item.shopeeUrl?'View / buy on Shopee':'Enquire about this item'))+' &rarr;</a>';
}
function card(i,n,filterable=true){
 const terms=[title(i),i.model,...(i.aliases||[]),i.description,i.thaiDescription].join(' ').toLowerCase();
 return '<article class="product-card"'+(filterable?' data-product data-category="'+i.category+'" data-condition="'+(i.repair?'repair':'standard')+'" data-status="'+i.status+'" data-search="'+e(terms)+'" data-price="'+offer(i).price+'" data-currency="'+offer(i).currency+'" data-order="'+n+'"':'')+'>'+
 '<a class="card-image" href="'+itemPath(i)+'" aria-label="View '+e(title(i))+'">'+imageTag(i,0,'card',n<2)+'<span class="card-label'+(i.repair?' fault-label':'')+'">'+e(i.repair?i.conditionLabel:i.photos.length+' item photos')+'</span></a>'+
 '<p class="brand">'+e(i.brand)+'</p><h3><a href="'+itemPath(i)+'">'+e(i.name)+'</a></h3><p class="card-condition">'+e(i.conditionLabel||'See condition details')+'</p>'+
 '<div class="card-bottom"><span class="price">'+money(i)+'<small>'+offer(i).currency+'</small></span><a class="text-link" href="'+itemPath(i)+'">Details &amp; photos &rarr;</a></div>'+
 (i.shopeeUrl?'<p class="card-buy">'+action(i,'text-link','Buy on Shopee')+'</p>':'')+'</article>';
}
function tools(home=false){
 return '<div class="tools'+(!home?' category-tools':'')+'">'+(home?'<div class="tabs" role="group" aria-label="Filter collection"><button type="button" data-filter="all" aria-pressed="true">All pieces</button>'+Object.entries(categoryNames).map(([k,v])=>'<button type="button" data-filter="'+k+'" aria-pressed="false">'+v+'</button>').join('')+'</div>':'')+
 '<div class="control search"><label for="search">Find a piece / ค้นหา</label><input id="search" type="search" placeholder="Brand, model or mount" autocomplete="off"></div>'+
 '<div class="control"><label for="condition">Condition</label><select id="condition"><option value="all">All listed conditions</option><option value="standard">Exclude repair &amp; untested</option><option value="repair">Repair, faults or untested</option></select></div>'+
 '<div class="control"><label for="sort">Sort by</label><select id="sort"><option value="collection">Collection order</option><option value="low">Price: currency, low to high</option><option value="high">Price: currency, high to low</option><option value="name">Brand / name</option></select></div></div>';
}
function collection(list,home=false){
 return '<section class="wrap catalogue" id="collection" aria-labelledby="collection-heading"><span id="eyewear"></span><span id="cameras"></span><span id="lenses"></span><span id="vault"></span>'+
 '<div class="collection-heading"><h2 id="collection-heading">'+(home?'Find your next piece':'Available listings')+'</h2><span class="small" id="result-count" aria-live="polite">'+list.length+' items</span></div>'+tools(home)+
 '<div class="grid" id="product-grid">'+list.map((i,n)=>card(i,n)).join('')+'</div><p id="empty" class="empty" hidden>No matching items. Try another spelling, model name or condition filter.</p><noscript><p class="small">Every listing is shown. Open a product for photos, condition and purchase details.</p></noscript></section>';
}
const trust='<div class="wrap trust-strip"><span>Exact-item photographs</span><span>Condition &amp; contents disclosed</span><span>Shopee checkout on linked listings</span></div>';
const buying='<section class="buying" id="how-to-buy"><div class="wrap buying-grid"><div><p class="eyebrow">From browsing to buying</p><h2>See it. Check it.<br>Make it yours.</h2></div><div class="steps"><div><span class="step-no">01</span><h3>Inspect the exact item</h3><p>View its photographs, condition, included equipment and any faults. Ask for more details if needed.</p></div><div><span class="step-no">02</span><h3>Choose your buying route</h3><p>Use the product’s Shopee link to check the current option and checkout price, or send a direct enquiry.</p></div><div><span class="step-no">03</span><h3>Confirm the total</h3><p>Check availability, delivery and the payment and return terms for your chosen buying route before paying.</p></div></div></div></section>';
const links='<nav class="wrap category-links" aria-label="Browse collections">'+Object.entries(categories).map(([k,v])=>'<a href="/'+k+'/">'+(k==='repair'?'Repair &amp; parts':categoryNames[k])+' <span>'+subset(k).length+'</span></a>').join('')+'</nav>';
const ordered=[...items].sort((a,b)=>Number(Boolean(a.repair))-Number(Boolean(b.repair))||Object.keys(categoryNames).indexOf(a.category)-Object.keys(categoryNames).indexOf(b.category)||a.brand.localeCompare(b.brand)||a.name.localeCompare(b.name));
function listSchema(list,name,url){
 return {'@context':'https://schema.org','@type':'CollectionPage','@id':url+'#collection',url,name,inLanguage:['en','th'],isPartOf:{'@id':origin+'/#website'},mainEntity:{'@type':'ItemList',numberOfItems:list.length,itemListElement:list.map((i,n)=>({'@type':'ListItem',position:n+1,url:origin+itemPath(i),name:title(i)}))}};
}
const homeDescription='Shop collectible cameras, camera lenses and Japanese eyewear for sale in Thailand. See '+items.length+' individual listings, real item photos, prices and Shopee purchase links.';
await fs.writeFile(path.join(root,'index.html'),head('Cameras, Lenses & Japanese Eyewear for Sale in Thailand | The Glass Element',homeDescription,origin+'/',absolute(items[0].photos[0]),[org,website,listSchema(ordered,'The Glass Element collection',origin+'/')])+header+
 '<main id="main"><section class="wrap intro"><div><p class="eyebrow">Cameras · Lenses · Eyewear</p><h1>Cameras, lenses &amp;<br><em>Japanese eyewear.</em></h1></div><div class="intro-copy"><p>A private collection in Thailand, ready for its next chapter. Find the exact model you want, inspect the actual item and buy through the linked Shopee listing or enquire directly.</p><p lang="th">กล้อง เลนส์ และแว่นตาจากคอลเล็กชันส่วนตัวในไทย ดูภาพจริง อ่านสภาพและอุปกรณ์ที่รวม แล้วเลือกซื้อผ่าน Shopee หรือสอบถามโดยตรง</p><div class="intro-actions"><a class="button" href="/cameras/">Shop cameras &rarr;</a><a class="button secondary" href="/eyewear/">Shop eyewear &rarr;</a></div></div></section>'+trust+links+collection(ordered,true)+buying+'</main>'+footer);
for(const [key,c] of Object.entries(categories)){
 const list=ordered.filter(i=>key==='repair'?i.repair:i.category===key),url=origin+'/'+key+'/';
 await fs.mkdir(path.join(root,key),{recursive:true});
 await fs.writeFile(path.join(root,key,'index.html'),head(c.heading+' | The Glass Element',c.description,url,list[0]?absolute(list[0].photos[0]):null,[org,website,listSchema(list,c.heading,url),breadcrumb([['Collection','/'],[c.heading,'/'+key+'/']])])+header+
 '<main id="main"><section class="wrap category-intro"><p class="eyebrow">The Glass Element · Thailand</p><h1>'+e(c.heading)+'</h1><p>'+e(c.intro)+'</p><p lang="th">'+e(c.thai)+'</p></section>'+links+collection(list)+buying+'</main>'+footer);
}
function pictureSchema(i,p,n){
 return {'@type':'ImageObject','@id':origin+itemPath(i)+'#photo-'+(n+1),contentUrl:absolute(p),url:absolute(p),caption:title(i)+' — item photograph '+(n+1),width:images[p].width,height:images[p].height,creditText:'The Glass Element',copyrightNotice:'© The Glass Element. All rights reserved.',license:origin+'/photo-licensing.html',acquireLicensePage:origin+'/photo-licensing.html',creator:{'@type':'Organization',name:'The Glass Element'}};
}
const pairing={
 'samsung-nx300':['samsung-nx-18-55-ois'],
 'samsung-nx-18-55-ois':['samsung-nx300'],
 'fujifilm-x-e2s':['fujifilm-xc-35mm-f2'],
 'fujifilm-xc-35mm-f2':['fujifilm-x-e2s'],
 'voigtlander-ultramatic':['voigtlander-septon-50mm-f2'],
 'voigtlander-septon-50mm-f2':['voigtlander-ultramatic']
};
await fs.mkdir(path.join(root,'items'),{recursive:true});
for(const i of items){
 const url=origin+itemPath(i),label=title(i),sale=offer(i),photoObjects=i.photos.map((p,n)=>pictureSchema(i,p,n));
 const meta=(i.model||label)+' for sale in Thailand. '+money(i)+' '+sale.currency+'. '+(i.repair?i.defects+'. ':i.conditionLabel+'. ')+i.photos.length+' item photos. '+(i.shopeeUrl?'View details and buy on Shopee.':'Enquire with the seller.');
 const schema={'@context':'https://schema.org','@type':'Product','@id':url+'#product',url,name:label,model:i.model||i.name,sku:'TGE-'+i.id,category:categoryNames[i.category],brand:{'@type':'Brand',name:i.brand},description:i.description,image:i.photos.map(absolute),...(i.itemCondition?{itemCondition:'https://schema.org/'+i.itemCondition}:{}),additionalProperty:[['Condition as listed',i.conditionLabel],['Included / excluded',i.included],...(i.defects?[['Disclosed issues',i.defects]]:[])].filter(([,v])=>v).map(([name,value])=>({'@type':'PropertyValue',name,value})),offers:{'@type':'Offer','@id':url+'#offer',url:sale.url,price:sale.price,priceCurrency:sale.currency,availability:'https://schema.org/'+({available:'InStock',reserved:'OutOfStock',sold:'SoldOut'}[i.status]),...(i.itemCondition?{itemCondition:'https://schema.org/'+i.itemCondition}:{}),seller:{'@id':origin+'/#seller'}}};
 const webPage={'@context':'https://schema.org','@type':'ItemPage','@id':url+'#page',url,name:label+' for sale in Thailand',dateModified:i.dateModified||modified,inLanguage:['en','th'],isPartOf:{'@id':origin+'/#website'},mainEntity:{'@id':url+'#product'},primaryImageOfPage:{'@id':url+'#photo-1'}};
 const mail='mailto:contact@theglasselement.com?subject='+encodeURIComponent('Enquiry: '+label)+'&body='+encodeURIComponent('Hello,\n\nI am interested in '+label+'.\n'+url+'\n\nPlease confirm current availability, condition, included accessories and the total for my destination.\n\nMy country / postcode:\n\nThank you.');
 const facts=[['Model',i.model||i.name],['Listed condition',i.conditionLabel||'Confirm with seller'],...(i.included?[['Included / excluded',i.included]]:[]),...(i.defects?[['Disclosed issues',i.defects]]:[]),...i.details.filter(([k])=>!['Model','Condition as listed','Included / excluded','Disclosed issues','Listing details','Price source'].includes(k)),['Location','Thailand']];
 const relatedIds=pairing[i.id]||[];
 const related=items.filter(o=>o.id!==i.id).sort((a,b)=>Number(relatedIds.includes(b.id))-Number(relatedIds.includes(a.id))||Number(b.category===i.category)-Number(a.category===i.category)||Number(Boolean(a.repair))-Number(Boolean(b.repair))).slice(0,3);
 const faqAnswer=i.repair?'This is listed with the following issue or limitation: '+i.defects+'. It is not offered as a fully working, tested item.':(i.conditionLabel||'Ask the seller for a current condition check')+'. '+(i.defects?'Also note: '+i.defects+'. ':'')+'The description records what the seller reported; ask for a current check before payment.';
 const directDifference=i.shopeeUrl&&(i.currency||'USD')!=='THB'?'<p class="small direct-price">Direct-enquiry asking price: '+fmt(i.price,i.currency||'USD')+' '+(i.currency||'USD')+'. The Shopee price above applies to that marketplace listing and selected option.</p>':'';
 const details=head((i.seoTitle||((i.model||label)+(i.repair?' · '+i.conditionLabel:'')+' for Sale in Thailand'))+' | The Glass Element',meta,url,absolute(images[i.photos[0]].variants.at(-1).path),[org,website,webPage,schema,breadcrumb([['Collection','/'],[categoryNames[i.category],'/'+i.category+'/'],[label,itemPath(i)]]),...photoObjects.map(o=>({'@context':'https://schema.org',...o}))],'product')+header+
 '<main id="main" class="wrap"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Collection</a> / <a href="/'+i.category+'/">'+categoryNames[i.category]+'</a> / '+e(i.model||label)+'</nav>'+
 '<div class="mobile-product-summary"><p>'+e(label)+'</p><span class="small">'+e(i.conditionLabel||'See condition details')+'</span></div><div class="product-layout"><section aria-label="Item photographs"><a class="main-photo" id="full-photo" href="'+absolute(i.photos[0])+'" target="_blank" rel="noopener" aria-label="Open original photograph full size">'+imageTag(i,0,'main',true)+'</a><p class="photo-note">'+i.photos.length+' photographs of this item'+(i.photoKind==='marketplace'?' from our Shopee listing':'')+'. Choose a view; open the main image for the original.</p><div class="thumbnails" aria-label="Choose photograph">'+i.photos.map((p,n)=>'<a class="thumbnail" href="'+absolute(p)+'" data-gallery-image data-display="'+relative(images[p].variants.at(-1).path)+'" data-alt="'+e(label)+' — item photograph '+(n+1)+'" aria-label="View photograph '+(n+1)+'" aria-current="'+(n===0)+'">'+imageTag(i,n,'thumb')+'</a>').join('')+'</div></section>'+
 '<section class="item-info"><p class="eyebrow">'+e(i.brand)+' / '+categoryNames[i.category]+'</p><h1>'+e(label)+'</h1><p class="item-price">'+money(i)+'<small>'+sale.currency+'</small></p>'+
 '<p class="status">'+(i.shopeeUrl?'Shopee listing price':'Direct-enquiry asking price')+' · confirm current availability</p>'+directDifference+
 (i.repair?'<div class="fault-notice"><strong>'+e(i.conditionLabel)+'</strong><p>'+e(i.defects)+'</p></div>':'')+
 '<div class="item-actions primary-actions">'+action(i)+ '<a class="button secondary" href="'+e(mail)+'">Ask about this item</a></div>'+
 '<p class="small">'+(i.shopeeUrl?'Checkout takes place on Shopee. Confirm the selected option, current price, delivery and return terms there.':'Enquire to confirm availability, condition, payment and delivery before paying.')+'</p>'+
 '<p class="description">'+e(i.description)+'</p><p class="thai-summary" lang="th">'+e(i.thaiDescription||'')+'</p>'+
 '<dl class="facts">'+facts.map(([k,v])=>'<div><dt>'+e(k)+'</dt><dd>'+e(v)+'</dd></div>').join('')+'</dl>'+
 '<p class="small">Listing details checked: 25 October 2026.'+(i.shopeeUrl?' Shopee listing price: '+money(i)+' THB; promotions and options may change.':'')+'</p>'+
 (i.aliases?.length?'<p class="model-aliases"><strong>Other model names / spellings:</strong> '+i.aliases.map(e).join(' · ')+'</p>':'')+
 '<div class="item-actions"><button class="button secondary copy-button" type="button" data-copy="url">Copy item link</button><a class="text-link" href="/buying.html">Buying, delivery &amp; contact</a></div><span id="copy-result" class="copy-result" role="status"></span></section></div>'+
 '<section class="product-faq"><p class="eyebrow">Questions before buying</p><h2>About this '+(i.category==='eyewear'?'piece':i.category==='lenses'?'lens':'camera')+'</h2>'+
 '<details open><summary>What is the condition of this '+e(i.model||i.name)+'?</summary><p>'+e(faqAnswer)+'</p></details>'+
 '<details><summary>What is included in the price?</summary><p>'+e(i.included||'Ask the seller to confirm the exact contents, case or accessories before buying.')+'</p></details>'+
 '<details><summary>How do I buy it in Thailand or enquire from overseas?</summary><p>'+e(i.shopeeUrl?'Use the Shopee link to see current checkout availability, delivery coverage and terms. For destinations or questions not covered by that listing, email the seller with the product name and your destination.':'Email the seller with the product name and your destination. Confirm availability, the final total and delivery terms before paying.')+'</p></details></section>'+
 '<section class="related"><p class="eyebrow">Keep looking</p><h2>Related pieces in the collection</h2><div class="grid">'+related.map((o,n)=>card(o,n,false)).join('')+'</div></section>'+
 '<div class="mobile-buy"><span>'+money(i)+' <small>'+sale.currency+'</small></span>'+action(i,'button',i.shopeeUrl?'Buy on Shopee':'Enquire')+'</div></main>'+footer;
 await fs.writeFile(path.join(root,'items',i.id+'.html'),details);
}
const staticPages={
 'buying.html':{title:'Buying, delivery & contact',description:'How to buy from The Glass Element collection in Thailand: inspect the item, use its Shopee link or send an enquiry, and confirm the total, condition and delivery terms.',html:'<p>The Glass Element is a private collection of cameras, lenses and eyewear based in Thailand. Each page describes one item or an explicitly stated kit, with photographs and a listed asking price.</p><h2>Buy through the linked Shopee listing</h2><p>For products with a Shopee button, that link opens our listing at <a href="https://shopee.co.th/second_hand_japan" target="_blank" rel="noopener">second_hand_japan</a>. Check the selected option, current availability, final price and the shipping and return terms shown at checkout. Promotions can change. Product descriptions and dated prices on this site are snapshots, not a live inventory feed.</p><h2>Direct enquiries</h2><p>Email <a href="mailto:contact@theglasselement.com">contact@theglasselement.com</a> with the exact product name or page link, your questions and destination country/postcode. Confirm that you have received a reply before making a payment. Direct-enquiry asking prices are identified separately where they differ from a Shopee promotion.</p><h2>Condition and what is included</h2><p>Used items may have cosmetic or functional wear. Repair and untested items have a visible label and specific disclosures. Read the contents list: lenses, straps, chargers and cases shown in photographs are included only when the listing says so. Ask for a current functional check or close-ups when needed.</p><h2>Delivery, payment and returns</h2><p>Shopee orders follow the options and terms available on the actual Shopee order. For a direct transaction, delivery coverage, charges, payment arrangements and any return terms must be agreed with the seller before payment. No universal delivery, return period or warranty is promised by this catalogue.</p><p lang="th">สินค้าจากคอลเล็กชันส่วนตัวในไทย กรุณาอ่านสภาพ ตำหนิ และอุปกรณ์ที่รวมก่อนซื้อ สำหรับรายการที่มีลิงก์ Shopee ให้ตรวจสอบตัวเลือก ราคา ค่าส่ง และเงื่อนไขล่าสุดที่หน้าสั่งซื้อ หากสอบถามโดยตรง ให้ระบุชื่อสินค้าและปลายทางก่อนตกลงชำระเงิน</p>'},
 'photo-licensing.html':{title:'Product photograph permissions',description:'Photograph credits and permission requests for The Glass Element product photographs. Contact the seller for reuse permission for a specific original image.',html:'<p>Product photographs in this catalogue come from The Glass Element collection and its second_hand_japan shop listings. Full-size originals remain linked from each product gallery.</p><p>© The Glass Element. All rights reserved. Displaying a photograph here does not grant permission to republish, edit, sell or use it to advertise a different item. Search engines may index and display previews to help people discover these product pages.</p><h2>Request permission</h2><p>For a licence or other reuse permission, email <a href="mailto:contact@theglasselement.com?subject=Product%20photograph%20permission">contact@theglasselement.com</a> with the product page, specific photograph and intended use. Permission and any terms must be confirmed in writing; no permission is granted automatically by submitting a request.</p>'}
};
for(const [filename,p] of Object.entries(staticPages)){
 const url=origin+'/'+filename;
 await fs.writeFile(path.join(root,filename),head(p.title+' | The Glass Element',p.description,url,null,[org,website,{'@context':'https://schema.org','@type':'WebPage',url,name:p.title},breadcrumb([['Collection','/'],[p.title,'/'+filename]])])+header+'<main id="main" class="wrap prose"><p class="eyebrow">The Glass Element · Thailand</p><h1>'+e(p.title)+'</h1>'+p.html+'</main>'+footer);
}
const urls=[{url:origin+'/',modified},...Object.keys(categories).map(k=>({url:origin+'/'+k+'/',modified})),...Object.keys(staticPages).map(k=>({url:origin+'/'+k,modified})),...items.map(i=>({url:origin+itemPath(i),modified:i.dateModified||modified,images:i.photos})),{url:origin+'/posts/ayutthaya-field-test.html'}];
await fs.writeFile(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'+urls.map(x=>'  <url><loc>'+e(x.url)+'</loc>'+(x.modified?'<lastmod>'+x.modified+'</lastmod>':'')+(x.images||[]).map(p=>'<image:image><image:loc>'+e(absolute(p))+'</image:loc></image:image>').join('')+'</url>').join('\n')+'\n</urlset>\n');
await fs.writeFile(path.join(root,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n');
console.log('Built '+items.length+' product pages, 4 collection pages, buying/photo pages and image sitemap.');
