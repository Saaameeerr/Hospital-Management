import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!req.user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based access control middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }

    next();
  };
};

// Specific role middlewares
export const requireAdmin = authorize('admin');
export const requireDoctor = authorize('admin', 'doctor');
export const requireReceptionist = authorize('admin', 'receptionist');
export const requireStaff = authorize('admin', 'doctor', 'receptionist');
export const requirePatient = authorize('admin', 'doctor', 'receptionist', 'patient');

export const protectPatientOrStaff = async (req, res, next) => {
  try {
    // Staff can access any patient
    if (['admin', 'doctor', 'receptionist'].includes(req.user.role)) return next();
    // Patient can only access their own profile
    if (req.user.role === 'patient' && req.user._id.toString() === req.params.id) return next();
    return res.status(403).json({ success: false, message: 'Not authorized' });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};
