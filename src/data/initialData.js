export const INITIAL_PRODUCTS = [
  {
    id: "prod-fmcg-101",
    name: "Amul Taaza Homogenised Toned Milk 1L Tetra Pak (Case of 12)",
    brand: "Amul",
    category: "Food & Beverages",
    sku: "AML-MLK-1L-12",
    hsn: "04012000",
    price: 820,
    mrp: 900,
    gstRate: 5,
    stock: 250,
    minOrderQty: 5,
    rating: 4.9,
    reviewCount: 312,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Amul Taaza long life UHT milk processed with state-of-the-art Swedish technology. No preservatives added. Ideal for retail stores, hotels, cafes, and corporate cafeterias.",
    specs: {
      "Pack Size": "12 Units x 1 Litre",
      "Fat Content": "3.0% Min",
      "SNF": "8.5% Min",
      "Shelf Life": "180 Days from MFD",
      "Storage": "Ambient (No Refrigeration till opened)",
      "FSSAI License": "10012021000071",
      "Country of Origin": "India"
    },
    bulkTiers: [
      { qty: "5 - 19 cases", price: 820 },
      { qty: "20 - 50 cases", price: 780 },
      { qty: "51+ cases", price: 740 }
    ]
  },
  {
    id: "prod-fmcg-102",
    name: "Nestlé Koko Krunch Chocolate Whole Grain Cereal 500g (Pack of 12)",
    brand: "Nestlé",
    category: "Food & Beverages",
    sku: "NST-KKR-500G-12",
    hsn: "19041020",
    price: 3150,
    mrp: 3600,
    gstRate: 18,
    stock: 120,
    minOrderQty: 2,
    rating: 4.8,
    reviewCount: 185,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Crunchy chocolate-flavoured whole grain breakfast cereal enriched with 10 essential vitamins, minerals, and calcium. Wholesale master carton for supermarkets and retail stores.",
    specs: {
      "Pack Size": "12 Boxes x 500g",
      "Key Ingredients": "Whole Grain Wheat, Cocoa Powder, Malt Extract",
      "Dietary Info": "Vegetarian, Source of Fiber & Iron",
      "Shelf Life": "12 Months",
      "FSSAI License": "10012011000168",
      "Country of Origin": "India"
    },
    bulkTiers: [
      { qty: "2 - 5 master packs", price: 3150 },
      { qty: "6 - 15 master packs", price: 2980 },
      { qty: "16+ master packs", price: 2800 }
    ]
  },
  {
    id: "prod-fmcg-103",
    name: "Coca-Cola Original Taste Carbonated Soft Drink 750ml (Case of 24)",
    brand: "Coca-Cola",
    category: "Food & Beverages",
    sku: "KO-KO-750ML-24",
    hsn: "22021010",
    price: 920,
    mrp: 1080,
    gstRate: 28,
    stock: 400,
    minOrderQty: 10,
    rating: 4.9,
    reviewCount: 420,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Iconic sparkling soft drink delivered in sealed shrink-wrapped master crates. Refreshing taste for quick service restaurants, retail stores, and corporate events.",
    specs: {
      "Pack Size": "24 Bottles x 750ml PET",
      "Serving Size": "200 ml",
      "Shelf Life": "6 Months",
      "FSSAI License": "10012022000244",
      "Country of Origin": "India"
    },
    bulkTiers: [
      { qty: "10 - 29 cases", price: 920 },
      { qty: "30 - 99 cases", price: 870 },
      { qty: "100+ cases", price: 820 }
    ]
  },
  {
    id: "prod-fmcg-104",
    name: "Bisleri Packaged Natural Mountain Water 1L Bottle (Case of 24)",
    brand: "Bisleri",
    category: "Food & Beverages",
    sku: "BSL-WTR-1L-24",
    hsn: "22019010",
    price: 360,
    mrp: 480,
    gstRate: 18,
    stock: 800,
    minOrderQty: 10,
    rating: 5.0,
    reviewCount: 512,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1560023907-5f310c80557f?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1560023907-5f310c80557f?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Purified drinking water with added minerals (Magnesium & Potassium). Passes 114 quality tests and 10-stage purification process. Certified IS 14543.",
    specs: {
      "Pack Size": "24 PET Bottles x 1 Litre",
      "Purification": "10-Stage Ozonavated Process",
      "Certification": "BIS Certified IS 14543",
      "Shelf Life": "6 Months"
    },
    bulkTiers: [
      { qty: "10 - 49 cases", price: 360 },
      { qty: "50 - 199 cases", price: 330 },
      { qty: "200+ cases", price: 300 }
    ]
  },
  {
    id: "prod-fmcg-105",
    name: "Dove Cream Beauty Bathing Soap 125g (Master Pack of 36 Bars)",
    brand: "Hindustan Unilever",
    category: "Personal Care",
    sku: "HUL-DOV-125G-36",
    hsn: "34011110",
    price: 2450,
    mrp: 2880,
    gstRate: 18,
    stock: 180,
    minOrderQty: 2,
    rating: 4.9,
    reviewCount: 290,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1607006483768-918b9ee3409d?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1607006483768-918b9ee3409d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Classic 1/4 moisturizing cream formula gently cleanses and nourishes skin for soft, smooth results. Top-rated personal care bar for retail, hospitality, and wellness supplies.",
    specs: {
      "Pack Size": "36 Bars x 125g Outer Case",
      "Key Feature": "1/4 Moisturizing Cream",
      "Skin Type": "Suitable for All Skin Types",
      "Shelf Life": "30 Months from MFD",
      "Country of Origin": "India"
    },
    bulkTiers: [
      { qty: "2 - 5 packs", price: 2450 },
      { qty: "6 - 15 packs", price: 2320 },
      { qty: "16+ packs", price: 2180 }
    ]
  },
  {
    id: "prod-fmcg-106",
    name: "Head & Shoulders Smooth & Silky Anti-Dandruff Shampoo 650ml (Case of 12)",
    brand: "Procter & Gamble",
    category: "Personal Care",
    sku: "PG-HNS-650ML-12",
    hsn: "33051090",
    price: 5400,
    mrp: 6480,
    gstRate: 18,
    stock: 95,
    minOrderQty: 1,
    rating: 4.8,
    reviewCount: 142,
    isFeatured: true,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Dermatologically tested up to 100% flake-free scalp protection formula with intense moisturizers for silky smooth hair. Wholesale carton for salons, supermarkets, and pharmacists.",
    specs: {
      "Pack Size": "12 Pump Bottles x 650ml",
      "Hair Type": "Frizzy, Dry, & Damaged Hair",
      "Active Ingredient": "Zinc Pyrithione (ZPT)",
      "Shelf Life": "36 Months"
    },
    bulkTiers: [
      { qty: "1 - 3 cases", price: 5400 },
      { qty: "4 - 9 cases", price: 5100 },
      { qty: "10+ cases", price: 4800 }
    ]
  },
  {
    id: "prod-fmcg-107",
    name: "Colgate Strong Teeth Calcium & Fluoride Toothpaste 200g (Case of 24)",
    brand: "Colgate-Palmolive",
    category: "Personal Care",
    sku: "CLG-ST-200G-24",
    hsn: "33061020",
    price: 2640,
    mrp: 3120,
    gstRate: 18,
    stock: 220,
    minOrderQty: 2,
    rating: 4.9,
    reviewCount: 380,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=800&q=80"
    ],
    description: "India's No. 1 dental care toothpaste with Amino Shakti formula that adds natural calcium to teeth. Fights cavities and freshens breath.",
    specs: {
      "Pack Size": "24 Tubes x 200g",
      "Key Benefits": "Cavity Protection & Enamel Strength",
      "IDA Certified": "Accepted by Indian Dental Association",
      "Shelf Life": "24 Months"
    },
    bulkTiers: [
      { qty: "2 - 5 cases", price: 2640 },
      { qty: "6 - 15 cases", price: 2480 },
      { qty: "16+ cases", price: 2320 }
    ]
  },
  {
    id: "prod-fmcg-108",
    name: "Britannia Good Day Cashew & Butter Biscuits (Master Carton 40 Packs)",
    brand: "Britannia",
    category: "Food & Beverages",
    sku: "BRT-GD-CSH-40",
    hsn: "19053100",
    price: 1120,
    mrp: 1400,
    gstRate: 18,
    stock: 310,
    minOrderQty: 3,
    rating: 4.8,
    reviewCount: 245,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Rich buttery cookies loaded with real crunchy cashew nuts. High-margin wholesale cookie cartons for kirana stores, pantries, and tea stalls.",
    specs: {
      "Pack Size": "40 Retail Packs x 120g",
      "Flavor": "Cashew & Rich Butter",
      "Dietary Info": "100% Vegetarian",
      "Shelf Life": "6 Months",
      "FSSAI License": "10015043001129"
    },
    bulkTiers: [
      { qty: "3 - 9 cartons", price: 1120 },
      { qty: "10 - 29 cartons", price: 1050 },
      { qty: "30+ cartons", price: 980 }
    ]
  },
  {
    id: "prod-fmcg-109",
    name: "Lay's Spanish Tomato Tango Potato Chips (Master Wholesale Box 48 Packs)",
    brand: "PepsiCo",
    category: "Food & Beverages",
    sku: "PEP-LAYS-TOM-48",
    hsn: "20052000",
    price: 910,
    mrp: 1200,
    gstRate: 12,
    stock: 500,
    minOrderQty: 5,
    rating: 4.9,
    reviewCount: 460,
    isFeatured: false,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Crispy farm-fresh potato chips seasoned with tangy Spanish tomato spices. Sealed nitrogen-flushed foil packs for long freshness.",
    specs: {
      "Pack Size": "48 Packs x ₹20 MRP Unit",
      "Flavor": "Spanish Tomato Tango",
      "Shelf Life": "4 Months",
      "FSSAI License": "10012063000110"
    },
    bulkTiers: [
      { qty: "5 - 19 boxes", price: 910 },
      { qty: "20 - 49 boxes", price: 850 },
      { qty: "50+ boxes", price: 790 }
    ]
  },
  {
    id: "prod-fmcg-110",
    name: "Amul Pure Cow Ghee 1L Sealed Tin (Carton of 12 Tins)",
    brand: "Amul",
    category: "Dairy & Frozen Foods",
    sku: "AML-GHEE-1L-12",
    hsn: "04059020",
    price: 7450,
    mrp: 8280,
    gstRate: 12,
    stock: 140,
    minOrderQty: 1,
    rating: 5.0,
    reviewCount: 390,
    isFeatured: true,
    isTrending: true,
    image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Granular pure cow ghee made from fresh cream. Rich aroma and natural golden color. Essential wholesale dairy carton for sweets manufacturers, restaurants, and grocery retailers.",
    specs: {
      "Pack Size": "12 Tins x 1 Litre",
      "Milk Fat": "99.7% Min",
      "Purity": "100% Pure Milk Fat (No Adulterants)",
      "Shelf Life": "12 Months",
      "Country of Origin": "India"
    },
    bulkTiers: [
      { qty: "1 - 3 cartons", price: 7450 },
      { qty: "4 - 9 cartons", price: 7100 },
      { qty: "10+ cartons", price: 6750 }
    ]
  },
  {
    id: "prod-fmcg-111",
    name: "Nescafé Classic 100% Pure Instant Coffee 200g Glass Jar (Case of 12)",
    brand: "Nestlé",
    category: "Beverages & Tea/Coffee",
    sku: "NST-NES-200G-12",
    hsn: "21011110",
    price: 6840,
    mrp: 7800,
    gstRate: 18,
    stock: 110,
    minOrderQty: 1,
    rating: 4.9,
    reviewCount: 275,
    isFeatured: false,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Signature dark roasted Robusta coffee beans roasted to perfection. Delivers bold coffee flavor and aroma. Wholesale case for offices, hotels, and supermarkets.",
    specs: {
      "Pack Size": "12 Glass Jars x 200g",
      "Roast Profile": "Medium-Dark Roast",
      "Shelf Life": "24 Months",
      "FSSAI License": "10012011000168"
    },
    bulkTiers: [
      { qty: "1 - 3 cases", price: 6840 },
      { qty: "4 - 9 cases", price: 6500 },
      { qty: "10+ cases", price: 6150 }
    ]
  },
  {
    id: "prod-fmcg-112",
    name: "Surf Excel Easy Wash Detergent Powder 5kg Bag (Wholesale Case of 4)",
    brand: "Hindustan Unilever",
    category: "Home & Cleaning",
    sku: "HUL-SEW-5KG-04",
    hsn: "34022090",
    price: 2980,
    mrp: 3500,
    gstRate: 18,
    stock: 160,
    minOrderQty: 2,
    rating: 4.8,
    reviewCount: 210,
    isFeatured: true,
    isTrending: false,
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Ultra stain-removal laundry detergent powder engineered with active clean technology. Removes tough tea, grease, and curry stains in 1 wash.",
    specs: {
      "Pack Size": "4 Bags x 5kg Bulk Carry Pack",
      "Washing Type": "Bucket Wash & Top Load Machine",
      "Fragrance": "Fresh Lemon & Aloe Vera",
      "Shelf Life": "24 Months"
    },
    bulkTiers: [
      { qty: "2 - 5 cases", price: 2980 },
      { qty: "6 - 15 cases", price: 2800 },
      { qty: "16+ cases", price: 2620 }
    ]
  }
];

