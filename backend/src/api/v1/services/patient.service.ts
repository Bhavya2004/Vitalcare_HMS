import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { patientRegistrationSchema } from "../validations/patient.validation";

type PatientFormData = z.infer<typeof patientRegistrationSchema>;

const prisma = new PrismaClient();

export const registerPatientDetailsService = async (userId: string, formData: Record<string, unknown>, file?: Express.Multer.File) => {
  // Attach file path to formData
  if (file) {
    formData.img = `/uploads/${file.filename}`;
  }
  // Validate form data with Zod
  const validatedData: PatientFormData = patientRegistrationSchema.parse(formData);
  // Check if the patient is already registered
  const existingPatient = await prisma.patient.findUnique({ where: { user_id: userId } });
  if (existingPatient) throw new Error("Patient details already registered");
  // Create patient record in the database
  const patient = await prisma.patient.create({
    data: {
      ...validatedData,
      user_id: userId,
    },
  });
  return {
    id: patient.id,
    first_name: patient.first_name,
    last_name: patient.last_name,
    email: patient.email,
    img: patient.img,
  };
};

export const checkPatientRegistrationService = async (userId: string) => {
  const isRegistered = await prisma.patient.findUnique({ where: { user_id: userId } });
  return Boolean(isRegistered);
};