// api/send-email.js
const sgMail = require("@sendgrid/mail");

// Set the SendGrid API key from your environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { ticket } = req.body;
  if (!ticket) {
    return res.status(400).json({ error: "Ticket data is required" });
  }

  const msg = {
    to: ticket.email, // Recipient email (ticket submitter)
    from:"quickassist2025@gmail.com", // Replace with your verified sender email in SendGrid
    subject: `Ticket Received: ${ticket.title}`,
    text: `Hi ${ticket.name},\n\nWe have received your ticket regarding: ${ticket.title}. Our support team will get back to you shortly.\n\nThank you,\nSupport Team`,
    html: `<p>Hi ${ticket.name},</p>
           <p>We have received your ticket regarding: <strong>${ticket.title}</strong>. Our support team will get back to you shortly.</p>
           <p>Thank you,<br/>Support Team</p>`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("SendGrid error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
};
