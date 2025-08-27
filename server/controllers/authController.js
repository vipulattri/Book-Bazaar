import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    });

    // Generate token
    const token = generateToken(newUser);

    // ✅ Send token in response (NOT in cookie)
    res.status(201).json({
      message: 'User registered successfully',
      token, // 👈 token here
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    // ✅ Send token in response (NOT in cookie)
    res.status(200).json({
      message: 'Login successful',
      token, // 👈 token here
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const logout = (req, res) => {
  // ✅ Clear token on frontend by removing from localStorage
  res.status(200).json({ message: 'Logout successful' });
};

export const checkAuth = async (req, res) => {
  try {
    // You should have a middleware that sets req.user from token
    if (req.user) {
      const user = await User.findById(req.user.id).select('-password');
      return res.status(200).json({
        isAuthenticated: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    }
    res.status(401).json({ isAuthenticated: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
