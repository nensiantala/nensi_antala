import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Simple info route for quick checks
router.get('/', (req, res) => {
	res.json({ message: 'Auth routes', routes: ['POST /register', 'POST /login'] });
});

// Helpful GET for login URL to explain method
router.get('/login', (req, res) => {
	res.status(200).json({ message: 'Use POST /api/auth/login with { email, password }' });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
