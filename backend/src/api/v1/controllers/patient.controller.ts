import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for patient registration
const patientRegistrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().transform((str) => new Date(str)),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email format"),
  marital_status: z.string().min(1, "Marital status is required"),
  address: z.string().min(1, "Address is required"),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_number: z.string().min(10, "Emergency contact number must be at least 10 digits"),
  relation: z.string().min(1, "Relation is required"),
  blood_group: z.string().optional(),
  allergies: z.string().optional(),
  medical_conditions: z.string().optional(),
  medical_history: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_number: z.string().optional(),
  privacy_consent: z.boolean(),
  service_consent: z.boolean(),
  medical_consent: z.boolean(),
  img: z.string().optional(),
  colorCode: z.string().optional(),
});

export const registerPatientDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the user ID from the JWT token (added by the auth middleware)
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate the request body
    const validatedData = patientRegistrationSchema.parse(req.body);

    // Check if patient record already exists
    const existingPatient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (existingPatient) {
      res.status(400).json({ message: "Patient details already registered" });
      return;
    }

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        ...validatedData,
        user_id: userId,
      },
    });

    res.status(201).json({
      message: "Patient details registered successfully",
      patient: {
        id: patient.id,
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.error("Error during patient registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}; 

export const checkPatientRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if the patient is already registered
    const isRegistered = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

   if (isRegistered) {
      res.json({ isRegistered:true });
   } else {
      res.json({ isRegistered:false });
   }
  } catch (error) {
    console.error("Error checking patient registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}