const { classifyEmergencyText } = require('../services/geminiService');

const classifyEmergency = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ status: 'fail', message: 'Message text is required' });
  }

  try {
    const classification = await classifyEmergencyText(message);
    res.status(200).json({
      status: 'success',
      data: classification
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = { classifyEmergency };
