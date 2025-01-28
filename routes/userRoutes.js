const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

// API Endpoints
router.post("/login", userController.login); // API 1
router.get("/user/:id", userController.getUserFromRedis); // API 2
router.put("/user/:id", userController.updateUser); // API 3
router.delete("/logout/:id", userController.logout); // API 4

module.exports = router;
