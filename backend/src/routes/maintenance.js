import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole, verifyPropertyAccess } from '../middleware/auth.js';
import Maintenance from '../models/Maintenance.js';
import Property from '../models/Property.js';
import { sendMaintenanceNotification } from '../utils/email.js';

const router = express.Router();

// Get all maintenance requests (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const {
      property,
      status,
      priority,
      category,
      assignedTo,
      requestedBy,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (property) query.property = property;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (requestedBy) query.requestedBy = requestedBy;

    // If user is tenant, only show their requests
    if (req.user.role === 'tenant') {
      query.requestedBy = req.user._id;
    }

    // If user is landlord, only show requests for their properties
    if (req.user.role === 'landlord') {
      const properties = await Property.find({ landlord: req.user._id });
      query.property = { $in: properties.map(p => p._id) };
    }

    const maintenance = await Maintenance.find(query)
      .populate('property', 'title address')
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Maintenance.countDocuments(query);

    res.json({
      maintenance,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRequests: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get maintenance request by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('property', 'title address landlord')
      .populate('requestedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('notes.author', 'firstName lastName');

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Check access
    const property = await Property.findById(maintenance.property._id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const hasAccess = 
      req.user.role === 'admin' ||
      property.landlord.toString() === req.user._id.toString() ||
      maintenance.requestedBy._id.toString() === req.user._id.toString() ||
      (maintenance.assignedTo && maintenance.assignedTo._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create maintenance request
router.post('/',
  auth,
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('property').notEmpty(),
    body('category').isIn([
      'plumbing',
      'electrical',
      'heating',
      'cooling',
      'structural',
      'appliance',
      'pest-control',
      'other'
    ]),
    body('priority').optional().isIn(['low', 'medium', 'high', 'emergency']),
    body('scheduledDate').optional().isISO8601()
  ],
  async (req, res) => {
    try {
      const property = await Property.findById(req.body.property);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if user has access to the property
      const hasAccess = 
        req.user.role === 'admin' ||
        property.landlord.toString() === req.user._id.toString() ||
        property.tenants.some(t => 
          t.user.toString() === req.user._id.toString() && 
          t.status === 'active'
        );

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this property' });
      }

      const maintenance = new Maintenance({
        ...req.body,
        requestedBy: req.user._id
      });

      await maintenance.save();

      // Send notification to landlord
      if (property.landlord.toString() !== req.user._id.toString()) {
        const landlord = await User.findById(property.landlord);
        if (landlord) {
          await sendMaintenanceNotification(landlord.email, maintenance);
        }
      }

      res.status(201).json(maintenance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Update maintenance request
router.patch('/:id',
  auth,
  async (req, res) => {
    try {
      const maintenance = await Maintenance.findById(req.params.id);
      if (!maintenance) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      const property = await Property.findById(maintenance.property);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if user has permission to update
      const canUpdate = 
        req.user.role === 'admin' ||
        property.landlord.toString() === req.user._id.toString() ||
        maintenance.requestedBy.toString() === req.user._id.toString() ||
        (maintenance.assignedTo && maintenance.assignedTo.toString() === req.user._id.toString());

      if (!canUpdate) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const updates = Object.keys(req.body);
      const allowedUpdates = [
        'title',
        'description',
        'priority',
        'status',
        'category',
        'scheduledDate',
        'cost',
        'images',
        'attachments'
      ];

      const isValidOperation = updates.every(update => allowedUpdates.includes(update));
      if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
      }

      updates.forEach(update => maintenance[update] = req.body[update]);
      await maintenance.save();

      res.json(maintenance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Add note to maintenance request
router.post('/:id/notes',
  auth,
  [body('content').trim().notEmpty()],
  async (req, res) => {
    try {
      const maintenance = await Maintenance.findById(req.params.id);
      if (!maintenance) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      const property = await Property.findById(maintenance.property);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if user has permission to add notes
      const canAddNote = 
        req.user.role === 'admin' ||
        property.landlord.toString() === req.user._id.toString() ||
        maintenance.requestedBy.toString() === req.user._id.toString() ||
        (maintenance.assignedTo && maintenance.assignedTo.toString() === req.user._id.toString());

      if (!canAddNote) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await maintenance.addNote(req.body.content, req.user._id);
      res.json(maintenance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Assign maintenance request
router.post('/:id/assign',
  auth,
  [body('assignedTo').notEmpty()],
  async (req, res) => {
    try {
      const maintenance = await Maintenance.findById(req.params.id);
      if (!maintenance) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      const property = await Property.findById(maintenance.property);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Only landlord or admin can assign
      if (req.user.role !== 'admin' && property.landlord.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await maintenance.assign(req.body.assignedTo, req.user._id);
      res.json(maintenance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Update maintenance status
router.patch('/:id/status',
  auth,
  [body('status').isIn(['pending', 'in-progress', 'completed', 'cancelled'])],
  async (req, res) => {
    try {
      const maintenance = await Maintenance.findById(req.params.id);
      if (!maintenance) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      const property = await Property.findById(maintenance.property);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      // Check if user has permission to update status
      const canUpdateStatus = 
        req.user.role === 'admin' ||
        property.landlord.toString() === req.user._id.toString() ||
        maintenance.requestedBy.toString() === req.user._id.toString() ||
        (maintenance.assignedTo && maintenance.assignedTo.toString() === req.user._id.toString());

      if (!canUpdateStatus) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await maintenance.updateStatus(req.body.status, req.user._id);
      res.json(maintenance);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router; 