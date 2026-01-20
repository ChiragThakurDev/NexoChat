import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

dotenv.config();

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!password || !email || !fullName)
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be  at least 6 characters",
      });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashPassword,
    });
    if (newUser) {
      const jtoken = generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        profilePic: newUser.profilePic,
        jtoken,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Errors" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        message: "No User Found, Please Register ",
        success: false,
      });
    }
    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual)
      return res.status(400).json({
        message: "Password is incorrect",
      });

    const jtoken = generateToken(user._id, res);
    res.status(200).json({
      message: "Login Successfully",
      success: true,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      profilePic: user.profilePic,
      jtoken,
    });
  } catch (error) {
    res.status(404).json({
      message: "Internal Server Error",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout Successfully", success: true });
  } catch (error) {
    res.status(404).json({
      message: "Error in logout controller",
      success: false,
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }
    const uploaderResponse = await cloudinary.uploader.upload(profilePic, {
      resource_type: "auto",
      folder: "profile_pics",
      transformation: [
        { width: 150, height: 150, crop: "fill", gravity: "face" },
        { quality: "auto:low" },
        { fetch_format: "auto" },
      ],
    });
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploaderResponse.secure_url,
      },
      {
        new: true,
      }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internet Server Error" });
  }
};
