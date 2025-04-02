import express, {Request,Response} from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

// Mock user data
const users : User[] = [
  { id: 1, username: "admin", password: "admin123", role: "admin" },
  { id: 2, username: "doctor", password: "doctor123", role: "doctor" },
  { id: 3, username: "patient", password: "patient123", role: "patient" },
];

// Login route
router.post("/login", (req:Request, res:Response):void => {
  const { username, password }  = req.body as {username : string , password:string};

  // Find the user
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role }, // Payload
    "your-secret-key", // Secret key
    { expiresIn: "1h" } // Token expiration
  );

  res.json({ token });
});

export default router;