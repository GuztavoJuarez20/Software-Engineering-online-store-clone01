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
// MYSQL CONNECTION
// =====================
const db = mysql.createConnection({
  host: "localhost",
  user: "gjuarez1s",
  password: "Gusgusgus$20",
  database: "amazon_clone"
});

db.connect(err => {
  if (err) {
    console.log("❌ DB connection failed:", err);
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
      return res.json({ success: false, message: "Server error" });
    }

    if (results.length > 0) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
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
      return res.status(500).send("Error fetching products");
    }

    res.json(results);
  });
});

// =====================
// START SERVER
// =====================
app.listen(5000, () => {
  console.log("🚀 Server running on http://127.0.0.1:5000");
});
