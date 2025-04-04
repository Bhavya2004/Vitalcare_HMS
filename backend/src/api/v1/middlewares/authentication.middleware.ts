import { Request, Response, NextFunction } from "express";
import { routeAccess } from "../routes/index";

//Declaration merging to extend the Request interface
declare module "express-serve-static-core" {
  interface Request {
    role?: string;
  }
}

export const checkAccess = (role: string) => {
  return (req:Request, res: Response, next: NextFunction): void => {
    //extract the requested path
    const path = req.baseUrl + req.path;

    // Extract the user's role from req
    const userRole = req.role;

    //match the route
    const allowedRoles = routeAccess[path];

    if (userRole && allowedRoles.includes(role)) {
    next();
    return;
    }
    
    res.status(403).json({ message: "Access denied" });
  };
};