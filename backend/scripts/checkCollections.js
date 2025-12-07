import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/adminModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/';

  await mongoose.connect(uri);
  console.log('Connected to', uri);

  const adminCount = await Admin.countDocuments();
  const orderCount = await Order.countDocuments();
  const productCount = await Product.countDocuments();
  const userCount = await User.countDocuments();

  console.log(`admins: ${adminCount}, orders: ${orderCount}, products: ${productCount}, users: ${userCount}`);

  const sampleAdmins = await Admin.find().limit(5).lean();
  const sampleOrders = await Order.find().limit(5).lean();

  console.log('Sample admins:', JSON.stringify(sampleAdmins, null, 2));
  console.log('Sample orders:', JSON.stringify(sampleOrders, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
