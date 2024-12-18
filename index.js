import express from "express";
import mongoose from "mongoose"
import cors from "cors"
import User from "./models/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const secretkey = "secretkey";

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/Employee');

// Signup Route
app.post("/signup", async (req, res) => {
    const { email, username, password } = req.body; //The route listens for POST requests to /signup. It expects the request body to contain email, username, and password.

    try {
        // Hash the password                                    //hashing is the practice of transforming string of characters into another value for the perpose of security.
        const hashedPassword = await bcrypt.hash(password, 10); //The password provided by the user is hashed using bcrypt.hash(). The second argument (10) is the salt rounds, which determines the complexity of the hashing process.
        //In hashing, a salt is a random string of characters that's added to a password before it's hashed.
        // Create a new user
        const newUser = new User({ email, username, password: hashedPassword });
        await newUser.save();                              //The save() method is called to store the new user in the database.

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.log(err);
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        jwt.sign({ user }, secretkey, { expiresIn: '3000s' }, (err, token) => {
            if (err) {
                return res.status(500).json({ error: "Inernal server error" });
            }
            res.status(200).json({
                token,
                message: "Login successfully"
            })
        })
    } catch (err) {
        res.status(500).json({ error: "Internal server error" });
        console.log(err);
    }
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`server is running on port ${port}!`);
})