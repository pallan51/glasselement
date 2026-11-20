# Minimal direct checkout, with Shopee first

Status: prepared, disabled. No new buying route is live and Google Shopping eligibility has not been established.

The main Shopee buttons stay as they are. A secondary direct purchase section can be enabled for a small, explicit selection of items using a provider-generated fixed-price checkout. This keeps payment and customer records out of this public GitHub repository and avoids a custom server. Use an eligible receiving account and provider-supported currency/countries; account ownership or old PayPal purchases alone do not establish that the account can receive these sales.

## Information needed from the owner

- Receiving payment provider/account and its generated product checkout links. No passwords or secret keys belong in chat, HTML or this repository.
- Destination countries, delivery charge(s), dispatch time and delivery estimate.
- Actual direct-sale returns/refunds terms, including how returns work and who pays return postage.
- Direct prices and which products to offer. Existing Shopee promotions are not automatically the direct price. Product options must represent the exact item shown.

## Configure and verify

Edit data/direct-checkout.json. Each products entry is keyed by catalogue id and contains url, price, currency, deliveryEstimate and checkoutVerified. The account must generate the real checkout URL; do not substitute an email enquiry, editable donation amount, quote request or Shopee URL.

Keep enabled false until business terms are supplied. When enabled, the builder rejects missing terms, unknown products, unsafe checkout URLs and missing verification. Set checkoutVerified true only after manually checking the real checkout:

1. Exact item, condition, fixed price and currency match the visible direct offer.
2. Shipping destinations, charges, delivery estimate and any taxes are disclosed before payment. A buyer can enter an international billing address even if shipping is limited.
3. Quantity/options and provider inventory prevent purchases beyond available stock. A Shopee sale still requires promptly disabling the direct listing; there is no live Shopee inventory integration.
4. A purchase can complete and receives a real provider order/payment confirmation. An unverified return URL alone is not payment proof.
5. Payment notifications reach the seller, refund handling works, and customer data is handled through the provider.

Run node --test scripts/direct-checkout.test.mjs, node scripts/build.mjs and node scripts/check.mjs.

## Before submitting to Google

When enabled, configured products use the direct price and the Glass Element landing page in Product/Offer data. The checker verifies this alongside the visible direct checkout. Unconfigured products retain their Shopee offer. Keep any different Shopee price explicitly labelled. Submit only enabled, verified products through Merchant Center; do not submit the rest of the catalogue as direct-purchase inventory.

Set up/claim Merchant Center, configure business details, delivery and returns, provide the correct product identifiers where available, and review account/product diagnostics. Verify checkout and request review only after the changes are live. Free listings do not require starting paid ads, and neither checkout nor a product feed guarantees approval or display.

## Official references

- https://support.google.com/merchants/answer/12160471?hl=en
- https://support.google.com/merchants/answer/10249082?hl=en
- https://support.google.com/merchants/answer/9158778?hl=en
- https://developer.paypal.com/payment-links-buttons/overview

Invoicing is an allowed payment alternative, but implementing it still requires a genuine order-processing system, order confirmation and estimated delivery. An email enquiry is not a completed checkout. A supported provider-hosted product checkout is the smaller implementation for this static site if the owner's account supports it.
