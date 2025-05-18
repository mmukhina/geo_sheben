const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb+srv://dronefromscratch:plH3bZ1nymzn1AAQ@cluster0.4g6baqg.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Geo_User = mongoose.model("Geo_User", new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// Registration endpoint (stores plaintext password)
app.post("/api/register", async (req, res) => {
  try {
    // Input validation
    if (!req.body.name || !req.body.password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Check if username already exists
    const existingUser = await Geo_User.findOne({ name: req.body.name });
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    // Create new user
    const newUser = new Geo_User({
      name: req.body.name,
      password: req.body.password
    });

    // Save user
    await newUser.save();

    // Success response
    res.status(201).json({ 
      success: true,
      message: "Registration successful",
      redirect: "/users.html"
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false,
      error: "Registration failed. Please try again." 
    });
  }
});

// Login endpoint (compares plaintext passwords)
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await Geo_User.findOne({ name });
    
    if (!user || password !== user.password) {
      return res.status(401).json({ success: false, message: "Неверное имя или пароль" });
    }
    
    // Login successful - redirect to users page
    res.json({ success: true, redirect: "/users.html" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// Helper endpoint to view all users (for debugging)
app.get("/api/users", async (req, res) => {
  try {
    const users = await Geo_User.find();
    res.json(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// Add this endpoint to your existing server.js
app.get("/api/users", async (req, res) => {
  try {
    // Find all users but exclude the password field
    const users = await Geo_User.find({}, { password: 0 });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});