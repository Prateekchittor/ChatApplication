
import express from 'express';
import { signup, login, logout, checkAuth } from '../controllers/authcontroller.js';
import { protectRoute } from '../middleware/protectroute.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// this is called whenever we refresh our page
router.get("/check", protectRoute, checkAuth);

export default router;






