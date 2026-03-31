const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🔥 PORT (Render auto assigns)
const PORT = process.env.PORT || 5000;

// 🔥 FINAL TRANSPORTER (WORKS ON RENDER)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ ROOT CHECK
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 📩 CONTACT ROUTE
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  // ✅ VALIDATION
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    console.log("Contact mail sent ✅");

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("Contact error ❌:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ⭐ FEEDBACK ROUTE
app.post("/feedback", async (req, res) => {
  const { name, email, rating, message } = req.body;

  // ✅ VALIDATION
  if (!name || !email || !rating || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `⭐ Feedback (${rating}/5)`,
      html: `
        <h2>New Feedback</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Rating:</strong> ${rating}/5</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    console.log("Feedback mail sent ✅");

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("Feedback error ❌:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
