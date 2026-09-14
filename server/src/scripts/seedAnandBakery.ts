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

export const anandBakeryProducts = [
  {
    name: 'Anand Bakery Mini Khari 300g (Case of 15 Pcs)',
    particulars: 'MINI KHARI',
    sku: 'AND-MKH-300G-15',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '15 Pcs / Case',
    customPackaging: '1 Case = 15 Boxes (300g each) • Crispy Tea-time Khari',
    price: 675,
    mrp: 825,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Crisp, golden-baked mini puff pastry khari made with pure vegetable fats for perfect crunch and tea-time pairings.'
  },
  {
    name: 'Anand Bakery Tie Khari 300g (Case of 15 Pcs)',
    particulars: 'TIE KHARI',
    sku: 'AND-TKH-300G-15',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '15 Pcs / Case',
    customPackaging: '1 Case = 15 Boxes (300g each) • Layered Bow-Tie Khari',
    price: 675,
    mrp: 825,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Signature layered bow-tie shaped puff khari biscuits, light, flaky and baked fresh for wholesale distribution.'
  },
  {
    name: 'Anand Bakery Special Fine 12 Pcs (Case of 24 Pcs)',
    particulars: 'SPECIAL FINE',
    sku: 'AND-SPF-12P-24',
    unitQuantity: '12 Pcs',
    packSize: '12 Pcs Pack',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Case = 24 Packs (12 Pcs each) • Special Fine Treat',
    price: 840,
    mrp: 1080,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Delicate fine-baked bakery biscuits made with refined flour and subtle aromatic spices for premium institutional tea stalls.'
  },
  {
    name: 'Anand Bakery Ajwain Cookies 300g (Case of 20 Pcs)',
    particulars: 'AJWAIN COOKIES',
    sku: 'AND-AJW-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Digestive Ajwain Biscuits',
    price: 1100,
    mrp: 1400,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional savoury carom seed (Ajwain) cookies infused with digestive herbs and light butter richness.'
  },
  {
    name: 'Anand Bakery Jeeri Cookies 300g (Case of 20 Pcs)',
    particulars: 'JEERI COOKIES',
    sku: 'AND-JEE-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Roasted Cumin Seeds',
    price: 1100,
    mrp: 1400,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    description: 'Crispy salted cookies toasted with roasted cumin seeds (Jeera) delivering an authentic aromatic flavour.'
  },
  {
    name: 'Anand Bakery Gol Jeeri Cookies 300g (Case of 20 Pcs)',
    particulars: 'GOL JEERI COOKIES',
    sku: 'AND-GOL-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Round Jeera Biscuits',
    price: 1100,
    mrp: 1400,
    stock: 125,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    description: 'Classic round-cut savoury cumin biscuits, perfectly portioned and baked to crisp perfection.'
  },
  {
    name: 'Anand Bakery Kalaungi Cookies 300g (Case of 20 Pcs)',
    particulars: 'KALAUNGI COOKIES',
    sku: 'AND-KAL-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Black Nigella Seeds',
    price: 1100,
    mrp: 1400,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Distinctive nigella seed (Kalonji) bakery cookies offering herbal aroma and savoury tea accompaniment.'
  },
  {
    name: 'Anand Bakery Gari Laccha Cookies 300g (Case of 20 Pcs)',
    particulars: 'GARI LACCHA COOKIES',
    sku: 'AND-GAR-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Grated Coconut Laccha',
    price: 1200,
    mrp: 1500,
    stock: 115,
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    description: 'Rich desiccated shredded coconut (Gari Laccha) cookies baked with sweet milky aroma and crunchy texture.'
  },
  {
    name: 'Anand Bakery Beeja Cookies 300g (Case of 20 Pcs)',
    particulars: 'BEEJA COOKIES',
    sku: 'AND-BEE-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Multi-Seed Energy Treat',
    price: 1100,
    mrp: 1400,
    stock: 105,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Wholesome bakery cookies packed with nutritious roasted edible seeds providing crisp bite and wholesome energy.'
  },
  {
    name: 'Anand Bakery Peanut Cookies 300g (Case of 20 Pcs)',
    particulars: 'Peanut Cookies',
    sku: 'AND-PEA-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Crushed Roasted Peanuts',
    price: 1200,
    mrp: 1500,
    stock: 135,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Crunchy golden cookies studded with roasted groundnuts delivering rich nutty flavour in every bite.'
  },
  {
    name: 'Anand Bakery Cherry Cookies 300g (Case of 20 Pcs)',
    particulars: 'CHERRY COOKIES',
    sku: 'AND-CHE-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Glazed Red Cherries',
    price: 1200,
    mrp: 1500,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    description: 'Delightful sweet butter cookies topped with glazed candied cherry bits for kids and festive occasions.'
  },
  {
    name: 'Anand Bakery Atta Cookies 300g (Case of 20 Pcs)',
    particulars: 'ATTA COOKIES',
    sku: 'AND-ATT-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • 100% Whole Wheat',
    price: 1100,
    mrp: 1400,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Nutritious 100% wholewheat atta cookies formulated with low sugar and wholesome dietary fibre.'
  },
  {
    name: 'Anand Bakery Litchi Cookies 300g (Case of 20 Pcs)',
    particulars: 'LITCHI COOKIES',
    sku: 'AND-LIT-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Tropical Litchi Essence',
    price: 1200,
    mrp: 1500,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    description: 'Exotic fruit-infused biscuits featuring sweet tropical litchi essence and delicate bakery sweetness.'
  },
  {
    name: 'Anand Bakery Butter Salt Cookies 300g (Case of 20 Pcs)',
    particulars: 'BUTTER SALT COOKIES',
    sku: 'AND-BUT-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Sweet & Salted Butter',
    price: 1200,
    mrp: 1500,
    stock: 170,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Irresistible balance of creamery butter and sea salt crystals for the classic sweet-and-salty bakery crunch.'
  },
  {
    name: 'Anand Bakery W. Khatai Cookies 250g (Case of 20 Pcs)',
    particulars: 'W. KHATAI COOKIES',
    sku: 'AND-WKH-250G-20',
    unitQuantity: '250 Gm',
    packSize: '250g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (250g each) • Wheat Khatai Specialty',
    price: 1100,
    mrp: 1400,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Authentic Indian-style wheat nankhatai shortbread cookies melting smoothly in the mouth with cardamom hints.'
  },
  {
    name: 'Anand Bakery Nan Khatai Cookies 300g (Case of 20 Pcs)',
    particulars: 'NAN KHATAI COOKIES',
    sku: 'AND-NAN-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Traditional Royal Nankhatai',
    price: 1200,
    mrp: 1500,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Royal desi bakery nankhatai cookies prepared with besan, sooji and aromatic cardamom for festive delight.'
  },
  {
    name: 'Anand Bakery Cherry Khatai 300g (Case of 20 Pcs)',
    particulars: 'CHERRY KHATAI',
    sku: 'AND-CHK-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Khatai Crowned with Cherry',
    price: 1200,
    mrp: 1500,
    stock: 115,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80',
    description: 'Velvety shortbread khatai crowned with rich ruby candied cherry morsels for enticing retail shelves.'
  },
  {
    name: 'Anand Bakery Fruit Khatai Cookies 300g (Case of 20 Pcs)',
    particulars: 'FRUIT KHATAI COOKIES',
    sku: 'AND-FRU-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Tutti Frutti Khatai',
    price: 1200,
    mrp: 1500,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    description: 'Colourful tutti-frutti infused nankhatai biscuits blending buttery crumb with sweet chewy fruit bites.'
  },
  {
    name: 'Anand Bakery Flora Badam Cookies 300g (Case of 20 Pcs)',
    particulars: 'flora Badam COOKIES',
    sku: 'AND-FLO-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Floral Almond Cookies',
    price: 1300,
    mrp: 1600,
    stock: 125,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Artisanal flower-shaped cookies topped with sliced California almonds and delicate saffron-rose essence.'
  },
  {
    name: 'Anand Bakery Milk Badam Cookies 300g (Case of 20 Pcs)',
    particulars: 'MILK BADAM COOKIES',
    sku: 'AND-MBD-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Condensed Milk & Badam',
    price: 1300,
    mrp: 1600,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Enriched dairy cookies baked with real milk solids and roasted almond flakes for nutritious tea-time crunch.'
  },
  {
    name: 'Anand Bakery Besan Badam Cookies 300g (Case of 20 Pcs)',
    particulars: 'BESAN BADAM COOKIES',
    sku: 'AND-BBD-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Roasted Gramflour & Almonds',
    price: 1300,
    mrp: 1600,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional slow-roasted gram flour (besan) cookies loaded with toasted almond bits and pure ghee aroma.'
  },
  {
    name: 'Anand Bakery Kaju Namkeen Cookies 300g (Case of 20 Pcs)',
    particulars: 'KAJU NAMKEEN COOKIES',
    sku: 'AND-KAJ-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Cashew Nut Savoury Biscuits',
    price: 1400,
    mrp: 1700,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    description: 'Premium savoury cashew biscuits garnished with whole crushed cashews and mild black pepper.'
  },
  {
    name: 'Anand Bakery Butter Lachcha 300g (Case of 20 Pcs)',
    particulars: 'BUTTER LACHCHA',
    sku: 'AND-BLA-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Butter Layered Crisps',
    price: 1200,
    mrp: 1500,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Flaky spiralled butter lachcha pastries baked crisp and tender with mouthwatering rich aroma.'
  },
  {
    name: 'Anand Bakery Pure Coconut Cookies 300g (Case of 20 Pcs)',
    particulars: 'PURE COCONUT COOKIES',
    sku: 'AND-PCO-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • 100% Desiccated Coconut',
    price: 1200,
    mrp: 1500,
    stock: 135,
    image: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?auto=format&fit=crop&w=800&q=80',
    description: 'Tropical crunchy biscuits coated with pure sun-dried desiccated coconut flakes for authentic island coconut flavour.'
  },
  {
    name: 'Anand Bakery Bread Rusk 135g (Case of 24 Pcs)',
    particulars: 'BREAD RUSK',
    sku: 'AND-BRK-135G-24',
    unitQuantity: '135 Gm',
    packSize: '135g Pack',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Case = 24 Packs (135g each) • Handy Chai Toast Rusk',
    price: 600,
    mrp: 720,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Double-baked crispy golden bread rusks, convenient 135g pack size ideal for quick tea dips and travel snacking.'
  },
  {
    name: 'Anand Bakery Bread Rusk 275g (Case of 24 Pcs)',
    particulars: 'BREAD RUSK',
    sku: 'AND-BRK-275G-24',
    unitQuantity: '275 Gm',
    packSize: '275g Family Pack',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Case = 24 Packs (275g each) • Family Size Chai Toast',
    price: 960,
    mrp: 1200,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Popular family pack crispy wheat bread rusks with crunchy texture, mild sweetness, and cardamom essence.'
  },
  {
    name: 'Anand Bakery Suji Rusk 275g (Case of 24 Pcs)',
    particulars: 'SUJI RUSK 275GM',
    sku: 'AND-SRK-275G-24',
    unitQuantity: '275 Gm',
    packSize: '275g Pack',
    caseSize: '24 Pcs / Case',
    customPackaging: '1 Case = 24 Packs (275g each) • Premium Semolina (Suji) Rusk',
    price: 960,
    mrp: 1200,
    stock: 190,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Premium semolina (Suji) rusks infused with real saunf (fennel) and elaichi, double-baked to super-crunchy perfection.'
  },
  {
    name: 'Anand Bakery Milk Rusk 300g (Case of 20 Pcs)',
    particulars: 'MILK RUSK',
    sku: 'AND-MRK-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Rich Dairy Milk Rusk',
    price: 900,
    mrp: 1100,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Creamy milk-enriched golden toast rusks designed to absorb hot tea while retaining satisfying crunchiness.'
  },
  {
    name: 'Anand Bakery Mewa Bite Rusk 400g (Case of 12 Pcs)',
    particulars: 'MEWA BITE RUSK',
    sku: 'AND-MBR-400G-12',
    unitQuantity: '400 Gm',
    packSize: '400g Jumbo Box',
    caseSize: '12 Pcs / Case',
    customPackaging: '1 Case = 12 Jumbo Boxes (400g each) • Dry Fruit Mewa Rusk',
    price: 780,
    mrp: 960,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Luxurious dry fruit toast loaded with crushed cashews, almonds and pistachio chunks in generous 400g boxes.'
  },
  {
    name: 'Anand Bakery Cake Rusk 300g (Case of 20 Pcs)',
    particulars: 'CAKE RUSK',
    sku: 'AND-CRK-300G-20',
    unitQuantity: '300 Gm',
    packSize: '300g Box',
    caseSize: '20 Pcs / Case',
    customPackaging: '1 Case = 20 Boxes (300g each) • Twice-Baked Sponge Cake Rusk',
    price: 1100,
    mrp: 1400,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80',
    description: 'Heritage style twice-baked vanilla sponge cake slices with airy, sweet crunch that melts effortlessly in hot milk or chai.'
  }
];

