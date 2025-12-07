import User from '../models/userModel.js';

export const getUsers = async (req, res) => {
  try {
    if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin required' });
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log('Update user request:', req.params.id, 'with data:', req.body);
    console.log('User making request:', req.user);
    
    if (!req.user?.isAdmin) {
      console.log('Admin access denied for update user');
      return res.status(403).json({ message: 'Admin required' });
    }
    
    const updates = req.body;
    if (updates.password) delete updates.password; // password change handled elsewhere
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User updated successfully:', user._id);
    res.json({ user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    console.log('Delete user request:', req.params.id);
    console.log('User making request:', req.user);
    
    if (!req.user?.isAdmin) {
      console.log('Admin access denied for delete user');
      return res.status(403).json({ message: 'Admin required' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User deleted successfully:', req.params.id);
    res.json({ message: 'User deleted', deletedUser: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: err.message });
  }
};
