const Resource = require('../models/Resource');

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private
const createResource = async (req, res) => {
  const { name, description, category, totalQuantity, location, contactName, contactPhone, status } = req.body;

  if (!name || !category || totalQuantity === undefined || !location || !contactName || !contactPhone) {
    return res.status(400).json({ success: false, message: 'Please provide all required resource metadata' });
  }

  try {
    const resource = new Resource({
      name,
      description: description || '',
      category,
      totalQuantity,
      availableQuantity: totalQuantity, // initially full quantity is available
      location,
      contactName,
      contactPhone,
      createdBy: req.user._id
    });

    if (status) {
      resource.status = status;
    }

    await resource.save();

    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all resources with search, category, status filters, and pagination
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  const { search, category, status } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  if (category && category !== 'ALL') {
    query.category = category;
  }

  if (status && status !== 'ALL') {
    query.status = status;
  }

  try {
    const resources = await Resource.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Private
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('createdBy', 'name email role');
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update resource metadata
// @route   PATCH /api/resources/:id
// @access  Private
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization: Creator or Admin
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized modification attempt' });
    }

    const { name, description, category, totalQuantity, location, contactName, contactPhone } = req.body;

    if (name !== undefined) resource.name = name;
    if (description !== undefined) resource.description = description;
    if (category !== undefined) resource.category = category;
    if (location !== undefined) resource.location = location;
    if (contactName !== undefined) resource.contactName = contactName;
    if (contactPhone !== undefined) resource.contactPhone = contactPhone;

    if (totalQuantity !== undefined) {
      if (totalQuantity < 0) {
        return res.status(400).json({ success: false, message: 'Total quantity cannot be negative' });
      }
      
      const difference = totalQuantity - resource.totalQuantity;
      resource.totalQuantity = totalQuantity;
      
      const newAvailable = resource.availableQuantity + difference;
      resource.availableQuantity = Math.max(0, Math.min(newAvailable, totalQuantity));
    }

    await resource.save();

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update resource available quantity and status
// @route   PATCH /api/resources/:id/availability
// @access  Private
const updateAvailability = async (req, res) => {
  const { availableQuantity } = req.body;

  if (availableQuantity === undefined) {
    return res.status(400).json({ success: false, message: 'Please specify available quantity' });
  }

  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization: Creator or Admin
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized availability change' });
    }

    if (availableQuantity < 0) {
      return res.status(400).json({ success: false, message: 'Available quantity cannot be negative' });
    }
    if (availableQuantity > resource.totalQuantity) {
      return res.status(400).json({ success: false, message: `Available quantity (${availableQuantity}) cannot exceed total quantity (${resource.totalQuantity})` });
    }
    
    resource.availableQuantity = availableQuantity;
    await resource.save();

    res.status(200).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Authorization: Creator or Admin
    if (resource.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized resource termination' });
    }

    await Resource.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get resource stats summary
// @route   GET /api/resources/stats/summary
// @access  Private
const getResourceStats = async (req, res) => {
  try {
    const totalResources = await Resource.countDocuments({});
    const availableResources = await Resource.countDocuments({ status: 'Available' });
    const limitedResources = await Resource.countDocuments({ status: 'Limited' });
    const unavailableResources = await Resource.countDocuments({ status: 'Unavailable' });

    const sumResult = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: '$availableQuantity' } } }
    ]);
    const totalAvailableQuantity = sumResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalResources,
        availableResources,
        limitedResources,
        unavailableResources,
        totalAvailableQuantity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  updateAvailability,
  deleteResource,
  getResourceStats
};
