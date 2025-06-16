import express from "express";
import { verifyJWT } from "../../middlewares/jwt.middleware";
import { checkAccess } from "../../middlewares/authentication.middleware";
import {
  createAppointment,
  getPatientAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getDoctors,
  getAppointmentCount,
} from "../../controllers/appointment.controller";

const router = express.Router();

// Create a new appointment
router.post("/", verifyJWT, checkAccess("PATIENT"), createAppointment);

// Get all appointments for the logged-in patient
router.get("/", verifyJWT, checkAccess("PATIENT"), getPatientAppointments);

// Get the count of appointments for the logged-in patient
router.get("/count", verifyJWT, checkAccess("PATIENT"), getAppointmentCount);

// Get all doctors
router.get("/doctors", verifyJWT, checkAccess("PATIENT"), getDoctors);

// Get a specific appointment by ID
router.get("/:id", verifyJWT, checkAccess("PATIENT"), getAppointmentById);

// Update appointment status
router.patch("/:id/status", verifyJWT, checkAccess("PATIENT"), updateAppointmentStatus);


export default router; 