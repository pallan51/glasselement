'use strict';
document.documentElement.classList.add('js');
const cards=[...document.querySelectorAll('[data-product]')];
const search=document.querySelector('#search');
const sort=document.querySelector('#sort');
const condition=document.querySelector('#condition');
const tabs=[...document.querySelectorAll('[data-filter]')];
const normalize=text=>text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}\p{M}]/gu,'');
let category=['eyewear','cameras','lenses'].includes(location.hash.slice(1))?location.hash.slice(1):location.hash==='#vault'?'cameras':'all';
if(search)search.value=new URLSearchParams(location.search).get('q')||'';
function updateCatalogue(){
 const terms=(search?.value||'').trim().split(/\s+/).map(normalize).filter(Boolean);
 let count=0;
 for(const card of cards){
  const matchesCategory=category==='all'||card.dataset.category===category;
  const matchesCondition=!condition||condition.value==='all'||card.dataset.condition===condition.value;
  const haystack=normalize(card.dataset.search);
  card.hidden=!(matchesCategory&&matchesCondition&&terms.every(t=>haystack.includes(t)));
  if(!card.hidden)count++;
 }
 tabs.forEach(t=>t.setAttribute('aria-pressed',String(t.dataset.filter===category)));
 const countLabel=document.querySelector('#result-count');
 if(countLabel)countLabel.textContent=count+(count===1?' item':' items');
 const empty=document.querySelector('#empty');if(empty)empty.hidden=count>0;
 const grid=document.querySelector('#product-grid'),mode=sort?.value||'collection';
 [...cards].sort((a,b)=>{
  const statuses={available:0,reserved:1,sold:2};
  const status=statuses[a.dataset.status]-statuses[b.dataset.status];if(status)return status;
  if(['low','high'].includes(mode)){
   const currency=a.dataset.currency.localeCompare(b.dataset.currency);
   if(currency)return currency;
   const delta=Number(a.dataset.price)-Number(b.dataset.price);
   return mode==='low'?delta:-delta;
  }
  if(mode==='name')return a.dataset.search.localeCompare(b.dataset.search);
  return Number(a.dataset.order)-Number(b.dataset.order);
 }).forEach(card=>grid?.append(card));
}
tabs.forEach(t=>t.addEventListener('click',()=>{
 category=t.dataset.filter;
 history.replaceState(null,'',category==='all'?'#collection':'#'+category);
 updateCatalogue();
}));
window.addEventListener('hashchange',()=>{
 const hash=location.hash.slice(1);
 if(['eyewear','cameras','lenses','vault','collection'].includes(hash)){
  category=hash==='vault'?'cameras':hash==='collection'?'all':hash;updateCatalogue();
 }
});
search?.addEventListener('input',updateCatalogue);
sort?.addEventListener('change',updateCatalogue);
condition?.addEventListener('change',updateCatalogue);
if(cards.length)updateCatalogue();
document.querySelectorAll('[data-gallery-image]').forEach(link=>link.addEventListener('click',event=>{
 event.preventDefault();
 const image=document.querySelector('#main-photo');
 image.removeAttribute('srcset');
 image.removeAttribute('sizes');
 image.src=link.dataset.display||link.href;
 image.alt=link.dataset.alt;
 document.querySelector('#full-photo').href=link.href;
 document.querySelectorAll('[data-gallery-image]').forEach(other=>other.setAttribute('aria-current',String(other===link)));
}));
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
 const result=document.querySelector('#copy-result');
 const value=document.querySelector('link[rel="canonical"]').href;
 try{await navigator.clipboard.writeText(value);result.textContent='Item link copied.';}
 catch{result.textContent='Copy this: '+value;}
}));
