const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid');

const transporter = nodemailer.createTransport(
  sgTransport({
    apiKey: process.env.SENDGRID_API_KEY,
  })
);

async function sendMail({ to, subject, html }) {
  const from = process.env.MAIL_FROM || 'no-reply@katostore.local';
  return transporter.sendMail({ from, to, subject, html });
}

module.exports = { transporter, sendMail };
