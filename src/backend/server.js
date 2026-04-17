require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

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
// MYSQL CONNECTION (SECURE)
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
// LOGIN ROUTE
// =====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  db.query(sql, [email, password], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Server error"
      });
    }

    if (results.length > 0) {
      return res.json({
        success: true,
        message: "Login successful"
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }
  });
});

// =====================
// REGISTER ROUTE
// =====================
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const sql = "INSERT INTO users (email, password) VALUES (?, ?)";

  db.query(sql, [email, password], (err, result) => {
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
});

// =====================
// PRODUCTS ROUTE (SEARCH WORKING)
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
