import { Request, Response } from 'express';
import userModel from '../models/userModel';
import jwt from "jsonwebtoken";
export const registerUser = async (req: Request, res: Response):Promise<any> => {
 try {
    console.log(req.body);
    const { name, email, password, confirmPassword, MobileNumber } = req.body;
console.log(confirmPassword,password,email,name,MobileNumber)
    // Check if all fields are provided
    if (!name || !email || !password || !confirmPassword || !MobileNumber) {
      return res.status(400).send({ message: 'All fields are required', data: null });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).send({ message: 'Passwords do not match', data: null });
    }

    // Check if user already exists
    const findUser = await userModel.findOne({ email });
    if (findUser) {
      return res.status(409).send({ message: 'User already exists', data: null });
    }

    // Create new user
    const newUser = await userModel.create({ name, email, password, MobileNumber });
    return res.status(200).send({ message: "User registered successfully", data: newUser });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).send({ message: 'Internal Server Error', data: null });
  }
};

export const loginUser=async(req:Request,res:Response):Promise<any>=>{
 try {
    const { email, password } = req.body;
    console.log(req.body)
    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required', data: null });
    }

    const userFound = await userModel.findOne({ email }).select('+password');
    if (!userFound) {
      return res.status(404).send({ message: 'User not found', data: null });
    }

    if (userFound.password !== password) {
      return res.status(401).send({ message: 'Invalid password', data: null });
    }

    const token = jwt.sign(
      { email: userFound.email, id: userFound._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',   // true on Render
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // lowercase!
      maxAge: 24 * 60 * 60 * 1000,  // 1 day
    });
    

    return res.status(200).send({
      message: 'Login successful',
      data: {
        id: userFound._id,
        name: userFound.name,
        email: userFound.email,
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).send({ message: 'Internal Server Error', data: null });
  }
}

