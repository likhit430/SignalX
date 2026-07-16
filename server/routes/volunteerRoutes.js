const express = require('express');
const { 
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
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// 1. Static routes and /me routes FIRST
router.get('/me', protect, getMyProfile);
router.get('/stats/summary', protect, getVolunteerStats);

// 2. Profile modification / availability updates for Volunteers
router.post('/profile', protect, authorize('Volunteer'), createOrUpdateProfile);
router.patch('/me', protect, authorize('Volunteer'), updateMyProfile);
router.patch('/me/availability', protect, authorize('Volunteer'), updateAvailability);

// 3. Operational assignments (Admin/Volunteer roles)
router.post('/:volunteerId/assign/:emergencyId', protect, assignVolunteer);
router.patch('/:volunteerId/complete/:emergencyId', protect, completeAssignment);
router.post('/:volunteerId/unassign/:emergencyId', protect, unassignVolunteer);

// 4. Listing and details parameters last
router.get('/', protect, getVolunteers);
router.get('/:id', protect, getVolunteerById);

module.exports = router;
