import { Request, Response, NextFunction } from "express";
import { routeAccess } from "../routes/index";

/**
 * Declaration merging : Extends the Express `Request` interface to include custom properties.
 * 
 * @module express-serve-static-core
 * 
 * @property {string | undefined} role - Represents the role of the authenticated user. 
 * 
 * @property {string | undefined} userId - Represents the unique identifier of the authenticated user. 
 */
declare module "express-serve-static-core" {
  interface Request {
    role?: string;
    userId?: string;
  }
}

/**
 * Middleware to check access permissions for a specific role on a given route.
 *
 * @param role - The role to check access for.
 * @returns A middleware function that verifies if the user's role has access to the requested route.
 *
 */
export const checkAccess = (role: string) => {
  return (req:Request, res: Response, next: NextFunction): void => {
    // Extract the requested path from the `req` object.
    const path = req.baseUrl + req.path;

    // Extract the user's role from 'req' object
    const userRole = req.role;

    // Match the requested route against the `routeAccess` configuration to determine allowed roles.
    const allowedRoles = routeAccess[path];

    // If the user's role matches the allowed roles for the route, the request proceeds to the next middleware.
    if (userRole && allowedRoles.includes(role)) {
    next();
    return;
    }
    
    // If the user's role does not match, a 403 Forbidden response is sent with an "Access denied" message.
    res.status(403).json({ message: "Access denied" });
  };
};