import express from 'express';
import { getDoctorAppointments, updateDoctorAppointmentStatus } from '../controllers/doctor.controller';
import { verifyJWT } from '../middlewares/jwt.middleware';
import { checkAccess } from '../middlewares/authentication.middleware';

const router = express.Router();

// GET /doctor/appointments - Get all appointments for the logged-in doctor
router.get('/appointments', verifyJWT, checkAccess('DOCTOR'), (req, res): void => {
  if (!req.userId) {
    res.status(401).json({ message: 'Unauthorized: No doctor ID found' });
    return;
  }
  req.params.doctorId = req.userId;
  void getDoctorAppointments(req, res);
});

router.put('/appointments/:id/status',verifyJWT,checkAccess('DOCTOR'),updateDoctorAppointmentStatus);

export default router; 