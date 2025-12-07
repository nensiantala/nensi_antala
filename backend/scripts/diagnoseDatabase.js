import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/adminModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

dotenv.config();

async function diagnose() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/';

    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Check collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name).join(', ') || 'None\n');

    // Count documents
    const adminCount = await Admin.countDocuments();
    const orderCount = await Order.countDocuments();
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    console.log('📊 Document Counts:');
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Users: ${userCount}\n`);

    // Show sample data
    if (adminCount > 0) {
      console.log('👤 Sample Admins:');
      const admins = await Admin.find().limit(3).select('email name createdAt').lean();
      admins.forEach((admin, i) => {
        console.log(`   ${i + 1}. ${admin.email} (${admin.name || 'No name'}) - Created: ${admin.createdAt}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No admins found. Run: node scripts/createAdmin.js <email> <password> [name]\n');
    }

    if (orderCount > 0) {
      console.log('📦 Sample Orders:');
      const orders = await Order.find().limit(3)
        .populate('user', 'email name')
        .select('user total status createdAt items')
        .lean();
      orders.forEach((order, i) => {
        console.log(`   ${i + 1}. Order ID: ${order._id}`);
        console.log(`      User: ${order.user?.email || order.user || 'Unknown'}`);
        console.log(`      Total: ₹${order.total}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Items: ${order.items?.length || 0}`);
        console.log(`      Created: ${order.createdAt}`);
      });
      console.log('');
    } else {
      console.log('⚠️  No orders found. Orders are created when users place orders.\n');
    }

    if (productCount > 0) {
      console.log('🛍️  Sample Products:');
      const products = await Product.find().limit(3).select('name price stock category').lean();
      products.forEach((product, i) => {
        console.log(`   ${i + 1}. ${product.name} - ₹${product.price} (Stock: ${product.stock || 0})`);
      });
      console.log('');
    } else {
      console.log('⚠️  No products found. Run: node scripts/seedProducts.js\n');
    }

    if (userCount > 0) {
      console.log('👥 Sample Users:');
      const users = await User.find().limit(3).select('email name isAdmin createdAt').lean();
      users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.email} (${user.name}) - Admin: ${user.isAdmin || false}`);
      });
      console.log('');
    }

    // Check for common issues
    console.log('🔍 Diagnostics:');
    
    if (!mongoose.connection.readyState) {
      console.log('   ❌ MongoDB connection is not ready');
    } else {
      console.log('   ✅ MongoDB connection is active');
    }

    if (adminCount === 0) {
      console.log('   ⚠️  No admins in database - you need to create one');
    } else {
      console.log('   ✅ Admins exist in database');
    }

    if (orderCount === 0) {
      console.log('   ℹ️  No orders yet - this is normal if no orders have been placed');
    } else {
      console.log('   ✅ Orders exist in database');
    }

    await mongoose.disconnect();
    console.log('\n✅ Diagnosis complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

diagnose();

