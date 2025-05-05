import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'townhouse', 'studio'],
    required: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' }
  },
  features: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  images: [{
    url: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'unavailable'],
    default: 'available'
  },
  landlord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['active', 'pending', 'ended'],
      default: 'pending'
    }
  }],
  maintenance: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance'
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  specifications: {
    bedrooms: Number,
    bathrooms: Number,
    squareFeet: Number,
    yearBuilt: Number,
    parking: {
      type: String,
      enum: ['none', 'street', 'garage', 'both']
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  rules: [{
    type: String
  }],
  availability: {
    startDate: Date,
    endDate: Date
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
propertySchema.index({ location: '2dsphere' });

// Method to calculate average rating
propertySchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
  this.averageRating = sum / this.ratings.length;
  return this.averageRating;
};

const Property = mongoose.model('Property', propertySchema);

export default Property; 