import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['landlord', 'tenant', 'admin'],
      required: true
    }
  }],
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  },
  type: {
    type: String,
    enum: ['direct', 'property', 'maintenance'],
    default: 'direct'
  },
  title: {
    type: String,
    trim: true
  },
  messages: [messageSchema],
  lastMessage: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    maintenanceRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Maintenance'
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
chatSchema.index({ participants: 1, lastMessage: -1 });
chatSchema.index({ property: 1, type: 1 });
chatSchema.index({ 'metadata.maintenanceRequest': 1 });

// Method to add a message
chatSchema.methods.addMessage = async function(senderId, content, attachments = []) {
  const message = {
    sender: senderId,
    content,
    attachments,
    readBy: [{ user: senderId }]
  };

  this.messages.push(message);
  this.lastMessage = new Date();
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = async function(userId) {
  const unreadMessages = this.messages.filter(
    message => !message.readBy.some(read => read.user.toString() === userId.toString())
  );

  for (const message of unreadMessages) {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }

  return this.save();
};

// Method to get unread message count
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(
    message => !message.readBy.some(read => read.user.toString() === userId.toString())
  ).length;
};

// Static method to find or create direct chat
chatSchema.statics.findOrCreateDirectChat = async function(user1Id, user2Id) {
  const existingChat = await this.findOne({
    type: 'direct',
    participants: {
      $all: [
        { $elemMatch: { user: user1Id } },
        { $elemMatch: { user: user2Id } }
      ]
    }
  });

  if (existingChat) {
    return existingChat;
  }

  // Get user roles
  const [user1, user2] = await Promise.all([
    User.findById(user1Id),
    User.findById(user2Id)
  ]);

  if (!user1 || !user2) {
    throw new Error('Users not found');
  }

  const newChat = new this({
    type: 'direct',
    participants: [
      { user: user1Id, role: user1.role },
      { user: user2Id, role: user2.role }
    ],
    title: `Chat between ${user1.firstName} and ${user2.firstName}`
  });

  return newChat.save();
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat; 