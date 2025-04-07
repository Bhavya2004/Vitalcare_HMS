import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "../validations/authentication.validation";
import { z } from "zod";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response): Promise<void> => {
  
  try{
    const { email, password } = loginSchema.parse(req.body);
    const user=await prisma.user.findUnique({
        where:{email},
    });

    // Check if the user exists and the password matches
    if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }
  
    if (!process.env.JWT_SECRET) {
        res.status(500).json({ message: "Secret key for JWT is not defined in the environment variables" });
        return;
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, role: user.role }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "1h" } // Token expiration
    );

    res.json({ token });
}
catch(error){
  if (error instanceof z.ZodError) {
    res.status(400).json({ 
      message: "Invalid input", 
      errors: error.errors 
    });
  }
  else{
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
};

type RegisterRequestBody = {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  };

  export const register = async (req: Request<object, object, RegisterRequestBody>, res: Response): Promise<void> => {
    
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }
  
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        res.status(409).json({ message: "Email already exists" });
        return;
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
  
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: "PATIENT",
          status: "ACTIVE",
        },
        select:{
          id:true,
          email:true,
          role:true,
        }
      });
  
      res.status(201).json({
        message: "User registered successfully",
        user: newUser
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      } else {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };