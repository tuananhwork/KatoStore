const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // vì dùng port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  const from = process.env.MAIL_FROM || 'no-reply@katostore.local';
  return transporter.sendMail({ from, to, subject, html });
}

module.exports = { transporter, sendMail };
