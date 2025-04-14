import express, { NextFunction, Request, Response } from "express";
import { checkPatientRegistration, registerPatientDetails } from "../controllers/patient.controller";
import { verifyJWT } from "../middlewares/jwt.middleware";
import { checkAccess } from "../middlewares/authentication.middleware";

const router = express.Router();

// Register patient details - protected route, only accessible by authenticated patients
router.post("/register",verifyJWT,(req:Request, res:Response, next:NextFunction) => 
  {
    const userRole = req.role;
    if (!userRole) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
    checkAccess(userRole)(req, res, next);
  },
  registerPatientDetails
);

router.get("/check-registration",verifyJWT,checkPatientRegistration);

export default router; 