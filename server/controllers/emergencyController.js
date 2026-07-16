const Emergency = require('../models/Emergency');
const Volunteer = require('../models/Volunteer');
const Resource = require('../models/Resource');

// @desc    Create a new emergency incident
// @route   POST /api/emergencies
// @access  Private
const createEmergency = async (req, res) => {
  const { title, description, category, priority, location, reporter, aiSummary, suggestedAction, requiredResources, broadcastRadius } = req.body;

  if (!title || !description || !category || !location || !reporter) {
    return res.status(400).json({ success: false, message: 'Please provide all required emergency incident details.' });
  }

  try {
    const emergency = await Emergency.create({
      title,
      description,
      category,
      priority: priority || 'Medium',
      location,
      reporter,
      status: 'Open',
      aiSummary: aiSummary || '',
      suggestedAction: suggestedAction || '',
      requiredResources: requiredResources || [],
      broadcastRadius: broadcastRadius || 5,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: emergency
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all emergencies (newest first)
// @route   GET /api/emergencies
// @access  Private
const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({})
      .populate('assignedVolunteers')
      .populate('allocatedResources.resource')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single emergency
// @route   GET /api/emergencies/:id
// @access  Private
const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('assignedVolunteers')
      .populate('allocatedResources.resource');

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    res.status(200).json({
      success: true,
      data: emergency
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update emergency status
// @route   PATCH /api/emergencies/:id/status
// @access  Private
const updateEmergencyStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status field is required.' });
  }

  const allowedStatuses = ['Open', 'In Progress', 'Resolved'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    emergency.status = status;
    await emergency.save();

    // Spec says: "When status is changed to Resolved, do NOT automatically complete assignments.
    // Assigned volunteers should still see the assignment and be able to mark completed.
    // So we do NOT update volunteer availability to Available automatically here."

    res.status(200).json({
      success: true,
      data: emergency
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete emergency
// @route   DELETE /api/emergencies/:id
// @access  Private
const deleteEmergency = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    // Restore any allocated resources
    if (emergency.allocatedResources && emergency.allocatedResources.length > 0) {
      for (const alloc of emergency.allocatedResources) {
        const resource = await Resource.findById(alloc.resource);
        if (resource) {
          resource.availableQuantity += alloc.quantity;
          await resource.save();
        }
      }
    }

    // Release any assigned volunteers
    if (emergency.assignedVolunteers && emergency.assignedVolunteers.length > 0) {
      for (const volId of emergency.assignedVolunteers) {
        const volunteer = await Volunteer.findById(volId);
        if (volunteer) {
          volunteer.activeAssignment = null;
          volunteer.availability = 'Available';
          await volunteer.save();
        }
      }
    }

    await Emergency.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Emergency deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get emergency stats summary
// @route   GET /api/emergencies/stats/summary
// @access  Private
const getEmergencyStats = async (req, res) => {
  try {
    const total = await Emergency.countDocuments({});
    // active / open unresolved count
    const open = await Emergency.countDocuments({ status: { $ne: 'Resolved' } });
    const critical = await Emergency.countDocuments({ priority: 'Critical', status: { $ne: 'Resolved' } });
    const resolved = await Emergency.countDocuments({ status: 'Resolved' });

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        critical,
        resolved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign volunteer to emergency (Admin Only)
// @route   POST /api/emergencies/:emergencyId/assign-volunteer
// @access  Private (Admin Only)
const assignVolunteerToEmergency = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required to assign volunteers' });
  }

  const { emergencyId } = req.params;
  const { volunteerId } = req.body;

  if (!volunteerId) {
    return res.status(400).json({ success: false, message: 'Please specify volunteer ID' });
  }

  try {
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency incident not found' });
    }

    if (emergency.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Prevent assigning new volunteers to a Resolved emergency' });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    if (volunteer.availability === 'Offline') {
      return res.status(400).json({ success: false, message: 'Volunteer is offline' });
    }

    if (volunteer.availability === 'Busy' || volunteer.activeAssignment) {
      return res.status(400).json({ success: false, message: 'Volunteer is busy with another assignment' });
    }

    // Check duplicate
    if (emergency.assignedVolunteers.includes(volunteerId)) {
      return res.status(400).json({ success: false, message: 'Volunteer is already assigned to this emergency' });
    }

    // Update volunteer
    volunteer.activeAssignment = emergencyId;
    volunteer.availability = 'Busy';
    await volunteer.save();

    // Update emergency
    emergency.assignedVolunteers.push(volunteerId);
    
    // Add to history
    emergency.assignmentHistory.push({
      volunteer: volunteerId,
      assignedAt: Date.now(),
      status: 'Assigned'
    });
    
    await emergency.save();

    const populated = await Emergency.findById(emergencyId)
      .populate('assignedVolunteers')
      .populate('allocatedResources.resource');

    res.status(200).json({
      success: true,
      message: 'Volunteer assigned successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove volunteer from emergency (Admin Only)
// @route   DELETE /api/emergencies/:emergencyId/unassign-volunteer/:volunteerId
// @access  Private (Admin Only)
const unassignVolunteerFromEmergency = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required to unassign volunteers' });
  }

  const { emergencyId, volunteerId } = req.params;

  try {
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Check if volunteer is assigned
    if (!emergency.assignedVolunteers.includes(volunteerId)) {
      return res.status(400).json({ success: false, message: 'Volunteer is not assigned to this emergency' });
    }

    // Update volunteer
    volunteer.activeAssignment = null;
    volunteer.availability = 'Available';
    await volunteer.save();

    // Remove from emergency assignedVolunteers list
    emergency.assignedVolunteers = emergency.assignedVolunteers.filter(id => id.toString() !== volunteerId);

    // Update history
    const activeLog = emergency.assignmentHistory.find(
      log => log.volunteer.toString() === volunteerId && log.status === 'Assigned'
    );
    if (activeLog) {
      activeLog.status = 'Removed';
      activeLog.completedAt = Date.now();
    }

    await emergency.save();

    const populated = await Emergency.findById(emergencyId)
      .populate('assignedVolunteers')
      .populate('allocatedResources.resource');

    res.status(200).json({
      success: true,
      message: 'Volunteer unassigned successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Allocate resource to emergency (Admin Only)
// @route   POST /api/emergencies/:emergencyId/allocate-resource
// @access  Private (Admin Only)
const allocateResourceToEmergency = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required to allocate resources' });
  }

  const { emergencyId } = req.params;
  const { resourceId, quantity } = req.body;

  if (!resourceId || quantity === undefined || quantity <= 0) {
    return res.status(400).json({ success: false, message: 'Please specify resource ID and a valid positive allocated quantity' });
  }

  try {
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    if (emergency.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Prevent allocating new resources to a Resolved emergency' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (resource.availableQuantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient resources available (Request: ${quantity}, Available: ${resource.availableQuantity})` });
    }

    // Check duplicate
    const duplicate = emergency.allocatedResources.find(r => r.resource.toString() === resourceId);
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Resource is already allocated to this emergency. Release/remove it first.' });
    }

    // Allocate resource
    resource.availableQuantity -= quantity;
    await resource.save();

    emergency.allocatedResources.push({
      resource: resourceId,
      quantity
    });
    await emergency.save();

    const populated = await Emergency.findById(emergencyId)
      .populate('assignedVolunteers')
      .populate('allocatedResources.resource');

    res.status(200).json({
      success: true,
      message: 'Resource allocated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove resource allocation from emergency (Admin Only)
// @route   DELETE /api/emergencies/:emergencyId/remove-resource/:resourceId
// @access  Private (Admin Only)
const removeResourceFromEmergency = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required to remove resources' });
  }

  const { emergencyId, resourceId } = req.params;

  try {
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    const allocationIdx = emergency.allocatedResources.findIndex(r => r.resource.toString() === resourceId);
    if (allocationIdx === -1) {
      return res.status(404).json({ success: false, message: 'Resource allocation not found on this emergency' });
    }

    const allocatedQuantity = emergency.allocatedResources[allocationIdx].quantity;

    const resource = await Resource.findById(resourceId);
    if (resource) {
      resource.availableQuantity += allocatedQuantity;
      // limit availableQuantity to totalQuantity just in case
      if (resource.availableQuantity > resource.totalQuantity) {
        resource.availableQuantity = resource.totalQuantity;
      }
      await resource.save();
    }

    // Remove from emergency list
    emergency.allocatedResources.splice(allocationIdx, 1);
    await emergency.save();

    const populated = await Emergency.findById(emergencyId)
      .populate('assignedVolunteers')
      .populate('allocatedResources.resource');

    res.status(200).json({
      success: true,
      message: 'Resource allocation removed successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  updateEmergencyStatus,
  deleteEmergency,
  getEmergencyStats,
  assignVolunteerToEmergency,
  unassignVolunteerFromEmergency,
  allocateResourceToEmergency,
  removeResourceFromEmergency
};
