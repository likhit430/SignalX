const express = require('express');
const { 
  createResource, 
  getResources, 
  getResourceById, 
  updateResource, 
  updateAvailability, 
  deleteResource, 
  getResourceStats 
} = require('../controllers/resourceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Mount stats/summary BEFORE :id parameters
router.get('/stats/summary', protect, getResourceStats);

router.post('/', protect, createResource);
router.get('/', protect, getResources);
router.get('/:id', protect, getResourceById);
router.patch('/:id', protect, updateResource);
router.patch('/:id/availability', protect, updateAvailability);
router.delete('/:id', protect, deleteResource);

module.exports = router;
