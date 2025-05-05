import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole, verifyPropertyAccess } from '../middleware/auth.js';
import Property from '../models/Property.js';

const router = express.Router();

// Get all properties (with filters)
router.get('/', async (req, res) => {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      city,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = Number(minPrice);
      if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
    }
    if (bedrooms) query['specifications.bedrooms'] = Number(bedrooms);
    if (bathrooms) query['specifications.bathrooms'] = Number(bathrooms);

    const properties = await Property.find(query)
      .populate('landlord', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalProperties: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('landlord', 'firstName lastName email')
      .populate('tenants.user', 'firstName lastName email');

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new property
router.post('/',
  auth,
  checkRole(['landlord', 'admin']),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('type').isIn(['apartment', 'house', 'condo', 'townhouse', 'studio']),
    body('address.street').trim().notEmpty(),
    body('address.city').trim().notEmpty(),
    body('address.state').trim().notEmpty(),
    body('address.zipCode').trim().notEmpty(),
    body('address.country').trim().notEmpty(),
    body('price.amount').isNumeric(),
    body('price.currency').optional().isString(),
    body('price.period').optional().isIn(['monthly', 'weekly', 'yearly'])
  ],
  async (req, res) => {
    try {
      const property = new Property({
        ...req.body,
        landlord: req.user._id
      });

      await property.save();
      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Update property
router.patch('/:id',
  auth,
  verifyPropertyAccess,
  async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'title',
      'description',
      'type',
      'address',
      'price',
      'features',
      'amenities',
      'images',
      'status',
      'specifications',
      'rules',
      'availability'
    ];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
      updates.forEach(update => req.property[update] = req.body[update]);
      await req.property.save();
      res.json(req.property);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete property
router.delete('/:id',
  auth,
  verifyPropertyAccess,
  async (req, res) => {
    try {
      await req.property.remove();
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Add tenant to property
router.post('/:id/tenants',
  auth,
  verifyPropertyAccess,
  [
    body('userId').notEmpty(),
    body('startDate').isISO8601(),
    body('endDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const { userId, startDate, endDate } = req.body;

      const tenant = {
        user: userId,
        startDate,
        endDate,
        status: 'active'
      };

      req.property.tenants.push(tenant);
      await req.property.save();

      res.status(201).json(req.property);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Remove tenant from property
router.delete('/:id/tenants/:tenantId',
  auth,
  verifyPropertyAccess,
  async (req, res) => {
    try {
      const tenant = req.property.tenants.id(req.params.tenantId);
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      tenant.status = 'ended';
      await req.property.save();

      res.json(req.property);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Add property rating
router.post('/:id/ratings',
  auth,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim()
  ],
  async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if user has already rated
      const existingRating = property.ratings.find(
        rating => rating.user.toString() === req.user._id.toString()
      );

      if (existingRating) {
        return res.status(400).json({ error: 'You have already rated this property' });
      }

      property.ratings.push({
        user: req.user._id,
        rating: req.body.rating,
        comment: req.body.comment
      });

      property.calculateAverageRating();
      await property.save();

      res.status(201).json(property);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router; 