const nodemailer = require("nodemailer");
require("dotenv").config();
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "42.250.102.108",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP VERIFY ERROR:", error);
    } else {
        console.log("SMTP READY");
    }
});

module.exports = transporter;