const nodemailer = require("nodemailer");
require("dotenv").config();
const dns = require("dns");

// Conserve cette ligne : elle résout souvent les problèmes d'IPv6 sur Render
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // false pour le port 587 (utilise STARTTLS)
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  // Optionnel : ajuste le délai si le réseau Render est lent au démarrage
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