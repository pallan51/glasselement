// =============================================================================
//  LOCAL DEMO DATA — This is the fallback when no Google Sheet is configured.
//  Once you connect a Google Sheet, you can delete this file entirely.
//
//  To connect a Google Sheet instead, see the instructions in js/app.js
// =============================================================================

const inventoryData = {
  "eyewear": [
    {
      "brand": "Eyevan",
      "model": "Racing Team Sun",
      "description": "A vintage-inspired racing team sunglass from Eyevan. Featuring deep tones and exceptional construction, perfect for long drives or exploring the coast.",
      "price": "$550",
      "image": "images/eyevan_bkk.png",
      "tag": "Vintage · Tokyo",
      "link": ""
    },
    {
      "brand": "Kaneko Optical",
      "model": "United Arrows Collab",
      "description": "A stunning collaboration between Kaneko Optical and United Arrows. Meticulously handcrafted acetate offering a rich texture and timeless silhouette.",
      "price": "$480",
      "image": "images/kaneko_bkk.png",
      "tag": "Collab · Handcrafted",
      "link": ""
    },
    {
      "brand": "Masunaga",
      "model": "Optical Classic",
      "description": "Classic optical frames from Masunaga. Hand-polished acetate combined with titanium details. Refined, functional, and built to last.",
      "price": "$520",
      "image": "images/masunaga_eye_bkk.png",
      "tag": "Classic · Fukui",
      "link": ""
    },
    {
      "brand": "Masunaga",
      "model": "Sun Classic",
      "description": "Earthy and bold, these Masunaga sunglasses are crafted with unparalleled precision. The perfect companion for bright days and exotic landscapes.",
      "price": "$560",
      "image": "images/masunaga_sun_bkk.png",
      "tag": "Heritage · Sun",
      "link": ""
    },
    {
      "brand": "Oliver Peoples",
      "model": "Kin",
      "description": "A rare masterpiece in optical design. The Oliver Peoples Kin features exquisite filigree details on a refined titanium chassis. Impeccable balance and timeless sophistication.",
      "price": "$620",
      "image": "images/oliver_peoples_bkk.png",
      "tag": "Archive · Classic",
      "link": ""
    }
  ],
  "cameras": [
    {
      "brand": "Canon",
      "model": "M200 — JP Olympics Edition",
      "description": "An incredibly rare Japan-only Olympics edition of the EOS M200. Blending pure collectability with modern mirrorless capabilities. Field-tested in Old Bangkok.",
      "price": "$1,450",
      "image": "images/canon_m200_bkk.png",
      "tag": "Rare · Limited Edition",
      "link": ""
    },
    {
      "brand": "Pentax",
      "model": "K-S1",
      "description": "A modern classic boasting a distinctly futuristic illumination interface. Compact, highly capable, and meticulously preserved. Traveled through the ruins of Ayutthaya.",
      "price": "$650",
      "image": "images/pentax_ks1_bkk.png",
      "tag": "Exotic · Mint",
      "link": ""
    }
  ],
  "journeys": [
    {
      "title": "Chasing Shadows in Ayutthaya",
      "description": "Monsoon heat, ancient ruins, and the Canon M200. Pushing rare exotic mechanics to their limits alongside archival Oliver Peoples frames.",
      "date": "April 2026",
      "image": "images/hero_thailand.png",
      "tag": "Field Report",
      "link": "posts/ayutthaya-field-test.html"
    }
  ]
};
