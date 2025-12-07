import Admin from '../models/adminModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    console.log('Admin login attempt for email:', email);

    // Find admin by email (case-insensitive)
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    
    if (!admin) {
      console.log('Admin not found for email:', email);
      // Check if any admins exist
      const adminCount = await Admin.countDocuments();
      console.log('Total admins in database:', adminCount);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log('Admin found:', admin.email);

    // Compare password
    const match = await bcrypt.compare(password, admin.password);
    
    if (!match) {
      console.log('Password mismatch for admin:', admin.email);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    console.log('Password match successful for admin:', admin.email);

    // Generate token
    const token = jwt.sign(
      { adminId: admin._id.toString(), isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Token generated successfully for admin:', admin.email);

    return res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: err.message || 'Internal server error' });
  }
};
