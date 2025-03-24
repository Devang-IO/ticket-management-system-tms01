import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import { VercelRequest, VercelResponse } from "@vercel/node";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const apiKey = process.env.SENDGRID_API_KEY || process.env.REACT_APP_SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.REACT_APP_SENDGRID_FROM_EMAIL;

if (apiKey) {
  sgMail.setApiKey(apiKey);
} else {
  console.error("SendGrid API key is missing. Emails will fail to send.");
}

// API route to send email
app.post("/api/send-email", async (req, res) => {
  const { ticket } = req.body;

  if (!ticket || !ticket.email || !ticket.name || !ticket.title) {
    return res.status(400).json({ 
      error: "Missing required fields", 
      requiredFields: ["name", "email", "title"] 
    });
  }

  if (!fromEmail) {
    return res.status(500).json({ error: "Sender email not configured" });
  }

  let msg;
  if (ticket.closed) {
    msg = {
      to: ticket.email,
      from: fromEmail,
      subject: `Ticket Closed: ${ticket.title}`,
      text: `Hi ${ticket.name}, your ticket has been closed.`,
      html: `<p>Hi ${ticket.name}, your ticket titled "<strong>${ticket.title}</strong>" has been closed.</p>`,
    };
  } else if (ticket.assignedEmployee) {
    msg = {
      to: ticket.email,
      from: fromEmail,
      subject: `Ticket Assigned: ${ticket.title}`,
      text: `Hi ${ticket.name}, your ticket has been assigned to ${ticket.assignedEmployee}.`,
      html: `<p>Hi ${ticket.name}, your ticket has been assigned to <strong>${ticket.assignedEmployee}</strong>.</p>`,
    };
  } else {
    msg = {
      to: ticket.email,
      from: fromEmail,
      subject: `Ticket Submission: ${ticket.title}`,
      text: `Hi ${ticket.name}, your ticket has been received.`,
      html: `<p>Hi ${ticket.name}, your ticket "<strong>${ticket.title}</strong>" has been received.</p>`,
    };
  }

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Export handler for Vercel
export default (req, res) => app(req, res);
