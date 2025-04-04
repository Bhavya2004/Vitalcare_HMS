import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body as { username: string; password: string };

  try{
    const user=await prisma.user.findUnique({
        where:{username},
    });

    if(!user || user.password !== password){
        res.status(401).json({ message: "Invalid username or password" });
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
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
}
};