import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from '../models/adminModel.js';

dotenv.config();

const email = process.argv[2] || process.env.ADMIN_EMAIL;
const password = process.argv[3] || process.env.ADMIN_PASSWORD;
const name = process.argv[4] || process.env.ADMIN_NAME || 'Administrator';

if (!email || !password) {
  console.error('❌ Missing required parameters');
  console.error('\nUsage: node createAdmin.js <email> <password> [name]');
  console.error('   OR set in .env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME');
  console.error('\nExample:');
  console.error('   node createAdmin.js admin@example.com admin123 "Admin User"');
  process.exit(1);
}

async function run() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/';

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔐 Creating admin user...');
    const normalizedEmail = email.toLowerCase().trim();
    console.log(`   Email: ${normalizedEmail}`);
    console.log(`   Name: ${name}\n`);

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.findOneAndUpdate(
      { email: normalizedEmail },
      { email: normalizedEmail, password: hashed, name },
      { upsert: true, new: true }
    );

    console.log('✅ Admin created/updated successfully!');
    console.log(`   ID: ${admin._id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Created: ${admin.createdAt}\n`);

    // Verify it was saved
    const verify = await Admin.findById(admin._id);
    if (verify) {
      console.log('✅ Verified: Admin exists in database');
    } else {
      console.error('❌ Warning: Could not verify admin creation');
    }

    await mongoose.disconnect();
    console.log('\n✅ Done! You can now login with this admin account.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error creating admin:');
    console.error(err.message);
    if (err.code === 11000) {
      console.error('\n⚠️  This email already exists. The admin was updated instead.');
    }
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

run();
