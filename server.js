// server.js
import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(express.json());

sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

app.post("/api/send-email", async (req, res) => {
  const { ticket } = req.body; // ticket: { name, email, title }

  const msg = {
    to: ticket.email,
    from: process.env.REACT_APP_SENDGRID_FROM_EMAIL,
    subject: `Ticket Submission: ${ticket.title}`,
    text: `Hi ${ticket.name},\n\nThank you for submitting your ticket titled "${ticket.title}". We will get back to you shortly.\n\nBest regards,\nSupport Team`,
    html: `<p>Hi ${ticket.name},</p>
           <p>Thank you for submitting your ticket titled "<strong>${ticket.title}</strong>". We will get back to you shortly.</p>
           <p>Best regards,<br/>Support Team</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
