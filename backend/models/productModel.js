import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Product', productSchema);
