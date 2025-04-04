import { Request, Response } from "express";
import jwt from "jsonwebtoken";

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

// Mock user data
const users: User[] = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "doctor", password: "doctor123", role: "doctor" },
  { id: 3, username: "patient", password: "patient123", role: "patient" },
];

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body as { username: string; password: string };

  // Find the user
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
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
};