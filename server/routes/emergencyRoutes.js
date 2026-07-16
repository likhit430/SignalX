const express = require('express');
const { 
  createEmergency, 
  getEmergencies, 
  getEmergencyById, 
  updateEmergencyStatus, 
  deleteEmergency, 
  getEmergencyStats,
  allocateResourceToEmergency,
  removeResourceFromEmergency,
  assignVolunteerToEmergency,
  unassignVolunteerFromEmergency
} = require('../controllers/emergencyController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Mount stats/summary BEFORE :id parameters
router.get('/stats/summary', protect, getEmergencyStats);

router.post('/', protect, createEmergency);
router.get('/', protect, getEmergencies);
router.get('/:id', protect, getEmergencyById);
router.patch('/:id/status', protect, updateEmergencyStatus);
router.delete('/:id', protect, deleteEmergency);

// Operational assignments & allocations
router.post('/:emergencyId/assign-volunteer', protect, assignVolunteerToEmergency);
router.delete('/:emergencyId/unassign-volunteer/:volunteerId', protect, unassignVolunteerFromEmergency);
router.post('/:emergencyId/allocate-resource', protect, allocateResourceToEmergency);
router.delete('/:emergencyId/remove-resource/:resourceId', protect, removeResourceFromEmergency);

module.exports = router;
