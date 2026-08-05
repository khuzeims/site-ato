const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  family: 4, // <--- Force l'utilisation d'IPv4 uniquement
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP VERIFY ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

module.exports = transporter;