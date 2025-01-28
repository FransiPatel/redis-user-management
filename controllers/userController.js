const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
require("dotenv").config();

module.exports = {
  // API 1: Login and store user in Redis
  login: async (req, res) => {
    try {
      const { id, username, phone, email, password } = req.body;

      // Hash password for simplicity
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = { id, username, phone, email, password: hashedPassword };

      // Store user data in Redis
      await redisClient.set(`user:${id}`, JSON.stringify(user));

      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
      });

      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // API 2: Get user data from Redis
  getUserFromRedis: async (req, res) => {
    try {
      const { id } = req.params;

      const userData = await redisClient.get(`user:${id}`);

      if (!userData) return res.status(404).json({ message: "User not found in Redis" });

      res.status(200).json(JSON.parse(userData));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // API 3: Update user information in Redis
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { username, phone, email, password } = req.body;

      const userData = await redisClient.get(`user:${id}`);

      if (!userData) return res.status(404).json({ message: "User not found in Redis" });

      const user = JSON.parse(userData);

      // Update user fields
      user.username = username || user.username;
      user.phone = phone || user.phone;
      user.email = email || user.email;
      user.password = password ? await bcrypt.hash(password, 10) : user.password;

      // Save updated user in Redis
      await redisClient.set(`user:${id}`, JSON.stringify(user));

      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // API 4: Logout (clear user from Redis)
  logout: async (req, res) => {
    try {
      const { id } = req.params;

      // Remove user from Redis
      await redisClient.del(`user:${id}`);

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