export const INITIAL_CATEGORIES = [
  { id: "cat-fmcg-1", name: "Food & Beverages", count: 480, icon: "Coffee", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-fmcg-2", name: "Personal Care", count: 350, icon: "Smile", image: "https://images.unsplash.com/photo-1607006483768-918b9ee3409d?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-fmcg-3", name: "Dairy & Frozen Foods", count: 210, icon: "Package", image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-fmcg-4", name: "Beverages & Tea/Coffee", count: 195, icon: "Coffee", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-fmcg-5", name: "Home & Cleaning", count: 280, icon: "Sparkles", image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=600&q=80" },
  { id: "cat-fmcg-6", name: "Confectionery & Snacks", count: 410, icon: "Gift", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80" }
];

export const INITIAL_BRANDS = [
  { id: "b1", name: "Amul", logo: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80", count: 120, country: "India" },
  { id: "b2", name: "Nestlé", logo: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=300&q=80", count: 145, country: "Switzerland" },
  { id: "b3", name: "Hindustan Unilever", logo: "https://images.unsplash.com/photo-1607006483768-918b9ee3409d?auto=format&fit=crop&w=300&q=80", count: 210, country: "India" },
  { id: "b4", name: "Procter & Gamble", logo: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80", count: 95, country: "USA" },
  { id: "b5", name: "Britannia", logo: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80", count: 110, country: "India" },
  { id: "b6", name: "PepsiCo", logo: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80", count: 88, country: "USA" },
  { id: "b7", name: "Coca-Cola", logo: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80", count: 75, country: "USA" },
  { id: "b8", name: "Colgate-Palmolive", logo: "https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=300&q=80", count: 65, country: "USA" }
];

export const INITIAL_SALESMEN = [
  { id: "SLS-101", name: "Vikram Malhotra", email: "vikram.m@anujenterprises.com", phone: "+91 98201 44512", region: "West India (Mumbai HQ)", salesVolume: "₹ 84.5 Lakhs", ordersCount: 242, status: "Active" },
  { id: "SLS-102", name: "Priya Sharma", email: "priya.s@anujenterprises.com", phone: "+91 98110 33219", region: "North India (Delhi NCR)", salesVolume: "₹ 62.2 Lakhs", ordersCount: 198, status: "Active" },
  { id: "SLS-103", name: "Rajesh Kumar", email: "rajesh.k@anujenterprises.com", phone: "+91 99400 12890", region: "South India (Bengaluru Hub)", salesVolume: "₹ 92.8 Lakhs", ordersCount: 310, status: "Active" }
];

export const INITIAL_ORDERS = [
  {
    id: "INV-2026-FMCG-089",
    date: "2026-08-06",
    customerName: "Reliance Retail Supermarket Chains",
    customerGstin: "27AAACR4412P1ZX",
    salesmanId: "SLS-101",
    salesmanName: "Vikram Malhotra",
    items: [
      { id: "prod-fmcg-101", name: "Amul Taaza Toned Milk 1L Tetra Pak (Case of 12)", sku: "AML-MLK-1L-12", qty: 20, price: 780 },
      { id: "prod-fmcg-103", name: "Coca-Cola Original Taste 750ml (Case of 24)", sku: "KO-KO-750ML-24", qty: 30, price: 870 }
    ],
    subtotal: 41700,
    cgst: 3753,
    sgst: 3753,
    totalGst: 7506,
    grandTotal: 49206,
    status: "Delivered",
    paymentMode: "Net 30 Days B2B Credit"
  },
  {
    id: "INV-2026-FMCG-088",
    date: "2026-08-05",
    customerName: "DMart Wholesale Marts Pvt Ltd",
    customerGstin: "27AAACD8812K1ZB",
    salesmanId: "SLS-103",
    salesmanName: "Rajesh Kumar",
    items: [
      { id: "prod-fmcg-105", name: "Dove Cream Beauty Bathing Soap 125g (Master Pack of 36 Bars)", sku: "HUL-DOV-125G-36", qty: 10, price: 2320 },
      { id: "prod-fmcg-108", name: "Britannia Good Day Cashew Biscuits (Carton of 40)", sku: "BRT-GD-CSH-40", qty: 15, price: 1050 }
    ],
    subtotal: 38950,
    cgst: 3505,
    sgst: 3505,
    totalGst: 7010,
    grandTotal: 45960,
    status: "Invoiced",
    paymentMode: "Bank NEFT Transfer"
  }
];
