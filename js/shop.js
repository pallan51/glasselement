
'use strict';
document.documentElement.classList.add('js');
const cards = [...document.querySelectorAll('[data-product]')];
const search = document.querySelector('#search');
const sort = document.querySelector('#sort');
const tabs = [...document.querySelectorAll('[data-filter]')];
let category = ['eyewear','cameras'].includes(location.hash.slice(1)) ? location.hash.slice(1) : location.hash === '#vault' ? 'cameras' : 'all';
function updateCatalogue() {
  const query = (search?.value || '').trim().toLocaleLowerCase();
  let count = 0;
  for (const card of cards) {
    card.hidden = !((category === 'all' || card.dataset.category === category) && card.dataset.search.includes(query));
    if (!card.hidden) count++;
  }
  tabs.forEach(tab => tab.setAttribute('aria-pressed',String(tab.dataset.filter === category)));
  const countLabel = document.querySelector('#result-count');
  if (countLabel) countLabel.textContent = count + (count === 1 ? ' item' : ' items');
  const empty = document.querySelector('#empty');
  if (empty) empty.hidden = count > 0;
  const grid = document.querySelector('#product-grid');
  const mode = sort?.value || 'collection';
  const ordered = [...cards].sort((a,b) => {
    const statusOrder = {available:0,reserved:1,sold:2};
    const status = statusOrder[a.dataset.status] - statusOrder[b.dataset.status];
    if(status) return status;
    if(mode === 'low') return Number(a.dataset.price)-Number(b.dataset.price);
    if(mode === 'high') return Number(b.dataset.price)-Number(a.dataset.price);
    if(mode === 'name') return a.dataset.search.localeCompare(b.dataset.search);
    return Number(a.dataset.order)-Number(b.dataset.order);
  });
  ordered.forEach(card => grid?.append(card));
}
tabs.forEach(tab => tab.addEventListener('click',() => {
  category = tab.dataset.filter;
  history.replaceState(null,'',category === 'all' ? '#collection' : '#'+category);
  updateCatalogue();
}));
window.addEventListener('hashchange',() => {
  const hash = location.hash.slice(1);
  if(['eyewear','cameras','vault','collection'].includes(hash)) {
    category = hash === 'vault' ? 'cameras' : hash === 'collection' ? 'all' : hash;
    updateCatalogue();
  }
});
search?.addEventListener('input',updateCatalogue);
sort?.addEventListener('change',updateCatalogue);
if(cards.length) updateCatalogue();
document.querySelectorAll('[data-gallery-image]').forEach(link => link.addEventListener('click',event => {
  event.preventDefault();
  const image = document.querySelector('#main-photo');
  image.src = link.href;
  image.alt = link.dataset.alt;
  document.querySelector('#full-photo').href = link.href;
  document.querySelectorAll('[data-gallery-image]').forEach(other => other.setAttribute('aria-current',String(other === link)));
}));
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click',async () => {
  const result = document.querySelector('#copy-result');
  const value = button.dataset.copy === 'url' ? document.querySelector('link[rel="canonical"]').href : 'contact@theglasselement.com';
  try {
    await navigator.clipboard.writeText(value);
    result.textContent = button.dataset.copy === 'url' ? 'Item link copied.' : 'Email address copied.';
  } catch {
    result.textContent = 'Copy this: '+value;
  }
}));
