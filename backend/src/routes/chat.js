import express from 'express';
import { body } from 'express-validator';
import { auth, checkRole } from '../middleware/auth.js';
import Chat from '../models/Chat.js';
import Property from '../models/Property.js';
import User from '../models/User.js';

const router = express.Router();

// Get all chats for current user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.user._id,
      isActive: true
    })
      .populate('participants.user', 'firstName lastName email profileImage')
      .populate('property', 'title address')
      .sort({ lastMessage: -1 });

    // Add unread count for each chat
    const chatsWithUnread = chats.map(chat => {
      const chatObj = chat.toObject();
      chatObj.unreadCount = chat.getUnreadCount(req.user._id);
      return chatObj;
    });

    res.json(chatsWithUnread);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chat by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants.user', 'firstName lastName email profileImage')
      .populate('property', 'title address')
      .populate('messages.sender', 'firstName lastName email profileImage')
      .populate('metadata.maintenanceRequest');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark messages as read
    await chat.markAsRead(req.user._id);

    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new direct chat
router.post('/direct',
  auth,
  [body('userId').notEmpty()],
  async (req, res) => {
    try {
      const chat = await Chat.findOrCreateDirectChat(req.user._id, req.body.userId);
      await chat.populate('participants.user', 'firstName lastName email profileImage');
      res.status(201).json(chat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Create property chat
router.post('/property',
  auth,
  [
    body('propertyId').notEmpty(),
    body('title').optional().trim()
  ],
  async (req, res) => {
    try {
      const property = await Property.findById(req.body.propertyId);
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

      // Get all participants (landlord and active tenants)
      const participants = [
        { user: property.landlord, role: 'landlord' }
      ];

      for (const tenant of property.tenants) {
        if (tenant.status === 'active') {
          participants.push({ user: tenant.user, role: 'tenant' });
        }
      }

      const chat = new Chat({
        type: 'property',
        property: property._id,
        participants,
        title: req.body.title || `Chat for ${property.title}`
      });

      await chat.save();
      await chat.populate('participants.user', 'firstName lastName email profileImage');
      await chat.populate('property', 'title address');

      res.status(201).json(chat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Create maintenance chat
router.post('/maintenance',
  auth,
  [
    body('maintenanceId').notEmpty(),
    body('title').optional().trim()
  ],
  async (req, res) => {
    try {
      const maintenance = await Maintenance.findById(req.body.maintenanceId)
        .populate('property')
        .populate('requestedBy')
        .populate('assignedTo');

      if (!maintenance) {
        return res.status(404).json({ error: 'Maintenance request not found' });
      }

      // Check if user has access to the maintenance request
      const hasAccess = 
        req.user.role === 'admin' ||
        maintenance.property.landlord.toString() === req.user._id.toString() ||
        maintenance.requestedBy._id.toString() === req.user._id.toString() ||
        (maintenance.assignedTo && maintenance.assignedTo._id.toString() === req.user._id.toString());

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const participants = [
        { user: maintenance.property.landlord, role: 'landlord' },
        { user: maintenance.requestedBy._id, role: 'tenant' }
      ];

      if (maintenance.assignedTo) {
        participants.push({ user: maintenance.assignedTo._id, role: 'admin' });
      }

      const chat = new Chat({
        type: 'maintenance',
        property: maintenance.property._id,
        participants,
        title: req.body.title || `Chat for maintenance: ${maintenance.title}`,
        metadata: {
          maintenanceRequest: maintenance._id
        }
      });

      await chat.save();
      await chat.populate('participants.user', 'firstName lastName email profileImage');
      await chat.populate('property', 'title address');
      await chat.populate('metadata.maintenanceRequest');

      res.status(201).json(chat);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Send message
router.post('/:id/messages',
  auth,
  [
    body('content').trim().notEmpty(),
    body('attachments').optional().isArray()
  ],
  async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Check if user is a participant
      const isParticipant = chat.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await chat.addMessage(req.user._id, req.body.content, req.body.attachments);
      await chat.populate('messages.sender', 'firstName lastName email profileImage');

      // Get the last message
      const lastMessage = chat.messages[chat.messages.length - 1];

      res.status(201).json(lastMessage);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Mark chat as read
router.post('/:id/read',
  auth,
  async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Check if user is a participant
      const isParticipant = chat.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await chat.markAsRead(req.user._id);
      res.json({ message: 'Chat marked as read' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Archive chat
router.post('/:id/archive',
  auth,
  async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Check if user is a participant
      const isParticipant = chat.participants.some(
        p => p.user.toString() === req.user._id.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({ error: 'Access denied' });
      }

      chat.isActive = false;
      await chat.save();

      res.json({ message: 'Chat archived' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router; 