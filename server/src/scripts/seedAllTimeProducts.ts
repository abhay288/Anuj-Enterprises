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

export const allTimeProducts = [
  {
    name: 'All Time Acetic Acid 50 ml (Case of 12 Pcs)',
    particulars: 'ACETIC ACID',
    sku: 'ALT-ACE-50ML-12',
    unitType: 'Bottle',
    unitQuantity: '50 ml',
    packSize: '50 ml Glass Vial',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Case = 12 Glass Vials (50 ml each) • Glacial Souring Agent',
    price: 180,
    mrp: 240,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Concentrated food-grade acetic acid for commercial pickling, food processing, curdling and preservation.'
  },
  {
    name: 'All Time Achar Masala 100g (Case of 10 Pcs)',
    particulars: 'Achar masala',
    sku: 'ALT-ACH-MAS-100G-10',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Pouch',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Pouches (100g each) • Traditional Pickle Spice Mix',
    price: 320,
    mrp: 420,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic coarse-ground pickling spice blend with fennel, mustard seeds, fenugreek, and spicy red chillies.'
  },
  {
    name: 'All Time Active Dried Yeast 20g (Case of 10 Pcs)',
    particulars: 'ACTIVE DRIED YEAST',
    sku: 'ALT-DRY-YST-20G-10',
    unitType: 'Packet',
    unitQuantity: '20 Gm',
    packSize: '20g Sachet',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Sachets (20g each) • Fast Acting Baker Yeast',
    price: 160,
    mrp: 220,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'High-viability instant active dried baker yeast for fluffy breads, pizza dough, kulchas, and bhaturas.'
  },
  {
    name: 'All Time Ajinomoto / MSG 20g (Case of 10 Pcs)',
    particulars: 'AJINOMOTO',
    sku: 'ALT-AJI-20G-10',
    unitType: 'Packet',
    unitQuantity: '20 Gm',
    packSize: '20g Sachet',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Sachets (20g each) • Umami Seasoning Salt',
    price: 120,
    mrp: 160,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Pure crystal monosodium glutamate for enhancing umami flavour in chowmein, fried rice, and soups.'
  },
  {
    name: 'All Time Arqnana 620 ml (Case of 24 Pcs)',
    particulars: 'ARQNANA',
    sku: 'ALT-ARQ-620ML-24',
    unitType: 'Bottle',
    unitQuantity: '620 ml',
    packSize: '620 ml Glass Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Case = 24 Glass Bottles (620 ml each) • Distilled Mint Water (Pudina Ark)',
    price: 960,
    mrp: 1320,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional steam-distilled pudina / mint water (Arq-e-Nana) soothing for digestion, acidity and cool mocktails.'
  },
  {
    name: 'All Time Baking Soda 100g (Case of 12 Pcs)',
    particulars: 'BAKING SODA',
    sku: 'ALT-BAK-SOD-100G-12',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Case = 12 Boxes (100g each) • Pure Sodium Bicarbonate',
    price: 180,
    mrp: 240,
    stock: 190,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Food grade pure sodium bicarbonate for fast rising, batter fluffing, chana tenderizing, and domestic cleaning.'
  },
  {
    name: 'All Time Baking Powder 100g (Case of 12 Pcs)',
    particulars: 'BAKING POWDER',
    sku: 'ALT-BAK-POW-100G-12',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Case = 12 Boxes (100g each) • Double Action Leavener',
    price: 240,
    mrp: 320,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Double action leavening baking powder providing uniform aerated rise for cakes, cookies, and tea rolls.'
  },
  {
    name: 'All Time Baking Powder 400g (Case of 40 Pcs)',
    particulars: 'BAKING POWDER',
    sku: 'ALT-BAK-POW-400G-40',
    unitType: 'Packet',
    unitQuantity: '400 Gm',
    packSize: '400g Tin / Canister',
    caseSize: '40 Pcs / Case',
    customPackaging: '1 Case = 40 Canisters (400g each) • Commercial Bakery Pack',
    price: 2400,
    mrp: 3200,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Commercial bakery 400g canister pack of double acting baking powder for high volume bakeries and confectioneries.'
  },
  {
    name: 'All Time Chilli Sauce Pouch 8g (72 Pcs / 20 Pkt • Case of 1440 Pcs)',
    particulars: 'CHILLI SAUCE POUCH',
    sku: 'ALT-CHL-PCH-8G-1440',
    unitType: 'Packet',
    unitQuantity: '8 Gm',
    packSize: '8g Sachet (72 Pcs Inner)',
    caseSize: '20 Pkt / Case (1440 Pcs)',
    bundleSize: '20 Packets Master Bag',
    customPackaging: '1 Master Case = 20 Packets × 72 Sachets = 1440 Individual 8g Pouches • Fast Food Sachet',
    price: 1150,
    mrp: 1440,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Convenient single-serve 8g green chilli sauce portion packs for takeaways, samosas, burgers and street carts.'
  },
  {
    name: 'All Time Chilli Sauce Pouch 8g (100 Pcs / 15 Pkt • Case of 1500 Pcs)',
    particulars: 'CHILLI SAUCE POUCH',
    sku: 'ALT-CHL-PCH-8G-1500',
    unitType: 'Packet',
    unitQuantity: '8 Gm',
    packSize: '8g Sachet (100 Pcs Inner)',
    caseSize: '15 Pkt / Case (1500 Pcs)',
    bundleSize: '15 Packets Master Bag',
    customPackaging: '1 Master Case = 15 Packets × 100 Sachets = 1500 Individual 8g Pouches • High Economy Pack',
    price: 1200,
    mrp: 1500,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: '100-sachet packet bundle of tangy green chilli dip sauce, perfect for high-traffic food courts and canteens.'
  },
  {
    name: 'All Time Green Chilli Sauce 240g (Case of 48 Pcs)',
    particulars: 'CHILLI SAUCE',
    sku: 'ALT-CHL-SAU-240G-48',
    unitType: 'Bottle',
    unitQuantity: '240 Gm',
    packSize: '240g Bottle',
    caseSize: '48 Pcs / Case',
    customPackaging: '1 Master Case = 48 Bottles (240g each) • Table Top Dispenser',
    price: 1440,
    mrp: 1920,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Zesty green chilli sauce made with fresh garden chillies, garlic and spices for table tops and fast-food counters.'
  },
  {
    name: 'All Time Green Chilli Sauce 640g (Case of 24 Pcs)',
    particulars: 'CHILLI SAUCE',
    sku: 'ALT-CHL-SAU-640G-24',
    unitType: 'Bottle',
    unitQuantity: '640 Gm',
    packSize: '640g Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Bottles (640g each) • Kitchen Sauce Bottle',
    price: 1200,
    mrp: 1560,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Large 640g squeezy/glass bottle green chilli sauce for Chinese cooking, rolls, chowmein and snacks.'
  },
  {
    name: 'All Time Green Chilli Sauce 5 Ltr Commercial Can (Case of 4 Pcs)',
    particulars: 'CHILLI SAUCE',
    sku: 'ALT-CHL-SAU-5L-4',
    unitType: 'Can',
    unitQuantity: '5 Ltr',
    packSize: '5 Ltr Jar/Can',
    caseSize: '4 Pcs / Case (20 Ltr)',
    customPackaging: '1 Master Case = 4 Cans (5 Litre each) • Commercial Kitchen Jerry Can',
    price: 1280,
    mrp: 1680,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Bulk 5-litre restaurant jar of spicy green chilli sauce for fast-food chefs, roll corners, and banquet catering.'
  },
  {
    name: 'All Time Citric Acid 20g (Case of 10 Pcs)',
    particulars: 'citric acid',
    sku: 'ALT-CIT-ACD-20G-10',
    unitType: 'Packet',
    unitQuantity: '20 Gm',
    packSize: '20g Sachet',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Sachets (20g each) • Household Nimbu Sat',
    price: 110,
    mrp: 150,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Pure food-grade tartaric citric acid crystals in retail sachets for home pickling, syrups, and rasgulla curdling.'
  },
  {
    name: 'All Time Cocoa Powder 50g (Case of 10 Pcs)',
    particulars: 'COCO POWDER',
    sku: 'ALT-COC-POW-50G-10',
    unitType: 'Packet',
    unitQuantity: '50 Gm',
    packSize: '50g Box',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Boxes (50g each) • Dark Rich Cocoa',
    price: 280,
    mrp: 380,
    stock: 170,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Rich dark unsweetened Dutch-processed cocoa powder for baking chocolate cakes, brownies, and hot chocolate.'
  },
  {
    name: 'All Time Custard Vanilla 100g (Case of 10 Pcs)',
    particulars: 'CUSTARD VENILLA',
    sku: 'ALT-CUS-VAN-100G-10',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Boxes (100g each) • Creamy Vanilla Dessert Mix',
    price: 270,
    mrp: 360,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Silky smooth vanilla custard powder for fruit salads, puddings, pies, and dessert creams.'
  },
  {
    name: 'All Time Cornflour 100g (Case of 10 Pcs)',
    particulars: 'CORNFLOUR',
    sku: 'ALT-CRN-FLR-100G-10',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Boxes (100g each) • Ultra Fine White Starch',
    price: 220,
    mrp: 300,
    stock: 190,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    description: 'Finely milled pure corn starch flour for lump-free soup thickening, frying crispy manchurian and sauce gloss.'
  },
  {
    name: 'All Time Drinking Chocolate 100g (Case of 10 Pcs)',
    particulars: 'DRINKING CHOCOLATE',
    sku: 'ALT-DRK-CHO-100G-10',
    unitType: 'Packet',
    unitQuantity: '100 Gm',
    packSize: '100g Box',
    caseSize: '10 Pcs / Case',
    customPackaging: '1 Case = 10 Boxes (100g each) • Instant Hot Chocolate Mix',
    price: 340,
    mrp: 460,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Instant rich drinking chocolate mix with real milk solids and cocoa for comforting hot cocoa and cold chocolate shakes.'
  },
  {
    name: 'All Time Fun Tomato Sauce Pouch 8g (72 Pcs / 20 Pkt • Case of 1440 Pcs)',
    particulars: 'FUN TOMATO SAUCE POUCH',
    sku: 'ALT-TOM-PCH-8G-1440',
    unitType: 'Packet',
    unitQuantity: '8 Gm',
    packSize: '8g Sachet (72 Pcs Inner)',
    caseSize: '20 Pkt / Case (1440 Pcs)',
    bundleSize: '20 Packets Master Bag',
    customPackaging: '1 Master Case = 20 Packets × 72 Sachets = 1440 Individual 8g Pouches • Red Tomato Ketchup',
    price: 1150,
    mrp: 1440,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Single portion 8g sweet and tangy tomato ketchup sachets for takeout burgers, fries, samosas and snacks.'
  },
  {
    name: 'All Time Fun Tomato Sauce Pouch 8g (100 Pcs / 15 Pkt • Case of 1500 Pcs)',
    particulars: 'FUN TOMATO SAUCE POUCH',
    sku: 'ALT-TOM-PCH-8G-1500',
    unitType: 'Packet',
    unitQuantity: '8 Gm',
    packSize: '8g Sachet (100 Pcs Inner)',
    caseSize: '15 Pkt / Case (1500 Pcs)',
    bundleSize: '15 Packets Master Bag',
    customPackaging: '1 Master Case = 15 Packets × 100 Sachets = 1500 Individual 8g Pouches • Institutional Dip Pack',
    price: 1200,
    mrp: 1500,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: '100-sachet economy bundle of ripe red tomato sauce for canteen counters, tiffin deliveries and delivery parcels.'
  },
  {
    name: 'All Time Fun Tomato Sauce 240g (Case of 48 Pcs)',
    particulars: 'FUN TOMATO SAUCE',
    sku: 'ALT-TOM-SAU-240G-48',
    unitType: 'Bottle',
    unitQuantity: '240 Gm',
    packSize: '240g Bottle',
    caseSize: '48 Pcs / Case',
    customPackaging: '1 Master Case = 48 Bottles (240g each) • Table Ketchup Bottle',
    price: 1440,
    mrp: 1920,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Thick, tangy and spiced ripe red tomato sauce in standard household and cafe tabletop glass bottles.'
  },
  {
    name: 'All Time Fun Tomato Sauce 670g (Case of 24 Pcs)',
    particulars: 'FUN TOMATO SAUCE',
    sku: 'ALT-TOM-SAU-670G-24',
    unitType: 'Bottle',
    unitQuantity: '670 Gm',
    packSize: '670g Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Bottles (670g each) • Medium Kitchen Bottle',
    price: 1260,
    mrp: 1680,
    stock: 135,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Family size 670g bottle of delicious sweet and savoury tomato sauce with vibrant aroma and rich consistency.'
  },
  {
    name: 'All Time Fun Tomato Sauce 1 Kg (Case of 12 Pcs)',
    particulars: 'FUN TOMATO SAUCE',
    sku: 'ALT-TOM-SAU-1KG-12',
    unitType: 'Bottle',
    unitQuantity: '1 Kg',
    packSize: '1 Kg Pack',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Master Case = 12 Bottles/Packs (1 Kg each) • 12 Kg Master Case',
    price: 900,
    mrp: 1200,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: '1 kg economy bottle of thick rich tomato ketchup for fast food restaurants, snack bars and large families.'
  },
  {
    name: 'All Time Fun Tomato Sauce 5 Ltr Commercial Can (Case of 4 Pcs)',
    particulars: 'FUN TOMATO SAUCE',
    sku: 'ALT-TOM-SAU-5L-4',
    unitType: 'Can',
    unitQuantity: '5 Ltr',
    packSize: '5 Ltr Jar/Can',
    caseSize: '4 Pcs / Case (20 Ltr)',
    customPackaging: '1 Master Case = 4 Cans (5 Litre each) • Commercial Foodservice Jerry Can',
    price: 1280,
    mrp: 1680,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Bulk 5-litre commercial food-grade canister of rich red tomato sauce for restaurant kitchens and snack franchises.'
  },
  {
    name: 'All Time Tomato Puree 800g (Case of 24 Pcs)',
    particulars: 'TOMATO PUREE',
    sku: 'ALT-TOM-PUR-800G-24',
    unitType: 'Piece',
    unitQuantity: '800 Gm',
    packSize: '800g Tin',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Tins (800g each) • Concentrated Natural Tomato Puree',
    price: 1920,
    mrp: 2520,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Concentrated natural tomato puree cooked from vine-ripened tomatoes, with no artificial preservatives, for rich makhani gravies.'
  },
  {
    name: 'All Time White Vinegar 240 Gm (Case of 48 Pcs)',
    particulars: 'WHITE. VINEGAR',
    sku: 'ALT-WHT-VIN-240G-48',
    unitType: 'Bottle',
    unitQuantity: '240 Gm',
    packSize: '240g Bottle',
    caseSize: '48 Pcs / Case',
    customPackaging: '1 Master Case = 48 Bottles (240g each) • Synthetic White Vinegar',
    price: 1200,
    mrp: 1680,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Clear synthetic white vinegar offering crisp 4% acidity for Indo-Chinese chowmein, marinades and salads.'
  },
  {
    name: 'All Time White Vinegar 600 Gm (Case of 24 Pcs)',
    particulars: 'WHITE. VINEGAR',
    sku: 'ALT-WHT-VIN-600G-24',
    unitType: 'Bottle',
    unitQuantity: '600 Gm',
    packSize: '600g Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Bottles (600g each) • Kitchen Vinegar Dispenser',
    price: 1080,
    mrp: 1440,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: '600g family pack bottle of distilled white cooking vinegar, ideal for pickles, Chinese sauces, and cleaning.'
  },
  {
    name: 'All Time Soya Sauce 275 Gm (Case of 48 Pcs)',
    particulars: 'SOYA SAUCE',
    sku: 'ALT-SOY-SAU-275G-48',
    unitType: 'Bottle',
    unitQuantity: '275 Gm',
    packSize: '275g Bottle',
    caseSize: '48 Pcs / Case',
    customPackaging: '1 Master Case = 48 Bottles (275g each) • Dark Rich Soy Sauce',
    price: 1440,
    mrp: 1920,
    stock: 135,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Naturally fermented dark rich soya sauce giving deep golden-brown glaze and savoury saltiness to noodles and momos.'
  },
  {
    name: 'All Time Soya Sauce 800 Gm (Case of 24 Pcs)',
    particulars: 'SOYA SAUCE',
    sku: 'ALT-SOY-SAU-800G-24',
    unitType: 'Bottle',
    unitQuantity: '800 Gm',
    packSize: '800g Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Bottles (800g each) • Restaurant Chef Size',
    price: 1320,
    mrp: 1800,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: '800g large chef-size bottle of dark soya sauce for heavy commercial wok tossing in fast food establishments.'
  },
  {
    name: 'All Time Sugar Cane Vinegar 600 Gm (Case of 24 Pcs)',
    particulars: 'SUGAR CANE VINEGAR',
    sku: 'ALT-SCN-VIN-600G-24',
    unitType: 'Bottle',
    unitQuantity: '600 Gm',
    packSize: '600g Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Bottles (600g each) • Ganne Ka Sirka',
    price: 1200,
    mrp: 1680,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional desi fermented sugarcane juice vinegar (Ganne Ka Sirka) packed with natural enzymes and rustic punchy tang.'
  },
  {
    name: 'All Time Jamun Vinegar 620 ml (Case of 24 Pcs)',
    particulars: 'JAMUN VINEGAR',
    sku: 'ALT-JAM-VIN-620G-24',
    unitType: 'Bottle',
    unitQuantity: '620 ml',
    packSize: '620 ml Bottle',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Master Case = 24 Bottles (620 ml each) • Jamun Sirka Health Tonic',
    price: 1680,
    mrp: 2400,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Raw unfiltered fermented Indian black plum (Jamun Sirka) vinegar valued in Ayurveda for diabetes management and gut health.'
  },
  {
    name: 'All Time Red Chilli Sauce 200 Gm (Case of 48 Pcs)',
    particulars: 'RED CHILLI SAUCE',
    sku: 'ALT-RED-CHL-200G-48',
    unitType: 'Bottle',
    unitQuantity: '200 Gm',
    packSize: '200g Bottle',
    caseSize: '48 Pcs / Case',
    customPackaging: '1 Master Case = 48 Bottles (200g each) • Spicy Red Chilli Condiment',
    price: 1440,
    mrp: 1920,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Spicy fiery red chilli dip sauce made with ripe red chillies and garlic for Indo-Chinese chowmein and street snack dips.'
  },
  {
    name: 'All Time Red Chilli Sauce 640 Gm (Case of 12 Pcs)',
    particulars: 'RED CHILLI SAUCE',
    sku: 'ALT-RED-CHL-640G-12',
    unitType: 'Bottle',
    unitQuantity: '640 Gm',
    packSize: '640g Bottle',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Master Case = 12 Bottles (640g each) • Chef Pack Red Chilli',
    price: 720,
    mrp: 960,
    stock: 125,
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
    description: 'Large 640g bottle of spicy red chilli sauce for commercial food cooking, wok preparations and condiment counters.'
  },
  {
    name: 'All Time Moti Sewai (Noodles) 650 Gm (Case of 25 Pcs)',
    particulars: 'MOTI SEWAI (NOODLES)',
    sku: 'ALT-MOT-SEW-650G-25',
    unitType: 'Packet',
    unitQuantity: '650 Gm',
    packSize: '650g Pack',
    caseSize: '25 Pcs / Case',
    customPackaging: '1 Case = 25 Packs (650g each) • Thick Extruded Vermicelli Noodles',
    price: 1250,
    mrp: 1625,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Thick-gauge wheat vermicelli (Moti Sewai) ideal for street-style boiled noodles, kheer, and sweet savouries.'
  },
  {
    name: 'All Time Maheen Sewai (Noodles) 650 Gm (Case of 25 Pcs)',
    particulars: 'MAHEEN SEWAI (NOODLES)',
    sku: 'ALT-MAH-SEW-650G-25',
    unitType: 'Packet',
    unitQuantity: '650 Gm',
    packSize: '650g Pack',
    caseSize: '25 Pcs / Case',
    customPackaging: '1 Case = 25 Packs (650g each) • Super Fine Hakka Noodles',
    price: 1250,
    mrp: 1625,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Extra-fine strand extruded noodles (Maheen Sewai) that hold firmness and texture when tossed in hot chilli garlic sauces.'
  },
  {
    name: 'All Time Maheen Sewai (Chow) 80 Gm (Case of 12 Pcs)',
    particulars: 'MAHEEN SEWAI(CHOW)',
    sku: 'ALT-MAH-CHW-80G-12',
    unitType: 'Packet',
    unitQuantity: '80 Gm',
    packSize: '80g Pouch',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Case = 12 Pouches (80g each) • Single Serve Chowmein Sewai',
    price: 180,
    mrp: 240,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: 'Convenient 80g snack size pack of fine chowmein vermicelli sewai for quick single-plate cooking.'
  },
  {
    name: 'All Time Maheen Sewai (Chow) 350 Gm (Case of 40 Pcs)',
    particulars: 'MAHEEN SEWAI(CHOW)',
    sku: 'ALT-MAH-CHW-350G-40',
    unitType: 'Packet',
    unitQuantity: '350 Gm',
    packSize: '350g Pack',
    caseSize: '40 Pcs / Case',
    customPackaging: '1 Case = 40 Packs (350g each) • Medium Family Chowmein Pack',
    price: 1600,
    mrp: 2200,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
    description: '350g family-size pack of fine chow vermicelli sewai with high wheat elasticity for delicious homemade chowmein.'
  },
  {
    name: 'All Time Achar Mix 80 Gm (Case of 6 Pcs)',
    particulars: 'ACHAR MIX',
    sku: 'ALT-ACH-MIX-80G-6',
    unitType: 'Piece',
    unitQuantity: '80 Gm',
    packSize: '80g Pack / Pouch',
    caseSize: '6 Pcs / Case',
    customPackaging: '1 Case = 6 Pouches (80g each) • Handy Mixed Pickle Pouch',
    price: 90,
    mrp: 120,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Handy retail pack of mixed vegetable pickle with mango, carrot, lime, and chillies soaked in mustard oil.'
  },
  {
    name: 'All Time Achar Mix 500 Gm (Case of 20 Pcs)',
    particulars: 'ACHAR MIX',
    sku: 'ALT-ACH-MIX-500G-20',
    unitType: 'Piece',
    unitQuantity: '500 Gm',
    packSize: '500g Jar',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Jars (500g each) • Family Mixed Pickle Jar',
    price: 1300,
    mrp: 1700,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional desi mixed pickle jar filled with crunchy vegetables, aromatic mustard seeds, and whole spices in mustard oil.'
  },
  {
    name: 'All Time Achar Mango 80 Gm (Case of 6 Pcs)',
    particulars: 'ACHAR MANGO',
    sku: 'ALT-ACH-MGO-80G-6',
    unitType: 'Piece',
    unitQuantity: '80 Gm',
    packSize: '80g Pouch',
    caseSize: '6 Pcs / Case',
    customPackaging: '1 Case = 6 Pouches (80g each) • Handy Mango Pickle Pouch',
    price: 90,
    mrp: 120,
    stock: 190,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Zesty green raw mango pickle bits infused with fenugreek, nigella seeds and pure mustard oil.'
  }
];

