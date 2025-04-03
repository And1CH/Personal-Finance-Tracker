// emailService.js
const nodemailer = require('nodemailer');

// For production, use real SMTP credentials or a service like SendGrid.
const transporter = nodemailer.createTransport({
  service: 'Gmail', // or "smtp.your-email-provider.com"
  auth: {
    user: 'yourEmail@gmail.com',
    pass: 'yourEmailPassword'
  }
});

function sendEmailNotification(toEmail, subject, message, callback) {
  const mailOptions = {
    from: 'yourEmail@gmail.com',
    to: toEmail,
    subject: subject,
    html: message  // Use "text" for plain text emails
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.error('Error sending email:', error);
      callback(error);
    } else {
      console.log('Email sent:', info.response);
      callback(null, info.response);
    }
  });
}

module.exports = { sendEmailNotification };
