import { Request, Response } from 'express';
import { createDoctorService, getAllDoctorsService, getDoctorAppointmentsService, getDoctorsForPatientsService } from '../services/doctor.service';
import { createDoctorSchema } from '../validations/doctor.validation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const data = createDoctorSchema.parse(req.body);
    const doctor = await createDoctorService(data);
    res.status(201).json(doctor);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Unknown error' });
    }
  }
};

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await getAllDoctorsService();
    res.json(doctors);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
};

export const getDoctorAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { user_id: req.userId },
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }
    const appointments = await getDoctorAppointmentsService(doctor.id);
    res.status(200).json({ success: true, data: appointments });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
};

export const getDoctorsForPatients = async (req: Request, res: Response) => {
  try {
    const doctors = await getDoctorsForPatientsService();
    res.json(doctors);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Unknown error' });
    }
  }
}; 

export const updateDoctorAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const doctor = await prisma.doctor.findFirst({ where: { user_id: userId } });
    if (!doctor) {
      res.status(403).json({ message: "Access denied: You don't have permission to access this !" });
      return;
    }

    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      res.status(400).json({ message: "Invalid appointment ID" });
      return;
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, doctor_id: doctor.id }
    });
    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    const { status, reason } = req.body;
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status, reason }
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};