import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Debug environment variables
const apiKey = process.env.SENDGRID_API_KEY || process.env.REACT_APP_SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.REACT_APP_SENDGRID_FROM_EMAIL;

// Log environment variable status (without revealing full key)
console.log("API Key status:", apiKey ? `Present (${apiKey.substring(0, 4)}...)` : "Missing");
console.log("From Email status:", fromEmail || "Missing");

// Set SendGrid API key
if (apiKey) {
  sgMail.setApiKey(apiKey);
} else {
  console.error("SendGrid API key is missing. Emails will fail to send.");
}

app.post("/api/send-email", async (req, res) => {
  const { ticket } = req.body;
  
  // Debug log to verify payload
  console.log("Received ticket payload:", ticket);
  
  // Validate required fields
  if (!ticket || !ticket.email || !ticket.name || !ticket.title) {
    console.error("Missing required fields in ticket payload");
    return res.status(400).json({ 
      error: "Missing required fields", 
      requiredFields: ["name", "email", "title"] 
    });
  }
  
  // Validate sender email
  if (!fromEmail) {
    console.error("Sender email not configured");
    return res.status(500).json({ error: "Sender email not configured" });
  }

  let msg;

  // Determine email type based on ticket properties
  if (ticket.hasOwnProperty("closed") && (ticket.closed === true || ticket.closed === "true")) {
    console.log("Preparing closure email");
    msg = {
      to: ticket.email,
      from: fromEmail,
      subject: `Ticket Closed: ${ticket.title}`,
      text: `Hi ${ticket.name},\n\nYour ticket titled "${ticket.title}" has been closed. We hope your issue has been resolved. If you need further assistance, please contact support.\n\nBest regards,\nSupport Team`,
      html: `<p>Hi ${ticket.name},</p>
             <p>Your ticket titled "<strong>${ticket.title}</strong>" has been closed. We hope your issue has been resolved. If you need further assistance, please contact support.</p>
             <p>Best regards,<br/>Support Team</p>`,
    };
  } else if (ticket.hasOwnProperty("assignedEmployee") && ticket.assignedEmployee) {
    console.log("Preparing assignment email");
    msg = {
      to: ticket.email,
      from: fromEmail,
      subject: `Ticket Assigned: ${ticket.title}`,
      text: `Hi ${ticket.name},\n\nYour ticket titled "${ticket.title}" has been assigned to ${ticket.assignedEmployee}. We will update you with further details soon.\n\nBest regards,\nSupport Team`,
      html: `<p>Hi ${ticket.name},</p>
             <p>Your ticket titled "<strong>${ticket.title}</strong>" has been assigned to <strong>${ticket.assignedEmployee}</strong>. We will update you with further details soon.</p>
             <p>Best regards,<br/>Support Team</p>`,
    };
  } else {
    console.log("Preparing submission confirmation email");
    msg = {
      to: ticket.email,
      from: fromEmail,
      subject: `Ticket Submission: ${ticket.title}`,
      text: `Hi ${ticket.name},\n\nThank you for submitting your ticket titled "${ticket.title}". We will get back to you shortly.\n\nBest regards,\nSupport Team`,
      html: `<p>Hi ${ticket.name},</p>
             <p>Thank you for submitting your ticket titled "<strong>${ticket.title}</strong>". We will get back to you shortly.</p>
             <p>Best regards,<br/>Support Team</p>`,
    };
  }

  // Print email details for debugging (excluding content for brevity)
  console.log("Email details:", {
    to: msg.to,
    from: msg.from,
    subject: msg.subject
  });

  try {
    // Check if API key is present
    if (!apiKey) {
      throw new Error("SendGrid API key is not configured");
    }
    
    await sgMail.send(msg);
    console.log("Email sent successfully");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Provide detailed error information
    const errorDetails = {
      message: "Failed to send email",
      error: error.message,
      code: error.code || "UNKNOWN"
    };
    
    if (error.response) {
      errorDetails.responseBody = error.response.body;
    }
    
    res.status(500).json(errorDetails);
  }
});

// Add basic health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    apiKeyConfigured: !!apiKey,
    fromEmailConfigured: !!fromEmail
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});