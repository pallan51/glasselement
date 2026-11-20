import test from 'node:test';
import assert from 'node:assert/strict';
import {validateCheckout, checkoutSection} from './direct-checkout.mjs';
const item = {id:'camera',status:'available'};
// Test fixtures only; these are not store policies or real payment links.
const fixture = () => ({enabled:true,shippingPolicy:'Fixture shipping',returnsPolicy:'Fixture returns',paymentProvider:'PayPal',products:{camera:{url:'https://www.paypal.com/ncp/payment/FIXTURE',price:100,currency:'THB',deliveryEstimate:'Fixture estimate',checkoutVerified:true}}});
const escape = s => String(s).replaceAll('<','&lt;').replaceAll('"','&quot;');
test('disabled checkout adds no purchase UI or obligations',()=>{
  validateCheckout({enabled:false},[item]);
  assert.equal(checkoutSection({enabled:false},item,escape),'');
});
test('reject incomplete terms and unverified checkouts',()=>{
  for(const key of ['shippingPolicy','returnsPolicy','paymentProvider']){
    const c=fixture();c[key]='';assert.throws(()=>validateCheckout(c,[item]));
  }
  const c=fixture();c.products.camera.checkoutVerified=false;assert.throws(()=>validateCheckout(c,[item]));
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
