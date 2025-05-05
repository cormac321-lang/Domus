import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import winston from 'winston';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import Redis from 'ioredis';
import {
  performanceMonitor,
  errorMonitor,
  monitorDatabase,
  monitorMemory,
  monitoringLogger
} from './middleware/monitoring.js';

// Import routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import maintenanceRoutes from './routes/maintenance.js';
import chatRoutes from './routes/chat.js';
import budgetRoutes from './routes/budget.js';
import inventoryRoutes from './routes/inventory.js';

// Import models
import User from './models/User.js';
import Chat from './models/Chat.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Configure Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(limiter);
app.use(performanceMonitor);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API versioning
const apiVersion = 'v1';
const baseUrl = `/api/${apiVersion}`;

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes with versioning
app.use(`${baseUrl}/auth`, authRoutes);
app.use(`${baseUrl}/properties`, propertyRoutes);
app.use(`${baseUrl}/maintenance`, maintenanceRoutes);
app.use(`${baseUrl}/chat`, chatRoutes);
app.use(`${baseUrl}/budget`, budgetRoutes);
app.use(`${baseUrl}/inventory`, inventoryRoutes);

// Cache middleware
const cache = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedResponse = await redis.get(key);

    if (cachedResponse) {
      return res.json(JSON.parse(cachedResponse));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    next();
  };
};

// Apply cache middleware to GET routes
app.use(`${baseUrl}/properties`, cache(300)); // Cache for 5 minutes
app.use(`${baseUrl}/maintenance`, cache(300));

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.user._id}`);

  // Join user's personal room
  socket.join(socket.user._id.toString());

  // Join user's active chats
  socket.on('join-chats', async () => {
    try {
      const chats = await Chat.find({
        'participants.user': socket.user._id,
        isActive: true
      });

      for (const chat of chats) {
        socket.join(chat._id.toString());
      }
    } catch (error) {
      logger.error('Error joining chats:', error);
    }
  });

  // Join specific chat
  socket.on('join-chat', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      // Check if user is a participant
      const isParticipant = chat.participants.some(
        p => p.user.toString() === socket.user._id.toString()
      );

      if (!isParticipant) {
        return socket.emit('error', { message: 'Access denied' });
      }

      socket.join(chatId);
      logger.info(`User ${socket.user._id} joined chat ${chatId}`);
    } catch (error) {
      logger.error('Error joining chat:', error);
      socket.emit('error', { message: 'Error joining chat' });
    }
  });

  // Leave chat
  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    logger.info(`User ${socket.user._id} left chat ${chatId}`);
  });

  // Handle new message
  socket.on('send-message', async (data) => {
    try {
      const { chatId, content, attachments } = data;
      const chat = await Chat.findById(chatId);

      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      // Check if user is a participant
      const isParticipant = chat.participants.some(
        p => p.user.toString() === socket.user._id.toString()
      );

      if (!isParticipant) {
        return socket.emit('error', { message: 'Access denied' });
      }

      // Add message to chat
      await chat.addMessage(socket.user._id, content, attachments);
      await chat.populate('messages.sender', 'firstName lastName email profileImage');

      // Get the last message
      const lastMessage = chat.messages[chat.messages.length - 1];

      // Emit message to all participants
      io.to(chatId).emit('new-message', {
        chatId,
        message: lastMessage
      });

      // Emit notification to offline participants
      for (const participant of chat.participants) {
        if (participant.user.toString() !== socket.user._id.toString()) {
          io.to(participant.user.toString()).emit('chat-notification', {
            chatId,
            message: lastMessage
          });
        }
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, isTyping } = data;
    socket.to(chatId).emit('user-typing', {
      chatId,
      userId: socket.user._id,
      isTyping
    });
  });

  // Handle read receipts
  socket.on('mark-read', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }

      await chat.markAsRead(socket.user._id);
      socket.to(chatId).emit('messages-read', {
        chatId,
        userId: socket.user._id
      });
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Error marking messages as read' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.user._id}`);
  });
});

// Error handling middleware
app.use(errorMonitor);
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Initialize monitoring
    monitorDatabase(mongoose);
    monitorMemory();
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
}); 