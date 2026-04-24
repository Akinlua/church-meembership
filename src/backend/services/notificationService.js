const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize with environment variables if available
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE || 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'mock@example.com',
    pass: process.env.SMTP_PASS || 'mock_pass',
  },
});

const sendEmail = async (to, subject, text) => {
  if (!process.env.SMTP_USER) {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    console.log(`[Email Mock] Body:\n${text}`);
    return;
  }
  
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const sendSMS = async (to, message) => {
  if (!twilioClient) {
    console.log(`[SMS Mock] To: ${to} | Message: ${message}`);
    return;
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

module.exports = {
  sendEmail,
  sendSMS,
};
