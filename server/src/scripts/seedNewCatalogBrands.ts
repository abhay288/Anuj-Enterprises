import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Company } from '../models/Company.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';

export const newCompanies = [
  {
    name: 'VTC',
    logo: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=300&q=80',
    description: 'Manufacturer of high-protein macaroni, gourmet pasta, traditional roasted sewai, and quality soya chunks.',
    featured: true,
    isNew: true
  },
  {
    name: 'Cook Yumm',
    logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80',
    description: 'Packaged premium kitchen staples: clean daliya, suji, maida, and nutrient-rich poha.',
    featured: true,
    isNew: true
  },
  {
    name: "Kay's India",
    logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
    description: 'Food seasonings, culinary spices, certified food colours, corn flour, custard powder and institutional additives.',
    featured: true,
    isNew: true
  },
  {
    name: 'Others Brand',
    logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80',
    description: 'Wholesale institutional items: spicy bundi, instant noodles, food essences, and confectionery rolls/cakes.',
    featured: false,
    isNew: true
  },
  {
    name: 'Too Yumm',
    logo: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80',
    description: 'Guilt-free crunchy snacks, baked chips, karare curls and potato snacks by RP-Sanjiv Goenka Group.',
    featured: true,
    isNew: true
  }
];

export const newProductsList = [
  // ================= 1. VTC PRODUCTS (11 items) =================
  {
    name: 'VTC Macaroni 400g (Bag of 30 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-MAC-400G-30',
    unitType: 'Packet',
    unitQuantity: '400 Gm',
    packSize: '400g Pack',
    caseSize: '30 Pcs / Bag',
    boriSize: '30 Packets / Master Bag',
    customPackaging: '1 Master Bag = 30 Packets (400g each) • High Durum Wheat',
    price: 840,
    mrp: 1050,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80',
    description: 'Premium durum wheat semolina elbow macaroni, non-sticky and rich in fibre for quick cooking.'
  },
  {
    name: 'VTC Macaroni 20 Kg Commercial Sack (20 Kg)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-MAC-20KG',
    unitType: 'Bag',
    unitQuantity: '20 Kg',
    packSize: '20 Kg Sack',
    caseSize: '1 Sack (20 Kg)',
    boriSize: '20 Kg Commercial Bori',
    customPackaging: '1 Bori = 20 Kg Bulk Sack • Institutional & Restaurant Pack',
    price: 1300,
    mrp: 1600,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80',
    description: 'Commercial wholesale bulk bag of durum wheat macaroni suited for hotels, caterers, and canteens.'
  },
  {
    name: 'VTC Spiral Pasta 400g (Bag of 30 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-SPI-400G-30',
    unitType: 'Packet',
    unitQuantity: '400 Gm',
    packSize: '400g Pack',
    caseSize: '30 Pcs / Bag',
    boriSize: '30 Packets / Master Bag',
    customPackaging: '1 Master Bag = 30 Packets (400g each) • Fusilli Spiral Pasta',
    price: 870,
    mrp: 1100,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
    description: 'Italian-style spirali fusilli pasta holding sauces and flavours perfectly for cafe menus.'
  },
  {
    name: 'VTC Spiral Pasta 20 Kg Commercial Sack (20 Kg)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-SPI-20KG',
    unitType: 'Bag',
    unitQuantity: '20 Kg',
    packSize: '20 Kg Sack',
    caseSize: '1 Sack (20 Kg)',
    boriSize: '20 Kg Commercial Bori',
    customPackaging: '1 Bori = 20 Kg Bulk Sack • Institutional Fusilli',
    price: 1350,
    mrp: 1650,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
    description: 'Bulk 20 kg catering sack of spiral fusilli pasta for cloud kitchens and banquet catering.'
  },
  {
    name: 'VTC Penne Pasta 400g (Bag of 30 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-PEN-400G-30',
    unitType: 'Packet',
    unitQuantity: '400 Gm',
    packSize: '400g Pack',
    caseSize: '30 Pcs / Bag',
    boriSize: '30 Packets / Master Bag',
    customPackaging: '1 Master Bag = 30 Packets (400g each) • Penne Rigate Ridges',
    price: 870,
    mrp: 1100,
    stock: 145,
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80',
    description: 'Ridged cylindrical penne rigate pasta crafted from golden semolina for authentic Italian dishes.'
  },
  {
    name: 'VTC Penne Pasta 20 Kg Commercial Sack (20 Kg)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-PEN-20KG',
    unitType: 'Bag',
    unitQuantity: '20 Kg',
    packSize: '20 Kg Sack',
    caseSize: '1 Sack (20 Kg)',
    boriSize: '20 Kg Commercial Bori',
    customPackaging: '1 Bori = 20 Kg Bulk Sack • Commercial Grade Penne',
    price: 1350,
    mrp: 1650,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=800&q=80',
    description: '20 Kg master burlap / woven sack of ridged penne pasta for commercial foodservice applications.'
  },
  {
    name: 'VTC Cut Sewai 100g (Bag of 120 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-SEW-100G-120',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Pouch',
    caseSize: '120 Pcs / Bag',
    boriSize: '120 Pouches / Master Bag',
    customPackaging: '1 Master Bag = 120 Pouches (100g each) • Convenient Single Serve',
    price: 1080,
    mrp: 1440,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Finely extruded cut vermicelli sewai, perfect for instant kheer, upma, and festive sweets.'
  },
  {
    name: 'VTC Cut Sewai 400g (Bag of 40 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-SEW-400G-40',
    unitType: 'Packet',
    unitQuantity: '400 Gm',
    packSize: '400g Pack',
    caseSize: '40 Pcs / Bag',
    boriSize: '40 Packs / Master Bag',
    customPackaging: '1 Master Bag = 40 Packs (400g each) • Family Pack Sewai',
    price: 1120,
    mrp: 1440,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Family-size vermicelli cut sewai pack made from pure wheat for delicious sweet and savoury dishes.'
  },
  {
    name: 'VTC Roasted Long Sewai 125g (Bag of 120 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-RLS-125G-120',
    unitType: 'Packet',
    unitQuantity: '125 Gm',
    packSize: '125g Pack',
    caseSize: '120 Pcs / Bag',
    boriSize: '120 Packs / Master Bag',
    customPackaging: '1 Master Bag = 120 Packs (125g each) • Golden Roasted Long Sewai',
    price: 1320,
    mrp: 1680,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Pre-roasted long strand wheat vermicelli with nutty golden aroma, saving preparation time for sheer khurma.'
  },
  {
    name: 'VTC Soya Bean Medium Pkt 44g (Bag of 240 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-SOY-MED-240',
    unitType: 'Packet',
    unitQuantity: '44 Gm',
    packSize: '44g Sachet',
    caseSize: '240 Pcs / Bag',
    boriSize: '240 Sachets / Master Bag',
    customPackaging: '1 Master Bag = 240 Sachets (44g each) • High Protein Soya Chunks',
    price: 1920,
    mrp: 2400,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    description: 'High-protein defatted soya chunks in medium size, delivering 52% plant protein for healthy family curries.'
  },
  {
    name: 'VTC Soya Bean Mini Pkt 44g (Bag of 240 Pcs)',
    companyName: 'VTC',
    categoryName: 'Food & Beverages',
    sku: 'VTC-SOY-MIN-240',
    unitType: 'Packet',
    unitQuantity: '44 Gm',
    packSize: '44g Sachet',
    caseSize: '240 Pcs / Bag',
    boriSize: '240 Sachets / Master Bag',
    customPackaging: '1 Master Bag = 240 Sachets (44g each) • Mini Soya Granules',
    price: 1920,
    mrp: 2400,
    stock: 175,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    description: 'Mini bite-sized soya nuggets designed to absorb spicy gravies quickly with spongy, tender bite.'
  },

  // ================= 2. COOK YUMM PRODUCTS (5 items) =================
  {
    name: 'Cook Yumm Daliya 110g (Bag of 168 Pcs)',
    companyName: 'Cook Yumm',
    categoryName: 'Food & Beverages',
    sku: 'CKY-DAL-110G-168',
    unitType: 'Packet',
    unitQuantity: '110 Gm',
    packSize: '110g Pouch',
    caseSize: '168 Pcs / Bag',
    boriSize: '168 Pouches / Master Bag',
    customPackaging: '1 Master Bag = 168 Pouches (110g each) • Single Serving Daliya',
    price: 1512,
    mrp: 2016,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Stone-cracked nutritious wheat daliya rich in natural bran fibre for wholesome, energizing morning porridge.'
  },
  {
    name: 'Cook Yumm Daliya 500g (Bag of 20 Pcs)',
    companyName: 'Cook Yumm',
    categoryName: 'Food & Beverages',
    sku: 'CKY-DAL-500G-20',
    unitType: 'Packet',
    unitQuantity: '500 Gm',
    packSize: '500g Pack',
    caseSize: '20 Pcs / Bag',
    boriSize: '20 Packs / Master Bag',
    customPackaging: '1 Master Bag = 20 Packs (500g each) • 10 Kg Total Bulk Bag',
    price: 680,
    mrp: 860,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Half-kilogram family pack of cleaned cracked wheat daliya, unpolished and loaded with dietary fibre.'
  },
  {
    name: 'Cook Yumm Suji 500g (Bag of 20 Pcs)',
    companyName: 'Cook Yumm',
    categoryName: 'Food & Beverages',
    sku: 'CKY-SUJ-500G-20',
    unitType: 'Packet',
    unitQuantity: '500 Gm',
    packSize: '500g Pack',
    caseSize: '20 Pcs / Bag',
    boriSize: '20 Packs / Master Bag',
    customPackaging: '1 Master Bag = 20 Packs (500g each) • Granular Pure Semolina',
    price: 700,
    mrp: 900,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Double-refined, coarse-grained semolina (Suji) milled from select wheat kernels for halwa, idli and upma.'
  },
  {
    name: 'Cook Yumm Maida 500g (Bag of 20 Pcs)',
    companyName: 'Cook Yumm',
    categoryName: 'Food & Beverages',
    sku: 'CKY-MAI-500G-20',
    unitType: 'Packet',
    unitQuantity: '500 Gm',
    packSize: '500g Pack',
    caseSize: '20 Pcs / Bag',
    boriSize: '20 Packs / Master Bag',
    customPackaging: '1 Master Bag = 20 Packs (500g each) • Super Fine Refined Flour',
    price: 640,
    mrp: 800,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Super-fine refined all-purpose flour (Maida) with high elasticity, ideal for bhature, parathas, and bakery goods.'
  },
  {
    name: 'Cook Yumm Poha 450g (Bag of 40 Pcs)',
    companyName: 'Cook Yumm',
    categoryName: 'Food & Beverages',
    sku: 'CKY-POH-450G-40',
    unitType: 'Packet',
    unitQuantity: '450 Gm',
    packSize: '450g Pack',
    caseSize: '40 Pcs / Bag',
    boriSize: '40 Packs / Master Bag',
    customPackaging: '1 Master Bag = 40 Packs (450g each) • 18 Kg Total Rice Flakes',
    price: 1520,
    mrp: 1920,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Thick-pressed, dust-free flattened rice flakes (Poha) that remain light and fluffy when soaked.'
  },

  // ================= 3. KAY'S INDIA PRODUCTS (15 items) =================
  {
    name: "Kay's Oregano 8g (10 Pcs / Mala • 40 Pcs / Bundle)",
    companyName: "Kay's India",
    categoryName: 'Confectionery & Snacks',
    sku: 'KAY-ORG-8G-40',
    unitType: 'Packet',
    unitQuantity: '8 Gm',
    packSize: '8g Sachet',
    caseSize: '40 Pcs / Bundle',
    malaSize: '10 Pcs / Mala',
    bundleSize: '40 Pcs Bundle',
    customPackaging: '1 Bundle = 4 Mala × 10 Pcs (40 Sachets total) • Mediterranean Oregano',
    price: 360,
    mrp: 480,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Aromatic dried Mediterranean oregano herb seasoning flakes in hanging mala sachets for pizza and fast food outlets.'
  },
  {
    name: "Kay's Chilli Flakes 8g (10 Pcs / Mala • 40 Pcs / Bundle)",
    companyName: "Kay's India",
    categoryName: 'Confectionery & Snacks',
    sku: 'KAY-CHL-8G-40',
    unitType: 'Packet',
    unitQuantity: '8 Gm',
    packSize: '8g Sachet',
    caseSize: '40 Pcs / Bundle',
    malaSize: '10 Pcs / Mala',
    bundleSize: '40 Pcs Bundle',
    customPackaging: '1 Bundle = 4 Mala × 10 Pcs (40 Sachets total) • Fiery Crushed Red Pepper',
    price: 360,
    mrp: 480,
    stock: 190,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Coarsely crushed dried red chilli flakes packed in retail hanging display malas for pizza and pasta toppings.'
  },
  {
    name: "Kay's Orange Food Colour 10g (Box of 25 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-FCO-ORG-10G-25',
    unitType: 'Piece',
    unitQuantity: '10 Gm',
    packSize: '10g Vial',
    caseSize: '25 Pcs / Box',
    cartonSize: '25 Vials / Outer Box',
    customPackaging: '1 Box = 25 Vials (10g each) • Bright Sunset Orange',
    price: 250,
    mrp: 350,
    stock: 220,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'FSSAI certified food-grade edible orange powder colour for jalebi, biryani, tandoori marinades, and sweets.'
  },
  {
    name: "Kay's Orange Food Colour 100g (Box of 10 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-FCO-ORG-100G-10',
    unitType: 'Piece',
    unitQuantity: '100 Gm',
    packSize: '100g Jar',
    caseSize: '10 Pcs / Box',
    cartonSize: '10 Jars / Box',
    customPackaging: '1 Box = 10 Jars (100g each) • Catering & Halwai Pack',
    price: 450,
    mrp: 600,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Commercial 100g container of food-grade orange culinary coloring for commercial confectioners and caterers.'
  },
  {
    name: "Kay's Yellow Food Colour 10g (Box of 25 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-FCO-YEL-10G-25',
    unitType: 'Piece',
    unitQuantity: '10 Gm',
    packSize: '10g Vial',
    caseSize: '25 Pcs / Box',
    cartonSize: '25 Vials / Outer Box',
    customPackaging: '1 Box = 25 Vials (10g each) • Bright Lemon Yellow',
    price: 250,
    mrp: 350,
    stock: 210,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Pure certified edible lemon yellow food colour powder for laddus, halwa, pulao, and confectionery baking.'
  },
  {
    name: "Kay's Yellow Food Colour 100g (Box of 10 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-FCO-YEL-100G-10',
    unitType: 'Piece',
    unitQuantity: '100 Gm',
    packSize: '100g Jar',
    caseSize: '10 Pcs / Box',
    cartonSize: '10 Jars / Box',
    customPackaging: '1 Box = 10 Jars (100g each) • Commercial Kitchen Size',
    price: 450,
    mrp: 600,
    stock: 170,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: '100g bulk canister of food-grade lemon yellow colouring powder for commercial sweet shops and caterers.'
  },
  {
    name: "Kay's Green Food Colour 10g (Box of 25 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-FCO-GRN-10G-25',
    unitType: 'Piece',
    unitQuantity: '10 Gm',
    packSize: '10g Vial',
    caseSize: '25 Pcs / Box',
    cartonSize: '25 Vials / Outer Box',
    customPackaging: '1 Box = 25 Vials (10g each) • Emerald Green',
    price: 250,
    mrp: 350,
    stock: 190,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Brilliant green edible powder colouring for pista barfi, mocktails, bakery frosting and savouries.'
  },
  {
    name: "Kay's Green Food Colour 100g (Box of 10 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-FCO-GRN-100G-10',
    unitType: 'Piece',
    unitQuantity: '100 Gm',
    packSize: '100g Jar',
    caseSize: '10 Pcs / Box',
    cartonSize: '10 Jars / Box',
    customPackaging: '1 Box = 10 Jars (100g each) • Bakery & Confectionery Pack',
    price: 450,
    mrp: 600,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: '100g food-grade green colour powder suited for commercial bakery production and commercial restaurant kitchens.'
  },
  {
    name: "Kay's Custard Vanilla 100g (Box of 10 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-CUS-VAN-100G-10',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '10 Pcs / Box',
    cartonSize: '10 Boxes / Master Pack',
    customPackaging: '1 Pack = 10 Cartons (100g each) • Classic Vanilla Custard',
    price: 360,
    mrp: 450,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Smooth and creamy vanilla-flavoured dessert custard powder that thickens flawlessly without lumps.'
  },
  {
    name: "Kay's Custard Vanilla 500g (Bag of 40 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-CUS-VAN-500G-40',
    unitType: 'Packet',
    unitQuantity: '500 Gm',
    packSize: '500g Pack',
    caseSize: '40 Pcs / Bag',
    boriSize: '40 Packs / Master Bag',
    customPackaging: '1 Master Bag = 40 Packs (500g each) • 20 Kg Total Custard',
    price: 2800,
    mrp: 3600,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Bulk 500g bags of creamy vanilla custard powder for catering banquets, ice cream makers and fruit salad vendors.'
  },
  {
    name: "Kay's Corn Flour 100g (Box of 10 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-CRN-100G-10',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '10 Pcs / Box',
    cartonSize: '10 Cartons / Master Outer',
    customPackaging: '1 Outer = 10 Cartons (100g each) • High Purity Corn Starch',
    price: 260,
    mrp: 350,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Pure white non-GMO corn flour starch, excellent for clear soup thickening, crisp fried batters and gravies.'
  },
  {
    name: "Kay's Corn Flour 1000g / 1 Kg (Bag of 25 Pcs)",
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-CRN-1KG-25',
    unitType: 'Packet',
    unitQuantity: '1000 Gm',
    packSize: '1 Kg Pack',
    caseSize: '25 Pcs / Bag',
    boriSize: '25 Packs / Master Bag',
    customPackaging: '1 Master Bag = 25 Packs (1 Kg each) • 25 Kg Commercial Starch',
    price: 1625,
    mrp: 2125,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: '1 Kg bulk packaging of corn starch flour for Indo-Chinese restaurants, manchurian batters and thick gravies.'
  },
  {
    name: 'Citric Acid / Satri 250g (25 Kg Commercial Sack)',
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-CIT-250G-25KG',
    unitType: 'Bag',
    unitQuantity: '250 Gm',
    packSize: '250g Pack',
    caseSize: '25 Kg Sack',
    boriSize: '25 Kg Master Commercial Bag',
    customPackaging: '1 Commercial Bag = 25 Kg Bulk Sack (250g Inner Units) • Nimbu Sat / Satri',
    price: 3750,
    mrp: 4750,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Food grade crystalline citric acid (Nimbu Sat / Tatri) souring agent and natural preservative for beverages, syrups and namkeens.'
  },
  {
    name: 'Mono Sodium Glutamate / Ajinomoto Pure 250g (25 Kg Commercial Sack)',
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-MSG-PUR-250G-25KG',
    unitType: 'Bag',
    unitQuantity: '250 Gm',
    packSize: '250g Pack',
    caseSize: '25 Kg Sack',
    boriSize: '25 Kg Master Commercial Bag',
    customPackaging: '1 Commercial Bag = 25 Kg Bulk Sack (250g Inner Units) • 99% Pure MSG',
    price: 4250,
    mrp: 5500,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'High-grade 99% pure monosodium glutamate flavour enhancer providing rich umami taste for Indo-Chinese cuisine.'
  },
  {
    name: 'Mono Sodium Glutamate / Ajinomoto Mix 250g (25 Kg Commercial Sack)',
    companyName: "Kay's India",
    categoryName: 'Food & Beverages',
    sku: 'KAY-MSG-MIX-250G-25KG',
    unitType: 'Bag',
    unitQuantity: '250 Gm',
    packSize: '250g Pack',
    caseSize: '25 Kg Sack',
    boriSize: '25 Kg Master Commercial Bag',
    customPackaging: '1 Commercial Bag = 25 Kg Bulk Sack (250g Inner Units) • Blended Flavour Enhancer',
    price: 3600,
    mrp: 4800,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Cost-effective blended umami seasoning mix formulated for fast-food restaurants, chowmein stalls and snack manufacturing.'
  },

  // ================= 4. OTHERS BRAND PRODUCTS (7 items) =================
  {
    name: 'N. Masala Bundi 33g (Bandal of 160 Pcs)',
    companyName: 'Others Brand',
    categoryName: 'Confectionery & Snacks',
    sku: 'OTH-MSL-BUN-33G-160',
    unitType: 'Packet',
    unitQuantity: '33 Gm',
    packSize: '33g Pouch',
    caseSize: '160 Pcs / Bandal',
    boriSize: '160 Pouches / Bandal',
    customPackaging: '1 Bandal = 160 Retail Pouches (33g each) • Spicy Raita Boondi',
    price: 640,
    mrp: 800,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp, spicy fried gram-flour masala pearls (Boondi) packed in ₹5 convenience pouches for raita and snacking.'
  },
  {
    name: 'N. Masala Bundi 200g (Bag of 60 Pcs)',
    companyName: 'Others Brand',
    categoryName: 'Confectionery & Snacks',
    sku: 'OTH-MSL-BUN-200G-60',
    unitType: 'Packet',
    unitQuantity: '200 Gm',
    packSize: '200g Pack',
    caseSize: '60 Pcs / Bag',
    boriSize: '60 Packs / Master Bag',
    customPackaging: '1 Master Bag = 60 Packs (200g each) • 12 Kg Total Namkeen Boondi',
    price: 1800,
    mrp: 2400,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Generous 200g family pack seasoned masala boondi with mint and chatpata spices for curd raita and snacks.'
  },
  {
    name: 'Ganga Maheen Noodles 600g (Bag of 25 Pcs)',
    companyName: 'Others Brand',
    categoryName: 'Food & Beverages',
    sku: 'OTH-GAN-NOD-600G-25',
    unitType: 'Packet',
    unitQuantity: '600 Gm',
    packSize: '600g Family Pack',
    caseSize: '25 Pcs / Bag',
    boriSize: '25 Packs / Master Bag',
    customPackaging: '1 Master Bag = 25 Packs (600g each) • Desi Hakka Noodles',
    price: 1125,
    mrp: 1500,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Thin street-style chowmein noodles (Maheen) that boil fast and never turn mushy, popular among fast-food vendors.'
  },
  {
    name: 'Priya Maheen Noodles 580g (Bag of 30 Pcs)',
    companyName: 'Others Brand',
    categoryName: 'Food & Beverages',
    sku: 'OTH-PRI-NOD-580G-30',
    unitType: 'Packet',
    unitQuantity: '580 Gm',
    packSize: '580g Pack',
    caseSize: '30 Pcs / Bag',
    boriSize: '30 Packs / Master Bag',
    customPackaging: '1 Master Bag = 30 Packs (580g each) • Commercial Chowmein',
    price: 1350,
    mrp: 1800,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Super fine commercial chowmein noodles offering superior elongation and springy texture when wok-fried.'
  },
  {
    name: 'Vanilla Essence 20 ml (Box of 10 Pcs)',
    companyName: 'Others Brand',
    categoryName: 'Food & Beverages',
    sku: 'OTH-VAN-ESS-20ML-10',
    unitType: 'Bottle',
    unitQuantity: '20 ml',
    packSize: '20 ml Bottle',
    caseSize: '10 Pcs / Box',
    cartonSize: '10 Bottles / Outer Box',
    customPackaging: '1 Outer Box = 10 Glass Vials (20 ml each) • Premium Flavouring Extract',
    price: 280,
    mrp: 380,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'High-potency aromatic vanilla essence extract for bakery cakes, pastries, shakes, ice creams and puddings.'
  },
  {
    name: 'Parag Sweet Roll 12 Pcs Pack (Case of 27 Boxes)',
    companyName: 'Others Brand',
    categoryName: 'Confectionery & Snacks',
    sku: 'OTH-PAR-SWT-12P-27',
    unitType: 'Box',
    unitQuantity: '12 Pcs',
    packSize: '12 Pcs Box',
    caseSize: '27 Boxes / Case',
    cartonSize: '27 Boxes / Master Carton',
    customPackaging: '1 Master Carton = 27 Boxes (12 Pcs each) • Cream-Filled Sweet Rolls',
    price: 1350,
    mrp: 1755,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Soft layered sweet swiss rolls filled with sweet vanilla confectionery cream, popular fast-selling tea snack.'
  },
  {
    name: 'Parag Jar Cake 50 Pcs (Case of 12 Jars)',
    companyName: 'Others Brand',
    categoryName: 'Confectionery & Snacks',
    sku: 'OTH-PAR-JAR-50P-12',
    unitType: 'Piece',
    unitQuantity: '50 Pcs',
    packSize: '50 Pcs Jar',
    caseSize: '12 Jars / Case',
    cartonSize: '12 Countertop Jars / Master Case',
    customPackaging: '1 Master Case = 12 Display Jars (50 Pcs per Jar) • Total 600 Cake Bites',
    price: 2400,
    mrp: 3000,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Individual soft sponge cake bites packed in countertop display jars for kirana impulse purchase checkout counters.'
  },

  // ================= 5. TOO YUMM PRODUCTS (6 items) =================
  {
    name: 'Too Yumm Bhoot Chips 10.5g @ ₹5/- (15 Pcs/Mala • 16 Mala/Case)',
    companyName: 'Too Yumm',
    categoryName: 'Confectionery & Snacks',
    sku: 'TY-BHT-CHP-10G-240',
    unitType: 'Packet',
    unitQuantity: '10.5 Gm',
    packSize: '10.5g Sachet',
    caseSize: '16 Mala / Case (240 Pcs)',
    malaSize: '15 Pcs / Mala',
    customPackaging: '1 Case = 16 Mala × 15 Pcs = 240 Packets • ₹5 Price Point',
    price: 960,
    mrp: 1200,
    stock: 250,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Ghost pepper infused fiery spicy potato chips, baked to crunch with bold flaming seasoning.'
  },
  {
    name: 'Too Yumm Bhoot Karare 10.5g @ ₹5/- (15 Pcs/Mala • 16 Mala/Case)',
    companyName: 'Too Yumm',
    categoryName: 'Confectionery & Snacks',
    sku: 'TY-BHT-KAR-10G-240',
    unitType: 'Packet',
    unitQuantity: '10.5 Gm',
    packSize: '10.5g Sachet',
    caseSize: '16 Mala / Case (240 Pcs)',
    malaSize: '15 Pcs / Mala',
    customPackaging: '1 Case = 16 Mala × 15 Pcs = 240 Packets • Extra Spicy Corn Karare',
    price: 960,
    mrp: 1200,
    stock: 240,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Twisted crunchy corn curls loaded with smoking hot bhoot jholokia chilli seasoning.'
  },
  {
    name: 'Too Yumm Chilli Achari Karare 10.5g @ ₹5/- (15 Pcs/Mala • 16 Mala/Case)',
    companyName: 'Too Yumm',
    categoryName: 'Confectionery & Snacks',
    sku: 'TY-ACH-KAR-10G-240',
    unitType: 'Packet',
    unitQuantity: '10.5 Gm',
    packSize: '10.5g Sachet',
    caseSize: '16 Mala / Case (240 Pcs)',
    malaSize: '15 Pcs / Mala',
    customPackaging: '1 Case = 16 Mala × 15 Pcs = 240 Packets • Tangy Achari Curls',
    price: 960,
    mrp: 1200,
    stock: 220,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Tangy Indian mango pickle & mustard spiced crunchy karare curls with irresistible zesty kick.'
  },
  {
    name: 'Too Yumm Classic Salted Chips 10.5g @ ₹5/- (15 Pcs/Mala • 16 Mala/Case)',
    companyName: 'Too Yumm',
    categoryName: 'Confectionery & Snacks',
    sku: 'TY-CLS-CHP-10G-240',
    unitType: 'Packet',
    unitQuantity: '10.5 Gm',
    packSize: '10.5g Sachet',
    caseSize: '16 Mala / Case (240 Pcs)',
    malaSize: '15 Pcs / Mala',
    customPackaging: '1 Case = 16 Mala × 15 Pcs = 240 Packets • Rock Salted Crisp',
    price: 960,
    mrp: 1200,
    stock: 260,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Classic sea salted golden potato chips, light and crispy with 40% less saturated fat.'
  },
  {
    name: 'Too Yumm Dahi Papdi 10.5g @ ₹5/- (15 Pcs/Mala • 16 Mala/Case)',
    companyName: 'Too Yumm',
    categoryName: 'Confectionery & Snacks',
    sku: 'TY-DHI-PAP-10G-240',
    unitType: 'Packet',
    unitQuantity: '10.5 Gm',
    packSize: '10.5g Sachet',
    caseSize: '16 Mala / Case (240 Pcs)',
    malaSize: '15 Pcs / Mala',
    customPackaging: '1 Case = 16 Mala × 15 Pcs = 240 Packets • Sweet & Tangy Chaat Flavor',
    price: 960,
    mrp: 1200,
    stock: 230,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic street-style sweet dahi papdi chaat seasoning on crispy multigrain chips.'
  },
  {
    name: 'Too Yumm Korean Karare 10.5g @ ₹5/- (15 Pcs/Mala • 16 Mala/Case)',
    companyName: 'Too Yumm',
    categoryName: 'Confectionery & Snacks',
    sku: 'TY-KOR-KAR-10G-240',
    unitType: 'Packet',
    unitQuantity: '10.5 Gm',
    packSize: '10.5g Sachet',
    caseSize: '16 Mala / Case (240 Pcs)',
    malaSize: '15 Pcs / Mala',
    customPackaging: '1 Case = 16 Mala × 15 Pcs = 240 Packets • Sweet & Spicy Gochujang Curls',
    price: 960,
    mrp: 1200,
    stock: 250,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
    description: 'Trendsetting Korean BBQ style sweet and spicy gochujang glazed crunchy corn karare.'
  }
];

