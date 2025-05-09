"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forget_password = exports.Reset_password = exports.Otp_Verification = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const sendEmail_1 = require("../utils/sendEmail");
const otpStore = {};
const Otp_Verification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res
            .status(400)
            .json({ message: "Email and OTP are required", data: null });
    }
    const record = otpStore[email];
    if (!record) {
        return res
            .status(400)
            .json({ message: "No OTP request found for this email", data: null });
    }
    if (record.code !== otp) {
        return res.status(400).json({ message: "Invalid OTP", data: null });
    }
    if (record.expires < Date.now()) {
        delete otpStore[email];
        return res.status(400).json({ message: "OTP has expired", data: null });
    }
    return res.status(200).json({ message: "OTP verification successful", data: null });
});
exports.Otp_Verification = Otp_Verification;
const Reset_password = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required", data: null });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match", data: null });
        }
        const user = yield userModel_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", data: null });
        }
        // Optional: Hash new password (recommended)
        user.password = newPassword;
        yield user.save();
        return res.status(200).json({ message: "Password reset successfully", data: null });
    }
    catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Internal Server Error", data: null });
    }
});
exports.Reset_password = Reset_password;
const forget_password = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required", data: null });
    }
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found", data: null });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore[email] = {
        code: otp,
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };
    try {
        yield (0, sendEmail_1.sendOtpEmail)(email, otp);
        return res
            .status(200)
            .json({ message: "OTP sent to your email", data: null });
    }
    catch (err) {
        console.error("Failed to send OTP:", err);
        return res
            .status(500)
            .json({ message: "Could not send OTP. Try again later.", data: null });
    }
});
exports.forget_password = forget_password;
