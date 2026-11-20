import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCheckout, checkoutSection, merchantFeed} from './direct-checkout.mjs';
const item = {id:'camera',status:'available'};
// Test fixtures only; these are not store policies or real payment links.
const fixture = () => ({enabled:true,shippingPolicy:'Fixture shipping',returnsPolicy:'Fixture returns',paymentProvider:'PayPal',products:{camera:{url:'https://www.paypal.com/ncp/payment/FIXTURE',price:100,currency:'THB',deliveryEstimate:'Fixture estimate',checkoutSettingsVerified:true}}});
const escape = s => String(s).replaceAll('<','&lt;').replaceAll('"','&quot;');
test('disabled checkout adds no purchase UI or obligations',()=>{
  validateCheckout({enabled:false},[item]);
  assert.equal(checkoutSection({enabled:false},item,escape),'');
});
test('reject incomplete terms and unverified checkouts',()=>{
  for(const key of ['shippingPolicy','returnsPolicy','paymentProvider']){
    const c=fixture();c[key]='';assert.throws(()=>validateCheckout(c,[item]));
  }
  const c=fixture();c.products.camera.checkoutSettingsVerified=false;assert.throws(()=>validateCheckout(c,[item]));
});
test('reject unsafe links, marketplace links and invalid prices',()=>{
  for(const url of ['http://www.paypal.com/x','https://www.paypal.com.evil.test/x','javascript:alert(1)','https://shopee.co.th/item','https://user:pass@www.paypal.com/x']){
    const c=fixture();c.products.camera.url=url;assert.throws(()=>validateCheckout(c,[item]));
  }
  for(const price of [0,-1,NaN]){const c=fixture();c.products.camera.price=price;assert.throws(()=>validateCheckout(c,[item]));}
});
test('only configured products receive the secondary checkout and unavailable items cannot buy',()=>{
  const c=fixture();validateCheckout(c,[item]);
  assert.match(checkoutSection(c,item,escape),/100 THB/);
  assert.equal(checkoutSection(c,{id:'other'},escape),'');
  for(const status of ['sold','reserved']) assert(!checkoutSection(c,{...item,status},escape).includes(c.products.camera.url));
});
test('policy text is escaped rather than executed',()=>{
  const c=fixture();c.returnsPolicy='<script>alert(1)</script>';
  assert(!checkoutSection(c,item,escape).includes('<script>'));
});
test('unavailable payment tools and unfinished business terms block activation',()=>{
  for(const pending of [{paymentToolsAvailable:false},{returns:{status:'draft'}},{shipping:{dispatchWithinHours:null}}]){
    assert.throws(()=>validateCheckout({...fixture(),...pending},[item]));
  }
});
test('shipping total is explicit and unknown delivery times are not invented',()=>{
  const c=fixture();c.shipping={fee:800,currency:'THB'};c.products.camera.deliveryEstimate=null;
  const html=checkoutSection(c,item,escape);
  assert.match(html,/900 THB/);
  assert.match(html,/Transit time varies/);
  assert(!html.includes('Estimated delivery:'));
});
test('Google feed excludes marketplace-only items and uses the direct landing page and price',()=>{
  const c=fixture();const product={...item,brand:'Sigma',name:'Lens',description:'Open box',photos:['images/a b.jpg'],itemCondition:'UsedCondition'};
  const xml=merchantFeed(c,[product,{...product,id:'other'}],'https://theglasselement.com',escape);
  assert.equal((xml.match(/<item>/g)||[]).length,1);
  assert.match(xml,/<g:price>100.00 THB/);
  assert.match(xml,/<g:link>https:\/\/theglasselement.com\/items\/camera.html/);
  assert.match(xml,/a%20b.jpg/);
  assert.match(xml,/<g:condition>used/);
  assert(!merchantFeed({...c,enabled:false},[product],'https://theglasselement.com',escape).includes('<item>'));
});
