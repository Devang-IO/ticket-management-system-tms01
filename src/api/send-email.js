// /api/send-email.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.REACT_APP_SENDGRID_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { ticket } = req.body; // ticket includes { name, email, title }
    
    // Build the email content
    const msg = {
      to: ticket.email, // recipient's email
      from: process.env.REACT_APP_SENDGRID_FROM_EMAIL, // sender email from env
      subject: `Ticket Submission: ${ticket.title}`,
      text: `Hi ${ticket.name},\n\nThank you for submitting your ticket titled "${ticket.title}". We will get back to you shortly.\n\nBest regards,\nSupport Team`,
      html: `<p>Hi ${ticket.name},</p>
             <p>Thank you for submitting your ticket titled "<strong>${ticket.title}</strong>". We will get back to you shortly.</p>
             <p>Best regards,<br/>Support Team</p>`,
    };

    // Send the email
    await sgMail.send(msg);
    console.log("Email sent successfully");
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
