const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an emergency title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide an emergency description'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please provide an emergency category'],
      enum: {
        values: ['Medical', 'Fire', 'Food', 'Water', 'Shelter', 'Missing Person', 'Security', 'Other'],
        message: 'Invalid category: {VALUE}'
      }
    },
    priority: {
      type: String,
      required: [true, 'Please provide an emergency priority'],
      enum: {
        values: ['Low', 'Medium', 'High', 'Critical'],
        message: 'Invalid priority: {VALUE}'
      },
      default: 'Medium'
    },
    location: {
      type: String,
      required: [true, 'Please provide an emergency location'],
      trim: true
    },
    reporter: {
      type: String,
      required: [true, 'Please provide a reporter name/details'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: 'Invalid status: {VALUE}'
      },
      default: 'Open'
    },
    aiSummary: {
      type: String,
      default: ''
    },
    suggestedAction: {
      type: String,
      default: ''
    },
    requiredResources: {
      type: [String],
      default: []
    },
    broadcastRadius: {
      type: Number,
      default: 5
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedVolunteers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }],
      default: []
    },
    allocatedResources: {
      type: [{
        resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
        quantity: { type: Number, required: true, min: [1, 'Allocated quantity must be greater than 0'] }
      }],
      default: []
    },
    assignmentHistory: {
      type: [{
        volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
        assignedAt: { type: Date, default: Date.now },
        completedAt: { type: Date },
        status: { type: String, enum: ['Assigned', 'Completed', 'Removed'], default: 'Assigned' }
      }],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Emergency', emergencySchema);
