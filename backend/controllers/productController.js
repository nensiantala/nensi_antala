import Product from '../models/productModel.js';

export const createProduct = async (req, res) => {
    try {
        console.log('Creating product with data:', req.body);
        console.log('User making request:', req.user);
        const product = new Product(req.body);
        await product.save();
        console.log('Product created successfully:', product._id);
        res.status(201).json({ message: 'Product created', product });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(400).json({ error: err.message });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', category } = req.query;

        const filter = category ? { category } : {};

        const products = await Product.find(filter)
            .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(filter);

        res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        console.log('Updating product:', req.params.id, 'with data:', req.body);
        console.log('User making request:', req.user);
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) {
            console.log('Product not found:', req.params.id);
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log('Product updated successfully:', product._id);
        res.json({ message: 'Product updated', product });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(400).json({ error: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        console.log('Deleting product:', req.params.id);
        console.log('User making request:', req.user);
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            console.log('Product not found:', req.params.id);
            return res.status(404).json({ error: 'Product not found' });
        }
        console.log('Product deleted successfully:', req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: err.message });
    }
};
