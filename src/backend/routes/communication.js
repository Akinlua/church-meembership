const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sendEmail, sendSMS } = require('../services/notificationService');

// POST /api/communication/email  — send an email
router.post('/email', authenticateToken, async (req, res) => {
  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'to, subject, and body are required.' });
  }
  try {
    await sendEmail(to, subject, body);
    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Communication email error:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

// POST /api/communication/sms  — send an SMS text
router.post('/sms', authenticateToken, async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ message: 'to and message are required.' });
  }
  try {
    await sendSMS(to, message);
    res.json({ message: 'SMS sent successfully.' });
  } catch (error) {
    console.error('Communication SMS error:', error);
    res.status(500).json({ message: 'Failed to send SMS.' });
  }
});

module.exports = router;
