import jwt from "jsonwebtoken";
import { getDB } from '../lib/db.js';
import { ObjectId } from "mongodb";

export const protectRoute = async (req, res, next) => {
    const db = getDB();

    try {
        const token = req.cookies.jwt;
        console.log("🧪 Received Token:", token);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No token provided" });
        }

        const JWT_SECRET = 'mysecretkey';
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ Decoded Token:", decoded);

        const user = await db.collection('authentication').findOne({ _id: new ObjectId(decoded.userId) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("❌ Protect route error:", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};
