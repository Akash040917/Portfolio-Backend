const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Resend } = require("resend");

const app = express();

// ✅ CORS
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// 🔥 PORT
const PORT = process.env.PORT || 5000;

// 🔍 DEBUG
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Loaded ✅" : "Missing ❌");

// 🔥 RESEND INIT
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


// 📩 CONTACT
app.post("/contact", async (req, res) => {
  let { name, email, message } = req.body;

  // ✅ CLEAN INPUT
  name = name?.trim();
  email = email?.trim();
  message = message?.trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  try {
    await resend.emails.send({
      from: "Akash Portfolio <hello@contact.akashraghuramrl.me>", // 🔥 change later to custom domain
      to: "akashvijai1794@gmail.com",
      reply_to: email,
      subject: `📩 Contact from ${name}`,
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


// ⭐ FEEDBACK
app.post("/feedback", async (req, res) => {
  let { name, email, rating, message } = req.body;

  // ✅ CLEAN INPUT
  name = name?.trim();
  email = email?.trim();
  message = message?.trim();

  if (!name || !email || !rating || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  try {
    await resend.emails.send({
      from: "Akash Portfolio <hello@contact.akashraghuramrl.me>",
      to: "akashvijai1794@gmail.com",
      reply_to: email,
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
