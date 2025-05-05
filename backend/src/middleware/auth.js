import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Property from '../models/Property.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied. You do not have permission to perform this action.'
      });
    }
    next();
  };
};

export const verifyPropertyAccess = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Check if user is landlord of the property
    if (property.landlord.toString() === req.user._id.toString()) {
      req.property = property;
      return next();
    }

    // Check if user is a tenant of the property
    const isTenant = property.tenants.some(
      tenant => tenant.user.toString() === req.user._id.toString() && 
                tenant.status === 'active'
    );

    if (isTenant) {
      req.property = property;
      return next();
    }

    res.status(403).json({ error: 'Access denied to this property' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}; 