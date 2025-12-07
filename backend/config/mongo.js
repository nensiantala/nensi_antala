import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectMongo = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/ecommerce';
    console.log('🔌 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
    console.log('📍 Database:', mongoose.connection.db.databaseName);
    console.log('📍 Host:', mongoose.connection.host);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectMongo;
