import express from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
// import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.js';

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("businessProfile.name").notEmpty(),
    body("businessProfile.description").notEmpty(),
    body("businessProfile.industry").isIn([
      "food",
      "retail",
      "hospitality",
      "fitness",
      "general",
    ]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, businessProfile } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");

      // Create user
      const user = new User({
        email,
        password,
        businessProfile,
        verificationToken,
      });

      await user.save();

      // Send verification email
      // await sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        message:
          "User created successfully. Please check your email to verify your account.",
        userId: user._id,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check if verified
      if (!user.isVerified) {
        return res
          .status(400)
          .json({ message: "Please verify your email first" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          businessProfile: user.businessProfile,
          subscription: user.subscription,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Verify email
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot password
router.post(
  "/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.json({
          message: "If an account exists, a reset email has been sent",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
      await user.save();

      // await sendPasswordResetEmail(email, resetToken);

      res.json({
        message: "If an account exists, a reset email has been sent",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Reset password
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
