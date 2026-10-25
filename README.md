# The Glass Element

Static collector catalogue hosted through the existing GitHub Pages repository and domain.

## Inventory updates

The new catalogue uses `data/catalogue.json` as its single source. Run `node scripts/build.mjs` after editing it, then commit the generated HTML and sitemap together. This replaces the old runtime Google Sheets feed. Initial USD asking prices were copied from the live page on 25 October 2026; no discounts were applied. Old inventory files remain as historical references and are not loaded by the new pages.

Use numeric USD prices and status `available`, `reserved`, or `sold`. Add original photo paths to `photos`; mark `photoKind` as `original` only for verified original item photographs. Current camera artwork is labelled as illustrative. Marketplace screenshots are not presented as current item photographs.

The site renders product information and enquiry links without JavaScript. JavaScript adds filtering, sorting, gallery navigation and copy controls. Product structured data and visible prices are generated from the same records.

## Outstanding stock information

- Confirm availability and USD asking prices for all seven items.
- Replace camera artwork with current photos of the exact cameras.
- Confirm eyewear model codes, frame measurements, lens properties, condition and cases.
- Confirm camera edition markings, menu language, tested functions, defects and accessories.
- Confirm the working contact email and supply a preferred chat contact if wanted.
- Establish payment, delivery and return terms before making specific promises.
- Research comparable sold prices before advertising or discounting.

Do not invent restoration, authenticity, UV-protection, condition or warranty claims.

## Checks and preview

Run `node scripts/check.mjs` and `node --check js/shop.js`. Preview with `node scripts/preview.mjs` on port 8080. Images use the existing production asset URLs. No dependencies are needed. The original articles and domain configuration are preserved.

## Rollback

The previous live commit is `66b5157d8e89a3bf274652e8b8136813d5217296`. Revert the redesign commit to restore it while preserving history.
