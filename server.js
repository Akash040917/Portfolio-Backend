const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { Resend } = require("resend");
const rateLimit = require("express-rate-limit");

const app = express();

// 🔐 1. RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests, try again later"
});
app.use(limiter);

// 🌐 2. CORS (FINAL SETUP)
const allowedOrigins = [
  "http://localhost:3000",
  "https://akashraghuramrl.me",
  "https://www.akashraghuramrl.me"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));

app.use(express.json());

// 📊 3. REQUEST LOGGING
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ⏱️ 4. TIMEOUT PROTECTION
app.use((req, res, next) => {
  res.setTimeout(5000, () => {
    res.status(408).send("Request Timeout");
  });
  next();
});

// 🔥 PORT
const PORT = process.env.PORT || 5000;

// 🔥 INIT RESEND
const resend = new Resend(process.env.RESEND_API_KEY);

// 🧠 5. EMAIL VALIDATION
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// 🧼 6. SANITIZATION
const sanitize = (text) => {
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// 🤖 7. MESSAGE CATEGORY
const getCategory = (message) => {
  message = message.toLowerCase();

  if (message.includes("job") || message.includes("internship")) return "Opportunity";
  if (message.includes("project") || message.includes("collaboration")) return "Collaboration";
  return "General";
};

// ✅ ROOT
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// 🧪 8. HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// 📩 CONTACT
app.post("/contact", async (req, res) => {
  let { name, email, message } = req.body;

  name = name?.trim();
  email = email?.trim();
  message = message?.trim();

  // ❌ VALIDATION
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (message.length < 10) {
    return res.status(400).json({ error: "Message too short" });
  }

  // 🧼 SANITIZE
  name = sanitize(name);
  message = sanitize(message);

  const category = getCategory(message);

  try {
    // 📩 ADMIN MAIL
    await resend.emails.send({
      from: "Akash Portfolio <hello@contact.akashraghuramrl.me>",
      to: "akashvijai1794@gmail.com",
      reply_to: email,
      subject: `📩 Contact from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `
    });

    // 📬 AUTO REPLY
    await resend.emails.send({
      from: "Akash Portfolio <hello@contact.akashraghuramrl.me>",
      to: email,
      subject: "Thanks for contacting me 🙌",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out. I received your message and will reply soon.</p>
        <br>
        <p>Regards,<br>Akash</p>
      `
    });

    console.log("Contact mail sent ✅");

    res.json({
      success: true,
      message: "Message sent successfully"
    });

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

  name = name?.trim();
  email = email?.trim();
  message = message?.trim();

  if (!name || !email || !rating || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields"
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (message.length < 10) {
    return res.status(400).json({ error: "Message too short" });
  }

  name = sanitize(name);
  message = sanitize(message);

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

    // 📬 AUTO REPLY
    await resend.emails.send({
      from: "Akash Portfolio <hello@contact.akashraghuramrl.me>",
      to: email,
      subject: "Thanks for your feedback ⭐",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for your feedback! I appreciate your time 🙌</p>
        <br>
        <p>Regards,<br>Akash</p>
      `
    });

    console.log("Feedback mail sent ✅");

    res.json({
      success: true,
      message: "Feedback sent successfully"
    });

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
