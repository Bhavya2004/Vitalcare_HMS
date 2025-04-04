import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if(typeof decoded === "object" && "role" in decoded){
      req.role = (decoded as { role: string }).role;
      req.userId = (decoded as { id: string }).id;
      next(); 
    }
    else{
      res.status(403).json({ message: "Invalid token" });
      return;
    }
  
  } catch (err) {
    console.error("JWT Verification Error:", err);
    res.status(403).json({ message: "Invalid token" });
  }
};