import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '..', 'data', 'products.json');
let data;
try {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  data = JSON.parse(raw);
} catch (err) {
  // fallback: assume current working dir is project root
  const altPath = path.resolve(process.cwd(), 'backend', 'data', 'products.json');
  const raw = fs.readFileSync(altPath, 'utf-8');
  data = JSON.parse(raw);
}

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    const products = data.products || [];

    // Clear existing products (optional)
    await Product.deleteMany({});

    const docs = products.map(p => {
      const doc = {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        images: p.images || [],
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined
      };

      // If provided _id is a valid 24-hex string, set it so we preserve IDs
      if (p._id && /^[a-fA-F0-9]{24}$/.test(p._id)) {
        doc._id = new mongoose.Types.ObjectId(p._id);
      }

      return doc;
    });

    await Product.insertMany(docs);

    console.log('Seeded products:', docs.length);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

run();
