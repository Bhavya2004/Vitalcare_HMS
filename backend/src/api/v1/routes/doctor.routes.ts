import { Router } from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorsForPatients,
  getDoctorAppointments,
  getAppointmentById,
  updateDoctorAppointmentStatus,
  addVitalSigns,
  getDiagnosisForAppointment,
  addDiagnosisForAppointment,
  getBillsForAppointment,
  addBillToAppointment,
  deleteBillFromAppointment,
  generateFinalBillForAppointment,
  getAllServices
} from '../controllers/doctor.controller';
import { verifyJWT } from '../middlewares/jwt.middleware';
import { checkAccess } from '../middlewares/authentication.middleware';

// A single router to handle all doctor-related routes
const router = Router();

// --- Routes for Admins ---
// Path: /admin/doctors
router.post('/admin/doctors', verifyJWT, checkAccess('ADMIN'), createDoctor);
router.get('/admin/doctors', verifyJWT, checkAccess('ADMIN'), getAllDoctors);

// --- Routes for Patients ---
// Path: /patient/doctors
router.get('/patient/doctors', getDoctorsForPatients);

// --- Routes for Doctors ---
// Path: /doctor/...
router.get('/doctor/appointments', verifyJWT, checkAccess('DOCTOR'), getDoctorAppointments);
router.get('/doctor/appointments/:id', verifyJWT, checkAccess('DOCTOR'), getAppointmentById);
router.put('/doctor/appointments/:id/status', verifyJWT, checkAccess('DOCTOR'), updateDoctorAppointmentStatus);
router.post('/doctor/appointments/:id/vitals', verifyJWT, checkAccess('DOCTOR'), addVitalSigns);
router.get('/doctor/appointments/:id/diagnosis', verifyJWT, checkAccess('DOCTOR'), getDiagnosisForAppointment);
router.post('/doctor/appointments/:id/diagnosis', verifyJWT, checkAccess('DOCTOR'), addDiagnosisForAppointment);

// --- Billing Endpoints for Doctors ---
router.get('/doctor/appointments/:id/bills', verifyJWT, checkAccess('DOCTOR'), getBillsForAppointment);
router.post('/doctor/appointments/:id/bills', verifyJWT, checkAccess('DOCTOR'), addBillToAppointment);
router.delete('/doctor/appointments/:id/bills/:billId', verifyJWT, checkAccess('DOCTOR'), deleteBillFromAppointment);
router.post('/doctor/appointments/:id/generate-bill', verifyJWT, checkAccess('DOCTOR'), generateFinalBillForAppointment);
router.get('/doctor/services', verifyJWT, checkAccess('DOCTOR'), getAllServices);

export default router; 