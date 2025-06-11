require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const nodemailer = require("nodemailer");

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 5000;

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure .env contains this key
});

const app = express();

// Middleware setup
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://127.0.0.1:5501", 
      "https://sethtsidi.github.io",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(bodyParser.json());

// Setup nodemailer transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// MySQL Database connection
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// Middleware to verify JWT token for protected routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not found. Please log in." });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token is invalid or expired." });
    }
    req.user = user; // Attach the decoded user information to the request
    next(); // Continue to the next middleware or route handler
  });
}

// Register route with reCAPTCHA integration

app.post("/register", async (req, res) => {
  const { email, password, confirmPassword, recaptchaResponse } = req.body;

  if (!email || !password || !confirmPassword || !recaptchaResponse) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }
  if (password !== confirmPassword) {
    return res.status(400).send({ error: "Passwords do not match." });
  }

  try {
    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
    const captchaVerification = await axios.post(verificationUrl);

    if (!captchaVerification.data.success) {
      return res
        .status(400)
        .send({ error: "CAPTCHA verification failed. Please try again." });
    }

    // Check if user already exists
    const [existingUser] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (existingUser.length > 0) {
      return res
        .status(400)
        .send({ error: "User already exists. Please log in." });
    }

    // Hash the password and register the user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query("INSERT INTO users (email, password) VALUES (?, ?)", [
        email,
        hashedPassword,
      ]);

    res.status(200).send({ message: "Account successfully created!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// Login route
const loginAttempts = {};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }

  try {
   
    const attempt = loginAttempts[email];

    if (attempt && attempt.count >= 3) {
      console.log("Too many attempts detected");
      const timePassed = Date.now() - attempt.lastAttempt;
      const cooldown = 10 * 60 * 1000; // 10 minutes
    
      if (timePassed < cooldown) {
        const minsLeft = Math.ceil((cooldown - timePassed) / 60000);
        console.log(`[LOGIN BLOCKED] ${email} is temporarily locked out. ${minsLeft} minute(s) left`);
        
        return res.status(429).send({
          error: `⛔ Too many failed login attempts. Try again in ${minsLeft} minute(s).`
        });
      } else {
        // Reset if cooldown is over
        loginAttempts[email] = { count: 0, lastAttempt: Date.now() };
      }
    }
     // 💡 Only log here, after attempt is defined or reset
  console.log(`[LOGIN ATTEMPT] ${email} - Current Attempts:`, loginAttempts[email]?.count || 0);
    
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      if (!loginAttempts[email]) {//checks if the email has not been logged yet.
        loginAttempts[email] = { count: 1, lastAttempt: Date.now() };
      } else {
        loginAttempts[email].count += 1;
        loginAttempts[email].lastAttempt = Date.now();
      }

      console.log(`[FAILED LOGIN - EMAIL] ${email} not found. Attempt ${loginAttempts[email].count}`);
      console.log("Updated loginAttempts:", loginAttempts);
      return res.status(401).send({ error: "Invalid email or password" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 1, lastAttempt: Date.now() };
        console.log("Wrong password - first attempt tracking started");
      } else {
        loginAttempts[email].count += 1;
        loginAttempts[email].lastAttempt = Date.now();
      }

      console.log(`[FAILED LOGIN - PASSWORD] Wrong password for ${email}. Attempt ${loginAttempts[email].count}`);
      console.log("Updated loginAttempts:", loginAttempts);
      return res.status(401).send({ error: "Invalid email or password" });
    }

    // ✅ If login is successful
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    console.log(`[SUCCESSFUL LOGIN] ${email} logged in.`);
    console.log("Generated JWT Token:", token);

    res.status(200).send({ token });

    delete loginAttempts[email]; // Reset attempt record on success
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({ error: "Internal server error." });
  }
});

// Forgot password route with email sending
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const [users] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ error: "No user with that email." });
    }

    const user = users[0];
    const resetToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `<h3>Password Reset</h3>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>`,
    });

    res.status(200).json({ message: "Reset email sent." });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Server error." });
  }
});


// Route to handle resetting password via token
app.post("/reset-password", async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(403).json({ error: "Invalid or expired token." });
  }
});

// Chatbot Route (Protected by JWT with OpenAI Integration)
app.post("/chat", authenticateToken, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      max_tokens: 150,
    });

    if (!response || !response.choices || response.choices.length === 0) {
      return res.status(500).json({ error: "⚠️ OpenAI returned an empty response." });
    }

    const botResponse = response.choices[0].message.content.trim();
    res.json({ response: botResponse });
  } catch (error) {
    console.error("❌ Error during OpenAI API call:", error);
    res.status(500).json({ error: "❌ OpenAI API error. Check server logs." });
  }
});
//search functionality
app.get("/api/search-courses", async (req, res) => {
  const { query } = req.query;

  // Log the received query
  console.log("Received query:", query);

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required." });
  }

  try {
    // Log before running the query
    console.log("Running database query with LIKE operator...");

    // Use the correct column name "title" instead of "titles"
    const [courses] = await db
      .promise()
      .query("SELECT title, link FROM courses WHERE title LIKE ?", [`%${query}%`]);

    // Log the result of the query
    console.log("Query result:", courses);

    if (courses.length === 0) {
      return res.status(404).json({ error: "No courses found." });
    }

    // Respond with the search results
    res.json(courses);
  } catch (error) {
    // Log the error
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// Protected route example (requires valid token)
app.get("/protected-route", authenticateToken, (req, res) => {
  res.json({ message: `Welcome! You are logged in as ${req.user.email}.` });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
