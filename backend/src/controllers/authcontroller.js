import { getDB } from '../lib/db.js';
import bcrypt from "bcryptjs"; /// ****for salting password
import { generateToken } from '../lib/utils.js';



export const signup = async (req, res) => {
    console.log("i am in signup route");

    const db = getDB();
    const { Name, Email, Password } = req.body;

    try {
        if (!Name || !Email || !Password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (Password.length < 6) {
            return res.status(400).json({ message: "Password must be atleast 6 characters" });
        }

        const user = await db.collection('authentication').findOne({ Email });

        if (user) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(Password, salt);

    
        const newUser = {
            Name,
            Email,
            Password: hashedpassword,
           
        };

        const result = await db.collection('authentication').insertOne(newUser);

        if (result.insertedId) {
            generateToken(result.insertedId, res);
            return res.status(201).json({ message: "User registered successfully" });
        } else {
            
           
            return res.status(500).json({ message: "User creation failed" });
        }

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    console.log("i am in login route");

    const db = getDB();
    const { Email, Password } = req.body;
    console.log("Incoming login:", Email, Password); // ✅ Check what's being received

    try {
        const user = await db.collection('authentication').findOne({ Email });
        console.log("Found user:", user); // ✅ Check if user was found

        if (!user) {
            return res.status(400).json({ message: "Invalid email id" });
        }

        const isPasswordCorrect = await bcrypt.compare(Password, user.Password);
        console.log("Password correct:", isPasswordCorrect); // ✅ Confirm password check

        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            Name: user.Name,
            Email: user.Email,
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};




export const logout = (req, res) => {
    console.log("i am in logout route");

    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error("Error in check auth:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
