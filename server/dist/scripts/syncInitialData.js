import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/anuj_enterprises';
const syncInitialData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        if (!mongoose.connection.db)
            throw new Error('Database connection failed');
        const products = await mongoose.connection.db.collection('products').find({}).toArray();
        const formatted = products.map((p) => ({
            id: p.productId || p._id.toString(),
            _id: p._id.toString(),
            productId: p.productId,
            name: p.name,
            brand: p.companyName,
            company: p.companyName,
            category: p.categoryName,
            sku: p.sku,
            hsn: p.hsn || '19053100',
            price: p.price,
            mrp: p.mrp || Math.round(p.price * 1.2),
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold || 20,
            unitType: p.unitType || 'Piece',
            unitQuantity: p.unitQuantity || '',
            packSize: p.packSize || '',
            bundleSize: p.bundleSize || '',
            malaSize: p.malaSize || '',
            boriSize: p.boriSize || '',
            caseSize: p.caseSize || '',
            cartonSize: p.cartonSize || '',
            customPackaging: p.customPackaging || '',
            isFeatured: Boolean(p.featured),
            isNew: Boolean(p.newProduct),
            isNrp: Boolean(p.isNrp),
            status: p.status || 'Published',
            image: p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
            images: p.images ? p.images.map((i) => i.url) : [],
            gallery: p.images ? p.images.map((i) => i.url) : [],
            description: p.description || ''
        }));
        const companies = [
            { id: 'b-anand', name: 'Anand Bakery', logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80', count: 30, country: 'India', isNew: true },
            { id: 'b-alltime', name: 'All Time', logo: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=300&q=80', count: 41, country: 'India', isNew: true },
            { id: 'b-vtc', name: 'VTC', logo: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=300&q=80', count: 11, country: 'India', isNew: true },
            { id: 'b-cookyumm', name: 'Cook Yumm', logo: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80', count: 5, country: 'India', isNew: true },
            { id: 'b-kays', name: "Kay's India", logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80', count: 15, country: 'India', isNew: true },
            { id: 'b-tooyumm', name: 'Too Yumm', logo: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80', count: 6, country: 'India', isNew: true },
            { id: 'b-others', name: 'Others Brand', logo: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80', count: 7, country: 'India', isNew: true },
            { id: 'b1', name: 'Amul', logo: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80', count: 1, country: 'India', isNew: false },
            { id: 'b2', name: 'Nestlé', logo: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=300&q=80', count: 1, country: 'Switzerland', isNew: false },
            { id: 'b3', name: 'Hindustan Unilever', logo: 'https://images.unsplash.com/photo-1607006483768-918b9ee3409d?auto=format&fit=crop&w=300&q=80', count: 0, country: 'India', isNew: false },
            { id: 'b4', name: 'Procter & Gamble', logo: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80', count: 0, country: 'USA', isNew: false },
            { id: 'b5', name: 'Britannia', logo: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80', count: 1, country: 'India', isNew: false },
            { id: 'b6', name: 'PepsiCo', logo: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=300&q=80', count: 0, country: 'USA', isNew: false },
            { id: 'b7', name: 'Coca-Cola', logo: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80', count: 0, country: 'USA', isNew: false },
            { id: 'b8', name: 'Colgate-Palmolive', logo: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=300&q=80', count: 0, country: 'USA', isNew: false }
        ];
        const targetPath = path.resolve(__dirname, '../../../src/data/initialData.js');
        let currentFile = fs.readFileSync(targetPath, 'utf8');
        // Replace INITIAL_PRODUCTS
        currentFile = currentFile.replace(/export const INITIAL_PRODUCTS = \[[\s\S]*?\];/, 'export const INITIAL_PRODUCTS = ' + JSON.stringify(formatted, null, 2) + ';');
        // Replace INITIAL_BRANDS
        currentFile = currentFile.replace(/export const INITIAL_BRANDS = \[[\s\S]*?\];/, 'export const INITIAL_BRANDS = ' + JSON.stringify(companies, null, 2) + ';');
        fs.writeFileSync(targetPath, currentFile, 'utf8');
        console.log(`✅ Updated initialData.js with ${formatted.length} products and ${companies.length} brands!`);
        await mongoose.disconnect();
    }
    catch (err) {
        console.error('Error syncing initial data:', err);
        process.exit(1);
    }
};
syncInitialData();
