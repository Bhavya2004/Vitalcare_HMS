import express from 'express';
import { getDoctorsForPatients } from '../../controllers/doctor.controller';

const router = express.Router();

router.get('/', getDoctorsForPatients);

export default router; 