export const seedAnandBakery = async () => {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // 1. Ensure Company "Anand Bakery" exists
    const company = await Company.findOneAndUpdate(
      { name: 'Anand Bakery' },
      {
        name: 'Anand Bakery',
        logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
        description: 'Manufacturer & distributor of premium traditional khari, cookies, rusks and bakery confections.',
        status: 'Active',
        featured: true,
        isNew: true
      },
      { upsert: true, new: true }
    );
    console.log('✅ Company registered:', company.name, '(ID:', company._id, ')');

    // 2. Ensure Category "Confectionery & Snacks" exists
    const category = await Category.findOneAndUpdate(
      { name: 'Confectionery & Snacks' },
      { name: 'Confectionery & Snacks' },
      { upsert: true, new: true }
    );
    console.log('✅ Category verified:', category.name);

    // 3. Upsert each of the 30 products
    console.log(`📦 Upserting ${anandBakeryProducts.length} Anand Bakery products into database...`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 0; i < anandBakeryProducts.length; i++) {
      const item = anandBakeryProducts[i];
      const prodId = `prod-anand-${String(i + 1).padStart(3, '0')}`;

      const existing = await Product.findOne({ sku: item.sku });

      const prodData = {
        productId: existing ? existing.productId : prodId,
        sku: item.sku,
        name: item.name,
        companyName: 'Anand Bakery',
        companyId: company._id,
        categoryName: 'Confectionery & Snacks',
        categoryId: category._id,
        description: item.description,
        price: item.price,
        mrp: item.mrp,
        stock: item.stock,
        lowStockThreshold: 20,
        unitType: 'Packet',
        unitQuantity: item.unitQuantity,
        packSize: item.packSize,
        bundleSize: '',
        malaSize: '',
        boriSize: '',
        caseSize: item.caseSize,
        cartonSize: '',
        customPackaging: item.customPackaging,
        hsn: '19053100',
        isNrp: false,
        featured: i < 6, // First 6 featured on homepage
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

    console.log(`🎉 Seeding finished! Inserted: ${insertedCount}, Updated: ${updatedCount}, Total Anand Bakery items: ${anandBakeryProducts.length}`);

    // Verify DB count
    const totalAnandInDb = await Product.countDocuments({ companyName: 'Anand Bakery' });
    const totalAllInDb = await Product.countDocuments();
    console.log(`📊 DB Audit: Anand Bakery products in DB = ${totalAnandInDb}, Total products across all brands = ${totalAllInDb}`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly.');
  } catch (error) {
    console.error('❌ Error seeding Anand Bakery products:', error);
    process.exit(1);
  }
};

seedAnandBakery();
