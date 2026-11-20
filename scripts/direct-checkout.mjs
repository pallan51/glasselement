// Public configuration only. Never put credentials or customer records here.
export function validateCheckout(config, items) {
  if (!config.enabled) return;
  if (config.paymentToolsAvailable === false) throw new Error('Payment checkout creation is not available');
  if (config.returns && config.returns.status !== 'final') throw new Error('Return terms are still a draft');
  if (config.shipping && (!Number.isInteger(config.shipping.dispatchWithinHours) || config.shipping.dispatchWithinHours < 0)) throw new Error('Confirm dispatch time before enabling checkout');
  for (const key of ['shippingPolicy', 'returnsPolicy', 'paymentProvider']) {
    if (typeof config[key] !== 'string' || !config[key].trim()) throw new Error('Direct checkout requires ' + key);
  }
  if (!Object.keys(config.products || {}).length) throw new Error('No direct-checkout products configured');
  for (const [id, sale] of Object.entries(config.products)) {
    if (!items.some(i => i.id === id)) throw new Error('Unknown checkout product: ' + id);
    const url = new URL(sale.url);
    if (url.protocol !== 'https:' || url.username || url.password || !['www.paypal.com', 'paypal.com', 'buy.stripe.com'].includes(url.hostname)) throw new Error('Use a secure payment-provider checkout URL');
    if (!Number.isFinite(sale.price) || sale.price <= 0 || !['THB', 'USD'].includes(sale.currency)) throw new Error('Invalid direct price: ' + id);
    if (!sale.checkoutSettingsVerified) throw new Error('Verify item, fixed price, shipping, quantity and address collection in provider checkout: ' + id);
  }
}

export function directSale(config, item) {
  return config.enabled && config.products?.[item.id] || null;
}

// Only verified direct offers belong in the Merchant Center data source.
export function merchantFeed(config, items, origin, escape) {
  const rows = items.filter(i => directSale(config, i)?.checkoutSettingsVerified).map(i => {
    const sale = directSale(config, i);
    const field = (key, value) => '<g:' + key + '>' + escape(value) + '</g:' + key + '>';
    return '<item>' + field('id', 'TGE-' + i.id) + field('title', i.brand + ' ' + i.name) +
      field('description', i.description) + field('link', origin + '/items/' + i.id + '.html') +
      field('image_link', origin + '/' + i.photos[0].split('/').map(encodeURIComponent).join('/')) +
      field('brand', i.brand) + field('price', sale.price.toFixed(2) + ' ' + sale.currency) +
      field('availability', i.status === 'available' ? 'in_stock' : 'out_of_stock') +
      field('condition', i.itemCondition === 'NewCondition' ? 'new' : i.itemCondition === 'RefurbishedCondition' ? 'refurbished' : 'used') + '</item>';
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>The Glass Element direct offers</title><link>' + escape(origin) + '</link><description>Products with direct PayPal checkout</description>' + rows.join('\n') + '</channel></rss>\n';
}

export function checkoutSection(config, item, escape) {
  const sale = directSale(config, item);
  if (!sale) return '';
  return '<section class="direct-checkout" id="buy-direct"><h2>Buy direct</h2>' +
    '<p>Direct price: <strong>' + escape(sale.price.toLocaleString('en-US') + ' ' + sale.currency) + '</strong></p>' +
    '<p>' + escape(config.shippingPolicy) + '</p>' +
    (sale.deliveryEstimate ? '<p>Estimated delivery: ' + escape(sale.deliveryEstimate) + '</p>' : '<p>Transit time varies by destination. Contact us for a delivery estimate before ordering.</p>') +
    (config.shipping?.currency === sale.currency ? '<p>Total including shipping: <strong>' + escape((sale.price + config.shipping.fee).toLocaleString('en-US') + ' ' + sale.currency) + '</strong></p>' : '') +
    '<h3>Returns and refunds</h3><p>' + escape(config.returnsPolicy) + '</p>' +
    '<p>Payment is processed by ' + escape(config.paymentProvider) + '. Review the item, total and delivery address before paying. Keep the payment provider’s order confirmation.</p>' +
    (item.status === "available" ? '<a class="button secondary" href="' + escape(sale.url) + '">Buy direct with ' + escape(config.paymentProvider) + '</a>'  : "<p>This item is currently unavailable for direct purchase.</p>") +
    '<p class="small">Questions? <a href="mailto:contact@theglasselement.com">contact@theglasselement.com</a></p></section>';
}
