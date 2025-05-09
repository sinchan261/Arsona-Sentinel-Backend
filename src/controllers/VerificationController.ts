import { Request, Response } from 'express';
import userModel from '../models/userModel';
import { sendOtpEmail } from '../utils/sendEmail';

const otpStore: Record<string, { code: string; expires: number }> = {};

export const Otp_Verification= async (req:Request,res:Response):Promise<any>=>{
  const { email, otp } = req.body as { email?: string; otp?: string };

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
}


export const Reset_password=async(req:Request,res:Response):Promise<any>=>{
try {
    const { email, newPassword, confirmPassword } = req.body as {
      email?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required", data: null });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match", data: null });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", data: null });
    }

    // Optional: Hash new password (recommended)

    user.password =newPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully", data: null });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error", data: null });
  }
}

export const forget_password=async(req:Request,res:Response):Promise<any>=>{
  const { email } = req.body as { email?: string };
 
  if (!email) {
    return res.status(400).json({ message: "Email is required", data: null });
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found", data: null });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[email] = {
    code: otp,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  try {
    await sendOtpEmail(email, otp);
    return res
      .status(200)
      .json({ message: "OTP sent to your email", data: null });
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return res
      .status(500)
      .json({ message: "Could not send OTP. Try again later.", data: null });
  }
}