export const seedNewCatalogBrands = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // 1. Upsert Companies
    const companyMap = new Map<string, mongoose.Types.ObjectId>();
    for (const c of newCompanies) {
      const compDoc = await Company.findOneAndUpdate(
        { name: c.name },
        c,
        { upsert: true, new: true }
      );
      companyMap.set(c.name, compDoc._id as mongoose.Types.ObjectId);
      console.log(`✅ Company registered: ${c.name}`);
    }

    // 2. Ensure Categories
    const categoriesList = ['Food & Beverages', 'Confectionery & Snacks'];
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    for (const catName of categoriesList) {
      const catDoc = await Category.findOneAndUpdate(
        { name: catName },
        { name: catName },
        { upsert: true, new: true }
      );
      categoryMap.set(catName, catDoc._id as mongoose.Types.ObjectId);
    }

    // 3. Upsert Products
    console.log(`📦 Upserting ${newProductsList.length} new items into database...`);
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < newProductsList.length; i++) {
      const item = newProductsList[i];
      const prodId = `prod-cat-${item.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 3)}-${String(i + 1).padStart(3, '0')}`;

      const existing = await Product.findOne({ sku: item.sku });

      const prodData = {
        productId: existing ? existing.productId : prodId,
        sku: item.sku,
        name: item.name,
        companyName: item.companyName,
        companyId: companyMap.get(item.companyName),
        categoryName: item.categoryName,
        categoryId: categoryMap.get(item.categoryName),
        description: item.description,
        price: item.price,
        mrp: item.mrp,
        stock: item.stock,
        lowStockThreshold: 20,
        unitType: item.unitType || 'Piece',
        unitQuantity: item.unitQuantity,
        packSize: item.packSize,
        bundleSize: item.bundleSize || '',
        malaSize: item.malaSize || '',
        boriSize: item.boriSize || '',
        caseSize: item.caseSize,
        cartonSize: item.cartonSize || '',
        customPackaging: item.customPackaging,
        hsn: '19053100',
        isNrp: false,
        featured: i % 3 === 0,
        newProduct: true,
        status: 'Published',
        images: [
          {
            url: item.image,
            alt: item.name,
            sortOrder: 0,
            isPrimary: true,
            whiteBackground: true
          }
        ],
        createdBy: 'ADMIN',
        updatedBy: 'ADMIN'
      };

      if (existing) {
        await Product.updateOne({ sku: item.sku }, { $set: prodData });
        updated++;
      } else {
        await Product.create(prodData);
        inserted++;
      }
    }

    console.log(`🎉 Seeding complete! Inserted: ${inserted}, Updated: ${updated}, Total added: ${newProductsList.length}`);

    const totalInDb = await Product.countDocuments();
    console.log(`📊 Total Products in MongoDB Atlas across all brands: ${totalInDb}`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('❌ Error seeding new catalog brands:', error);
    process.exit(1);
  }
};

seedNewCatalogBrands();
