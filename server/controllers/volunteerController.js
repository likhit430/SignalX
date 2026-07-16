const Volunteer = require('../models/Volunteer');
const Emergency = require('../models/Emergency');

// @desc    Create or update current user's volunteer profile
// @route   POST /api/volunteers/profile
// @access  Private (Volunteer only)
const createOrUpdateProfile = async (req, res) => {
  const { name, phone, skills, location, availability } = req.body;

  if (!name || !phone || !location) {
    return res.status(400).json({ success: false, message: 'Name, phone, and location are required' });
  }

  try {
    let volunteer = await Volunteer.findOne({ user: req.user._id });

    if (volunteer) {
      // Update
      volunteer.name = name;
      volunteer.phone = phone;
      volunteer.skills = skills || [];
      volunteer.location = location;
      if (availability) volunteer.availability = availability;
      await volunteer.save();
      
      const populated = await Volunteer.findById(volunteer._id)
        .populate('activeAssignment')
        .populate('completedAssignments');

      res.status(200).json({ success: true, data: populated });
    } else {
      // Create
      volunteer = await Volunteer.create({
        user: req.user._id,
        name,
        phone,
        skills: skills || [],
        location,
        availability: availability || 'Available'
      });

      const populated = await Volunteer.findById(volunteer._id)
        .populate('activeAssignment')
        .populate('completedAssignments');

      res.status(201).json({ success: true, data: populated });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all volunteers with search (name, skill, location) and filters
// @route   GET /api/volunteers
// @access  Private
const getVolunteers = async (req, res) => {
  const { search, skill, availability } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { skills: { $regex: search, $options: 'i' } }
    ];
  }

  if (skill && skill !== 'ALL') {
    query.skills = skill;
  }

  if (availability && availability !== 'ALL') {
    query.availability = availability;
  }

  try {
    const volunteers = await Volunteer.find(query)
      .populate('activeAssignment', 'title status location')
      .populate('completedAssignments', 'title category location status updatedAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: volunteers.length,
      data: volunteers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's volunteer profile
// @route   GET /api/volunteers/me
// @access  Private (Volunteer only)
const getMyProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id })
      .populate('activeAssignment')
      .populate('completedAssignments');
    
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found for this node' });
    }

    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current volunteer profile metadata
// @route   PATCH /api/volunteers/me
// @access  Private (Volunteer only)
const updateMyProfile = async (req, res) => {
  const { name, phone, skills, location, availability } = req.body;

  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    if (name !== undefined) volunteer.name = name;
    if (phone !== undefined) volunteer.phone = phone;
    if (skills !== undefined) volunteer.skills = skills;
    if (location !== undefined) volunteer.location = location;
    if (availability !== undefined) volunteer.availability = availability;

    await volunteer.save();

    const populated = await Volunteer.findById(volunteer._id)
      .populate('activeAssignment')
      .populate('completedAssignments');

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update current volunteer availability
// @route   PATCH /api/volunteers/me/availability
// @access  Private (Volunteer only)
const updateAvailability = async (req, res) => {
  const { availability } = req.body;

  if (!availability) {
    return res.status(400).json({ success: false, message: 'Please specify availability status' });
  }

  const allowed = ['Available', 'Busy', 'Offline'];
  if (!allowed.includes(availability)) {
    return res.status(400).json({ success: false, message: 'Invalid availability status value' });
  }

  try {
    const volunteer = await Volunteer.findOne({ user: req.user._id });
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer profile not found' });
    }

    volunteer.availability = availability;
    await volunteer.save();

    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get single volunteer by ID
// @route   GET /api/volunteers/:id
// @access  Private
const getVolunteerById = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id)
      .populate('activeAssignment')
      .populate('completedAssignments');
    
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer node not found' });
    }
    
    res.status(200).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign volunteer to emergency (Admin Only)
// @route   POST /api/volunteers/:volunteerId/assign/:emergencyId
// @access  Private (Admin only)
const assignVolunteer = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required to assign volunteers' });
  }

  const { volunteerId, emergencyId } = req.params;

  try {
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency incident not found' });
    }

    if (emergency.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Cannot assign volunteer to a Resolved emergency' });
    }

    if (volunteer.availability === 'Busy' || volunteer.activeAssignment) {
      return res.status(400).json({ success: false, message: 'Volunteer is busy with another assignment' });
    }

    if (volunteer.availability === 'Offline') {
      return res.status(400).json({ success: false, message: 'Volunteer is Offline' });
    }

    // Update volunteer
    volunteer.activeAssignment = emergencyId;
    volunteer.availability = 'Busy';
    await volunteer.save();

    // Add to emergency assigned list if not exists
    if (!emergency.assignedVolunteers.includes(volunteerId)) {
      emergency.assignedVolunteers.push(volunteerId);
    }

    // Add to emergency assignment history
    emergency.assignmentHistory.push({
      volunteer: volunteerId,
      assignedAt: Date.now(),
      status: 'Assigned'
    });

    await emergency.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer assigned successfully',
      data: { volunteer, emergency }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark assignment completed (Volunteer or Admin)
