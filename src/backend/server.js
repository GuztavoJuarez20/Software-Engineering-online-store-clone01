require("dotenv").config({
  path: require("path").join(__dirname, "../../.env")
});

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());

// =====================
// FRONTEND PATH
// =====================
const FRONTEND_PATH = path.join(__dirname, "../../Frontend");
app.use(express.static(FRONTEND_PATH));

// =====================
// MYSQL CONNECTION
// =====================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// =====================
// DEFAULT ROUTE
// =====================
app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_PATH, "login.html"));
});

// =====================
// REGISTER ROUTE (HASHING + VALIDATION)
// =====================
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // 🚨 EMAIL CANNOT BE EMPTY
  if (!email || email.trim() === "") {
    return res.json({
      success: false,
      message: "Email cannot be empty"
    });
  }

  // 🚨 PASSWORD CANNOT BE EMPTY
  if (!password || password.trim() === "") {
    return res.json({
      success: false,
      message: "Password cannot be empty"
    });
  }

  // 🔐 Strong password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.json({
      success: false,
      message:
        "Password must be 8+ chars, include uppercase, lowercase, and number"
    });
  }

  try {
    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (email, password) VALUES (?, ?)";

    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        console.log(err);
        return res.json({
          success: false,
          message: "User already exists or error"
        });
      }

      res.json({
        success: true,
        message: "Account created successfully"
      });
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Error hashing password");
  }
});

// =====================
// LOGIN ROUTE (SECURE)
// =====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.json({ success: false, message: "Server error" });
    }

    if (results.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = results[0];

    // 🔐 Compare hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.json({
        success: true,
        message: "Login successful"
      });
    } else {
      res.json({
        success: false,
        message: "Invalid password"
      });
    }
  });
});

// =====================
// PRODUCTS ROUTE (SEARCH)
// =====================
app.get("/products", (req, res) => {
  const search = req.query.search;

  let sql = "SELECT * FROM products";
  let values = [];

  if (search && search.trim() !== "") {
    sql = `
      SELECT * FROM products
      WHERE LOWER(name) LIKE LOWER(?)
      OR LOWER(description) LIKE LOWER(?)
    `;
    values = [`%${search}%`, `%${search}%`];
  }

  db.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error fetching products");
    }

    res.json(results);
  });
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
