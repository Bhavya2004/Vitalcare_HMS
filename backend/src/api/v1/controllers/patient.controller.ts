import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { patientRegistrationSchema } from "../validations/patient.validation";

const prisma = new PrismaClient();

export const registerPatientDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Use body fields from multipart/form-data
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const formData = req.body;

    // Optional: Attach file path to formData
    if (req.file) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      formData.img = `/uploads/${req.file.filename}`;
    }

    console.log("Form data received:", formData);

    // Validate form data (formData.img will still be a string path)
    const validatedData = patientRegistrationSchema.parse(formData);

    console.log("Validated data:", validatedData);

    const existingPatient = await prisma.patient.findUnique({
      where: { user_id: userId },
    });

    if (existingPatient) {
      res.status(400).json({ message: "Patient details already registered" });
      return;
    }

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
        img: patient.img,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
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