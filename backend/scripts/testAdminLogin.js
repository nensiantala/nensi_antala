import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/adminModel.js';

dotenv.config();

const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';

async function testLogin() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/';

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Checking for admin with email:', email);
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      console.log('❌ Admin not found!');
      console.log('\n💡 To create an admin, run:');
      console.log(`   node scripts/createAdmin.js ${email} ${password}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ Admin found:');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name || 'N/A'}\n`);

    console.log('🔐 Testing password...');
    const match = await bcrypt.compare(password, admin.password);
    
    if (match) {
      console.log('✅ Password is correct!');
      console.log('\n✅ Admin login should work with these credentials.');
    } else {
      console.log('❌ Password is incorrect!');
      console.log('\n💡 To reset the password, run:');
      console.log(`   node scripts/createAdmin.js ${email} <new_password>`);
    }

    await mongoose.disconnect();
    process.exit(match ? 0 : 1);
  } catch (err) {
    console.error('❌ Error:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

testLogin();

