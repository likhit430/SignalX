const express = require('express');
const { classifyEmergency } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/classify-emergency', protect, classifyEmergency);

module.exports = router;
