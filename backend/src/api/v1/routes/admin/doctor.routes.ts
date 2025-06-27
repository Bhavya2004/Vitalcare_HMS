import express from 'express';
import { createDoctor, getAllDoctors } from '../../controllers/doctor.controller';
import { verifyJWT } from '../../middlewares/jwt.middleware';
import { checkAccess } from '../../middlewares/authentication.middleware';

const router = express.Router();

router.post('/', verifyJWT, (req, res, next) => { checkAccess('ADMIN')(req, res, next); }, createDoctor);
router.get('/', verifyJWT, (req, res, next) => { checkAccess('ADMIN')(req, res, next); }, getAllDoctors);

export default router; 