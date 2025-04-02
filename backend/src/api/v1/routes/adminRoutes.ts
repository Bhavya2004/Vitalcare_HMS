import express, { NextFunction, Request, Response } from "express";
import { checkAccess } from "../middlewares/authMiddleware";
import { verifyJWT } from "../middlewares/jwtMiddleware";

const router = express.Router();

router.get("/dashboard", verifyJWT, (req:Request, res:Response,next:NextFunction) => {
  // const userRole = req.body.role;
  const userRole  = (req.body as { role: string }).role;
  checkAccess(userRole)(req,res,next);
},(req,res)=>{
    res.send("Admin Dashboard");
}
);
export default router;