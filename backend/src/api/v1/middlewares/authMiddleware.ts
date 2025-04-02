import { Request, Response, NextFunction } from "express";
import { routeAccess } from "../routes/index";

export const checkAccess = (role: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    //extract the requested path
    const path = req.baseUrl + req.path;
    console.log("Requested Path:", path);
    console.log("User Role:", role);

    //match the route
    const allowedRoles = routeAccess[path];
    // const allowedRoles = Object.keys(routeAccess).find((route) =>
    //   new RegExp(`^${route}$`).test(path)
    // );

    console.log("Matched Route:", allowedRoles);
    console.log("Allowed Roles for Route:", allowedRoles);

    if (allowedRoles.includes(role)) {
      console.log("Access Granted");
      next();
      return;
    }
    
    // if (allowedRoles && routeAccess[allowedRoles].includes(role)) {
    //   console.log("Access Granted");
    //   next(); 
    //   return;
    // }

    console.log("Access Denied");
    res.status(403).json({ message: "Access denied" });
  };
};