export const seedAllTimeProducts = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // 1. Ensure Company "All Time" exists
    const company = await Company.findOneAndUpdate(
      { name: 'All Time' },
      {
        name: 'All Time',
        logo: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=300&q=80',
        description: 'Manufacturer of quality culinary sauces, vinegars, noodles, baking mixes, pickles, and canned fruit slices.',
        status: 'Active',
        featured: true,
        isNew: true
      },
      { upsert: true, new: true }
    );
    console.log('✅ Company registered:', company.name, '(ID:', company._id, ')');

    // 2. Ensure Category "Food & Beverages" exists
    const category = await Category.findOneAndUpdate(
      { name: 'Food & Beverages' },
      { name: 'Food & Beverages' },
      { upsert: true, new: true }
    );

    // 3. Upsert each of the 41 products
    console.log(`📦 Upserting ${allTimeProducts.length} All Time products into database...`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < allTimeProducts.length; i++) {
      const item = allTimeProducts[i];
      const prodId = `prod-alt-${String(i + 1).padStart(3, '0')}`;

      const existing = await Product.findOne({ sku: item.sku });

      const prodData = {
        productId: existing ? existing.productId : prodId,
        sku: item.sku,
        name: item.name,
        companyName: 'All Time',
        companyId: company._id,
        categoryName: 'Food & Beverages',
        categoryId: category._id,
        description: item.description,
        price: item.price,
        mrp: item.mrp,
        stock: item.stock,
        lowStockThreshold: 20,
        unitType: item.unitType || 'Piece',
        unitQuantity: item.unitQuantity,
        packSize: item.packSize,
        bundleSize: item.bundleSize || '',
        malaSize: '',
        boriSize: '',
        caseSize: item.caseSize,
        cartonSize: '',
        customPackaging: item.customPackaging,
        hsn: '19053100',
        isNrp: false,
        featured: i < 8,
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
        updatedCount++;
      } else {
        await Product.create(prodData);
        insertedCount++;
      }
    }

    console.log(`🎉 Seeding finished! Inserted: ${insertedCount}, Updated: ${updatedCount}, Total All Time items: ${allTimeProducts.length}`);

    const totalInDb = await Product.countDocuments();
    console.log(`📊 Total products across all brands in MongoDB Atlas: ${totalInDb}`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('❌ Error seeding All Time products:', error);
    process.exit(1);
  }
};

seedAllTimeProducts();
