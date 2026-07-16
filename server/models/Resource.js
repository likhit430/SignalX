const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a resource name'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Please provide a resource category'],
      enum: {
        values: ['Food', 'Water', 'Medical', 'Shelter', 'Transport', 'Communication', 'Equipment', 'Other'],
        message: 'Invalid category: {VALUE}'
      }
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Please provide total quantity'],
      min: [0, 'Total quantity cannot be negative'],
      default: 0
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please provide available quantity'],
      min: [0, 'Available quantity cannot be negative'],
      default: 0,
      validate: {
        validator: function(val) {
          // Check that availableQuantity <= totalQuantity
          return val <= this.totalQuantity;
        },
        message: 'Available quantity cannot exceed total quantity'
      }
    },
    location: {
      type: String,
      required: [true, 'Please provide location coordinates/details'],
      trim: true
    },
    contactName: {
      type: String,
      required: [true, 'Please provide a contact person name'],
      trim: true
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Please provide resource availability status'],
      enum: {
        values: ['Available', 'Limited', 'Unavailable'],
        message: 'Invalid status: {VALUE}'
      },
      default: 'Available'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Helper function to calculate status
const calculateStatus = (availableQty, totalQty) => {
  if (availableQty === 0) {
    return 'Unavailable';
  }
  if (availableQty > 0 && availableQty <= totalQty * 0.25) {
    return 'Limited';
  }
  return 'Available';
};

// Pre-save hook to calculate status and run final sanity check
resourceSchema.pre('save', function(next) {
  if (this.availableQuantity > this.totalQuantity) {
    return next(new Error('Available quantity cannot exceed total quantity'));
  }
  this.status = calculateStatus(this.availableQuantity, this.totalQuantity);
  next();
});

module.exports = mongoose.model('Resource', resourceSchema);
