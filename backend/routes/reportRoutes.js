import express from 'express';
import {
  getDailyRevenue,
  getTopCustomers,
  getCategoryWiseSales,
  getAllReports
} from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All report routes require admin authentication
router.get('/daily-revenue', protect, admin, getDailyRevenue);
router.get('/top-customers', protect, admin, getTopCustomers);
router.get('/category-sales', protect, admin, getCategoryWiseSales);
router.get('/all', protect, admin, getAllReports);

export default router;

