const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please provide volunteer name'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide volunteer contact phone'],
      trim: true
    },
    skills: {
      type: [String],
      enum: {
        values: ['Medical', 'Fire Response', 'Food Distribution', 'Transport', 'Search and Rescue', 'Communication', 'Security', 'General Support'],
        message: 'Invalid skill tag: {VALUE}'
      },
      default: []
    },
    location: {
      type: String,
      required: [true, 'Please provide volunteer current location/sector'],
      trim: true
    },
    availability: {
      type: String,
      enum: {
        values: ['Available', 'Busy', 'Offline'],
        message: 'Invalid availability: {VALUE}'
      },
      default: 'Offline'
    },
    activeAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
      default: null
    },
    completedAssignments: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Emergency' }],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
