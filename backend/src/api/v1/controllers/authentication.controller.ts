import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loginSchema, registerSchema } from "../validations/authentication.validation";
import { z } from "zod";
import { RegisterRequestBody } from "../interfaces/types/types";

const prisma = new PrismaClient();

/**
 * Handles user login by validating credentials, generating a JWT token, and returning it to the client.
 *
 * @param req - The HTTP request object containing the user's login credentials in the body.
 * @param res - The HTTP response object used to send the response back to the client.
 * @returns A Promise that resolves to void.
 *
 * @throws {z.ZodError} If the input validation fails.
 * @throws {Error} If an internal server error occurs.
 *
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  
  try{
    // Parse and validate the request body using `loginSchema`.
    const { email, password } = loginSchema.parse(req.body);

    // Check if a user with the provided email exists in the database.
    const user=await prisma.user.findUnique({
        where:{email},
        include:{patient:true}
    });

    // Verify the provided password against the stored hashed password.
    if (!user || !bcrypt.compareSync(password, user.password)) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }
  
    // Ensure that the JWT secret key is defined in the environment variables.
    if (!process.env.JWT_SECRET) {
        res.status(500).json({ message: "Secret key for JWT is not defined in the environment variables" });
        return;
    }

    // Generate a JWT token with the user's ID and role as the payload.
    const token = jwt.sign(
        { 
          id: user.id,
          role: user.role,
          firstName: user.patient?.first_name,
          lastName: user.patient?.last_name,
          gender: user.patient?.gender
        }, // Payload
        process.env.JWT_SECRET, // Secret key
        { expiresIn: "1h" } // Token expiration
    );

    // Return the generated token in the response.
    res.json({ 
      token,
      user:{
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.patient?.first_name,
        lastName: user.patient?.last_name,
        gender:user.patient?.gender
      } });
}
catch(error){
  // Handle validation errors and internal server errors
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

/**
 * Handles user registration by validating the request body, checking for existing users,
 * hashing the password, and creating a new user in the database.
 *
 * @param req - The HTTP request object containing the registration details in the body.
 * @param res - The HTTP response object used to send the response back to the client.
 * 
 * @throws {z.ZodError} If the request body validation fails.
 * @throws {Error} If an unexpected error occurs during the registration process.
 *
 * @remarks
 * - The function uses `registerSchema` to validate the request body.
 * - If the email already exists in the database, a 409 Conflict response is sent.
 * - Passwords are hashed using bcrypt before storing them in the database.
 * - The created user is returned with selected fields: `id`, `email`, and `role`.
 *
 * @returns A JSON response with a success message and the newly created user details
 * if the registration is successful.
 *
 */
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