import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: [
      'plumbing',
      'electrical',
      'heating',
      'cooling',
      'structural',
      'appliance',
      'pest-control',
      'other'
    ],
    required: true
  },
  images: [{
    url: String,
    caption: String
  }],
  scheduledDate: Date,
  completedDate: Date,
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid'],
      default: 'pending'
    }
  },
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
maintenanceSchema.index({ property: 1, status: 1 });
maintenanceSchema.index({ requestedBy: 1, status: 1 });
maintenanceSchema.index({ assignedTo: 1, status: 1 });

// Method to add a note
maintenanceSchema.methods.addNote = async function(content, authorId) {
  this.notes.push({
    content,
    author: authorId
  });
  return this.save();
};

// Method to update status
maintenanceSchema.methods.updateStatus = async function(status, userId) {
  this.status = status;
  if (status === 'completed') {
    this.completedDate = new Date();
  }
  await this.addNote(`Status updated to ${status}`, userId);
  return this.save();
};

// Method to assign maintenance
maintenanceSchema.methods.assign = async function(assignedToId, userId) {
  this.assignedTo = assignedToId;
  await this.addNote(`Maintenance assigned to ${assignedToId}`, userId);
  return this.save();
};

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance; 