// @route   PATCH /api/volunteers/:volunteerId/complete/:emergencyId
// @access  Private
const completeAssignment = async (req, res) => {
  const { volunteerId, emergencyId } = req.params;

  try {
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    // Authorization: Volunteer themselves or Admin
    if (volunteer.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized task modification' });
    }

    if (volunteer.activeAssignment?.toString() !== emergencyId) {
      return res.status(400).json({ success: false, message: 'Volunteer is not assigned to this emergency' });
    }

    // Update volunteer
    volunteer.activeAssignment = null;
    if (!volunteer.completedAssignments.includes(emergencyId)) {
      volunteer.completedAssignments.push(emergencyId);
    }
    volunteer.availability = 'Available';
    await volunteer.save();

    // Update Emergency assignment history
    const emergency = await Emergency.findById(emergencyId);
    if (emergency) {
      // Find the active assignment log
      const activeLog = emergency.assignmentHistory.find(
        log => log.volunteer.toString() === volunteerId && log.status === 'Assigned'
      );
      if (activeLog) {
        activeLog.status = 'Completed';
        activeLog.completedAt = Date.now();
      } else {
        emergency.assignmentHistory.push({
          volunteer: volunteerId,
          assignedAt: volunteer.createdAt || Date.now(),
          completedAt: Date.now(),
          status: 'Completed'
        });
      }
      await emergency.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assignment marked as completed',
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove volunteer from emergency (Admin Only)
// @route   POST /api/volunteers/:volunteerId/unassign/:emergencyId
// @access  Private (Admin only)
const unassignVolunteer = async (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required to unassign volunteers' });
  }

  const { volunteerId, emergencyId } = req.params;

  try {
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency incident not found' });
    }

    if (volunteer.activeAssignment?.toString() !== emergencyId) {
      return res.status(400).json({ success: false, message: 'Volunteer is not assigned to this emergency' });
    }

    // Update volunteer
    volunteer.activeAssignment = null;
    volunteer.availability = 'Available';
    await volunteer.save();

    // Remove from emergency assignedVolunteers array
    emergency.assignedVolunteers = emergency.assignedVolunteers.filter(id => id.toString() !== volunteerId);

    // Update Emergency assignment history
    const activeLog = emergency.assignmentHistory.find(
      log => log.volunteer.toString() === volunteerId && log.status === 'Assigned'
    );
    if (activeLog) {
      activeLog.status = 'Removed';
      activeLog.completedAt = Date.now();
    }

    await emergency.save();

    res.status(200).json({
      success: true,
      message: 'Volunteer unassigned successfully',
      data: { volunteer, emergency }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get volunteer stats summary
// @route   GET /api/volunteers/stats/summary
// @access  Private
const getVolunteerStats = async (req, res) => {
  try {
    const totalVolunteers = await Volunteer.countDocuments({});
    const availableVolunteers = await Volunteer.countDocuments({ availability: 'Available' });
    const busyVolunteers = await Volunteer.countDocuments({ availability: 'Busy' });
    const offlineVolunteers = await Volunteer.countDocuments({ availability: 'Offline' });

    res.status(200).json({
      success: true,
      data: {
        totalVolunteers,
        availableVolunteers,
        busyVolunteers,
        offlineVolunteers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrUpdateProfile,
  getVolunteers,
  getMyProfile,
  updateMyProfile,
  updateAvailability,
  assignVolunteer,
  completeAssignment,
  unassignVolunteer,
  getVolunteerStats,
  getVolunteerById
};
