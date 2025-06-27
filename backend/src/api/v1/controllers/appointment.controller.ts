import { Request, Response } from "express";
import { AppointmentStatus, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { createAppointmentSchema, updateAppointmentSchema } from "../validations/appointment.validation";

const prisma = new PrismaClient();

/**
 * Creates a new appointment for a patient with a doctor.
 */
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: "Unauthorized access" 
      });
      return;
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (!patient) {
      res.status(404).json({ 
        success: false,
        message: "Patient profile not found" 
      });
      return;
    }

    // Validate appointment data
    const validatedData = createAppointmentSchema.parse(req.body);

    // Check if doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: validatedData.doctor_id },
    });

    if (!doctor) {
      res.status(404).json({ 
        success: false,
        message: "Doctor not found" 
      });
      return;
    }

    // Convert string date to Date object for Prisma
    const appointmentDate = new Date(validatedData.appointment_date);

    // Check if doctor is available on the selected date and time
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctor_id: validatedData.doctor_id,
        appointment_date: appointmentDate,
        time: validatedData.time,
        status: {
          notIn: [AppointmentStatus.CANCELLED]
        }
      }
    });

    if (existingAppointment) {
      res.status(409).json({
        success: false,
        message: "This time slot is already booked for the selected doctor"
      });
      return;
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patient_id: patient.id,
        doctor_id: validatedData.doctor_id,
        appointment_date: appointmentDate,
        time: validatedData.time,
        type: validatedData.type,
        note: validatedData.note,
        status: AppointmentStatus.PENDING,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.error("Error creating appointment:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
};

/**
 * Gets all appointments for the logged-in patient.
 */
export const getPatientAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: "Unauthorized access" 
      });
      return;
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (!patient) {
      res.status(404).json({ 
        success: false,
        message: "Patient profile not found" 
      });
      return;
    }

    // Get all appointments for the patient
    const appointments = await prisma.appointment.findMany({
      where: { patient_id: patient.id },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            img: true,
          },
        },
      },
      orderBy: {
        appointment_date: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Gets a specific appointment by ID.
 */
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: "Unauthorized access" 
      });
      return;
    }

    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      res.status(400).json({ 
        success: false,
        message: "Invalid appointment ID" 
      });
      return;
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (!patient) {
      res.status(404).json({ 
        success: false,
        message: "Patient profile not found" 
      });
      return;
    }

    // Get appointment details
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patient_id: patient.id,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
            img: true,
          },
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            gender: true,
            phone: true,
            address: true,
            date_of_birth: true,
          }
        }
      },
    });

    if (!appointment) {
      res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Updates the status of an appointment.
 */
export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ 
        success: false,
        message: "Unauthorized access" 
      });
      return;
    }

    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      res.status(400).json({ 
        success: false,
        message: "Invalid appointment ID" 
      });
      return;
    }

    // Validate update data
    const validatedData = updateAppointmentSchema.parse(req.body);

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (!patient) {
      res.status(404).json({ 
        success: false,
        message: "Patient profile not found" 
      });
      return;
    }

    // Check if appointment exists and belongs to the patient
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        patient_id: patient.id,
      }
    });

    if (!existingAppointment) {
      res.status(404).json({ 
        success: false,
        message: "Appointment not found" 
      });
      return;
    }

    // Check if appointment can be cancelled (only pending appointments can be cancelled)
    if (validatedData.status === AppointmentStatus.CANCELLED && 
        existingAppointment.status !== AppointmentStatus.PENDING) {
      res.status(400).json({
        success: false,
        message: "Only pending appointments can be cancelled"
      });
      return;
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: validatedData.status as AppointmentStatus,
        reason: validatedData.reason,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
          },
        },
      },
    });

    res.status(200).json({ 
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.error("Error updating appointment:", error);
      res.status(500).json({ 
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}; 

/**
 * Gets the count of appointments for the logged-in patient.
 */
export const getAppointmentCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
      return;
    }

    // Get patient details
    const patient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient profile not found"
      });
      return;
    }

    // Get the count of appointments for the patient
    const appointmentCount = await prisma.appointment.count({
      where: { patient_id: patient.id },
    });

    res.status(200).json({
      success: true,
      data: { count: appointmentCount },
    });
  } catch (error) {
    console.error("Error fetching appointment count:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const getDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        img: true
      }
    });

    console.log("Fetched doctors:", doctors);
    res.status(200).json({
      success: true,
      message: "Doctors fetched successfully",
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};