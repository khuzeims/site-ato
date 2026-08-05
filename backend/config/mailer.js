const axios = require("axios");
require("dotenv").config();

function extractEmail(value) {
  if (!value) return process.env.EMAIL_USER || "";
  const match = value.match(/<(.+)>/);
  return match ? match[1] : value.trim();
}

function extractName(value) {
  if (!value) return "ATO";
  const match = value.match(/^(.+)\s*</);
  return match ? match[1].trim().replace(/"/g, "") : "ATO";
}

const transporter = {
  async sendMail(options) {
    try {
      const senderEmail = extractEmail(options.from);
      const senderName = extractName(options.from);

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: options.to,
            },
          ],
          subject: options.subject,
          htmlContent: options.html || options.text || "",
        },
        {
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Email envoyé via Brevo API :", response.data.messageId);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur envoi email Brevo API :",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

module.exports = transporter;