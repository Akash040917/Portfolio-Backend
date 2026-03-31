const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS (allow your domain)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🔥 PORT (Render uses this)
const PORT = process.env.PORT || 5000;

// 🔥 FIXED TRANSPORTER (IMPORTANT)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,              // ✅ CHANGED (was 465 ❌)
  secure: false,          // ✅ MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 📩 CONTACT
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 Contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    });

    console.log("Contact mail sent ✅");
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("Contact error ❌:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ⭐ FEEDBACK
app.post("/feedback", async (req, res) => {
  const { name, email, rating, message } = req.body;

  try {
    await transporter.sendMail({
      from: `"Portfolio Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `⭐ Feedback (${rating}/5)`,
      text: `Name: ${name}\nEmail: ${email}\nRating: ${rating}\nMessage: ${message}`
    });

    console.log("Feedback mail sent ✅");
    res.status(200).json({ success: true });

  } catch (err) {
    console.error("Feedback error ❌:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🚀 START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
