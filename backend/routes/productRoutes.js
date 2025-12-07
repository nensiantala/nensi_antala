// routes/productRoutes.js
import express from 'express';
import * as productController from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer: Get all products
router.get('/', productController.getProducts);

// Customer/Admin: Get single product
router.get('/:id', productController.getProductById);

// Admin only routes
router.post('/', protect, admin, productController.createProduct);
router.put('/:id', protect, admin, productController.updateProduct);
router.delete('/:id', protect, admin, productController.deleteProduct);

export default router;
