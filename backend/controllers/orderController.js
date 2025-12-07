import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.error('Order creation failed: No userId in request');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { items } = req.body;
    if (!items || !items.length) {
      console.error('Order creation failed: No items provided');
      return res.status(400).json({ message: 'No items provided' });
    }

    console.log('Creating order for user:', userId, 'with items:', items);

    // Map frontend format to backend format
    // Frontend sends: { productId, name, price, quantity }
    // Backend expects: { product (ObjectId), name, priceAtPurchase, quantity }
    const mappedItems = items.map(item => {
      const productId = item.productId || item.product;
      const price = item.price || item.priceAtPurchase;
      
      if (!productId) {
        throw new Error(`Missing productId for item: ${JSON.stringify(item)}`);
      }
      
      if (!price || price <= 0) {
        throw new Error(`Invalid price for item: ${JSON.stringify(item)}`);
      }

      // Convert productId to ObjectId if it's a valid string
      let productObjectId = productId;
      if (typeof productId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          throw new Error(`Invalid productId format: ${productId}`);
        }
        productObjectId = new mongoose.Types.ObjectId(productId);
      }

      return {
        product: productObjectId,
        name: item.name || 'Unknown Product',
        quantity: item.quantity || 1,
        priceAtPurchase: Number(price)
      };
    });

    // Calculate total from mapped items
    const total = mappedItems.reduce((sum, it) => sum + (it.priceAtPurchase || 0) * (it.quantity || 1), 0);

    if (total <= 0) {
      throw new Error('Order total must be greater than 0');
    }

    // Convert userId to ObjectId if needed
    let userObjectId = userId;
    if (typeof userId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid userId format:', userId);
        return res.status(400).json({ message: 'Invalid user ID format' });
      }
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    console.log('Creating order with:', { user: userObjectId, items: mappedItems, total });

    // Create order with mapped items
    const order = await Order.create({ 
      user: userObjectId, 
      items: mappedItems, 
      total 
    });

    console.log('Order created successfully:', order._id);

    // Decrement product stock (best-effort)
    for (const it of mappedItems) {
      try {
        if (it.product) {
          await Product.findByIdAndUpdate(it.product, { $inc: { stock: -(it.quantity || 1) } });
        }
      } catch (e) {
        // ignore individual failures
        console.error('Error updating stock for product:', it.product, e.message);
      }
    }

    res.status(201).json({ order });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: err.message || 'Failed to create order', error: err.toString() });
  }
};

// Get orders (admin sees all)
export const getOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Convert userId to ObjectId if needed for query
    let userObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    if (req.user?.isAdmin) {
      const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
      console.log(`Admin fetched ${orders.length} orders`);
      return res.json({ orders });
    }
    
    const orders = await Order.find({ user: userObjectId }).sort({ createdAt: -1 });
    console.log(`User ${userId} fetched ${orders.length} orders`);
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.user?.isAdmin && order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin required' });
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


