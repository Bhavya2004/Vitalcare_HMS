import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key") as { role: string };
    console.log("Decoded Token:", decoded);
    // req.body.role = decoded.role;
    (req.body as {role:string}).role = decoded.role; // Attach the role to the request object
    next(); 
  
  } catch (err) {
    console.error("JWT Verification Error:", err);
    res.status(403).json({ message: "Invalid token" });
  }
};