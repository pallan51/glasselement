# The Glass Element

Static product catalogue served by the existing GitHub Pages repository and domain.

## Updating stock

Edit data/catalogue.json, then run:

    node scripts/build.mjs
    node scripts/check.mjs
    node --check js/shop.js

Commit the generated pages, sitemap, images and source changes together. Original image files and existing item URLs are preserved.

Every item has an exact model, English description, Thai summary, condition, contents and any known faults. The 28 original camera/lens/Vuarnet Shopee descriptions were reviewed on 25 October 2026; the two additional eyewear descriptions were reviewed during the preceding import. There are 35 product records, including 30 linked Shopee listings and 143 item photographs. Source gallery identifiers are retained in data/shopee-gallery-sources.json.

Do not invent condition tests, authenticity guarantees, GTINs, reviews, shipping charges, return periods or warranties. Keep symptoms separate from speculative repair causes. Update repair, defects and itemCondition together. A used item with a known functional or optical fault must remain visibly disclosed.

The primary offer on a Shopee-linked item uses shopeePrice in THB and its actual Shopee purchase URL. The original price/currency remain intact for direct enquiries and are shown separately when different. These are dated snapshots, not a live marketplace feed. Refresh prices and availability when stock changes.

## Images and performance

Originals remain under images/ and images/shopee/. Responsive 600px and 1200px JPEG derivatives live under images/optimized/. data/image-manifest.json maps originals to derivatives, dimensions and byte sizes. All 143 originals remain available through full-size gallery links.

scripts/optimize-images.ps1 regenerates the derivatives using Windows System.Drawing. It requires an environment that permits locally authored PowerShell scripts; no execution-policy change is required or made by this project. Regenerate the image manifest when adding photographs, then rebuild the pages.

The 35 collection thumbnails total approximately 1.46 MB versus 12.62 MB for their original first photographs, an 88% reduction as measured during this update. Gallery previews and cards use responsive images; full originals are available on request via the image link.

## Search and buying

Crawlable collections: /cameras/, /lenses/, /eyewear/ and /repair/. Existing homepage hash filters remain functional. Product pages include unique metadata, exact brand/model H1s, visible English/Thai information, accurate Product/Offer, BreadcrumbList and ImageObject data, and original-photo credits/permission links. There are no fabricated ratings or manufacturer identifiers.

sitemap.xml contains the product and collection URLs plus all original image URLs. lastmod reflects actual content changes, not the current build time. robots.txt allows public crawling, including search crawlers used by Google, Bing and ChatGPT. No AI-specific file or ranking guarantee is assumed.

Google's homepage verification meta tag is retained by the page generator for the owner's Search Console property. Do not remove it when rebuilding.

Thirty records link directly to the owner's second_hand_japan Shopee product listings. Cards have purchase links and mobile product pages have a persistent purchase bar. The buying/contact page explains the actual buying routes without inventing delivery, payment or return terms.

## Verification

The local checker verifies all 35 product prices against their primary offer, unique titles/descriptions, exact model headings, Thai content, condition disclosures, galleries, image dimensions and files, original-photo licensing fields, category membership, crawlable links, sitemap coverage and public crawler access. Test filtering, alternate model spellings, gallery switching and mobile purchase controls in the browser before publishing.

Preview:

    node scripts/preview.mjs

The local server serves the homepage and collection directory URLs on port 8080. Revert changes through Git history to roll back a release.

## IndexNow discovery

After publishing changed stock pages, run node scripts/submit-indexnow.mjs to notify participating search engines. The public ownership key is in data/search-config.json and its matching root .txt file; keep both. A 200 response confirms receipt, and 202 means receipt with key validation pending. Neither guarantees crawling or indexing. Google sitemap submission is handled separately in Search Console.
