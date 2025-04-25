import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const JWT_SECRET = 'mysecretkey';

    
    const NODE_ENV = 'development';

    const token = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        httpOnly: true,
        secure: NODE_ENV !== "development",
        sameSite: "Lax", // ✅ prevents blocking on cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};
