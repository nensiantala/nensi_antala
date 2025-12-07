import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
// admin auth endpoints live under the same prefix for convenience
app.use("/api/auth", adminAuthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// MongoDB Connect (no deprecated options)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nensiantala90_db_user:Username12@ecommerce.d7gvqzu.mongodb.net/';
console.log('🔌 Connecting to MongoDB...');
console.log('📍 MongoDB URI:', MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("📍 Database:", mongoose.connection.db.databaseName);
    console.log("📍 Host:", mongoose.connection.host);
  })
  .catch(err => {
    console.error("❌ DB Error:", err.message);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    const altPort = PORT + 1;
    console.warn(`Port ${PORT} in use, attempting to start on ${altPort}...`);
    app.listen(altPort, HOST, () => console.log(`Server running on ${HOST}:${altPort}`));
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
