import bcrypt from 'bcryptjs';
import { PrismaClient, AppointmentStatus } from "@prisma/client";
import { DoctorCreateInput } from '../interfaces/doctors/doctor_types';
import { z } from 'zod';
import { vitalSignsSchema, diagnosisSchema } from '../validations/doctor.validation';

const prisma = new PrismaClient();
type VitalSignsInput = z.infer<typeof vitalSignsSchema>;
type DiagnosisInput = z.infer<typeof diagnosisSchema>;

export const createDoctorService = async (data: DoctorCreateInput) => {
  const { email, password, name, specialization, department, license_number, phone, address, type, working_days } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  // Create user with DOCTOR role
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'DOCTOR',
      status: 'ACTIVE',
      firstName: name,
    },
  });
  // Create doctor
  const doctor = await prisma.doctor.create({
    data: {
      user_id: user.id,
      email,
      name,
      specialization,
      department,
      license_number,
      phone,
      address,
      type,
      working_days: {
        create: working_days.map((wd) => ({
          day: wd.day,
          start_time: wd.start_time,
          close_time: wd.close_time,
        })),
      },
    },
    include: { working_days: true },
  });
  return doctor;
};

export const getAllDoctorsService = async () => {
  return prisma.doctor.findMany({ include: { working_days: true } });
};

export const getDoctorAppointmentsService = async (doctorId: string) => {
  return prisma.appointment.findMany({
    where: { doctor_id: doctorId },
    include: { patient: true },
  });
};

export const getDoctorsForPatientsService = async () => {
  return prisma.doctor.findMany({
    select: {
      id: true,
      name: true,
      specialization: true,
      department: true,
      license_number: true,
      phone: true,
      email: true,
      working_days: true,
    },
  });
};

export const getAppointmentByIdService = async (appointmentId: number) => {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: true,
      medical: {
        include: {
          vital_signs: true,
        },
      },
    },
  });
};

export const addVitalSignsService = async (
  appointmentId: number,
  data: VitalSignsInput,
) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { patient_id: true, doctor_id: true },
  });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  let medicalRecord = await prisma.medicalRecords.findUnique({
    where: { appointment_id: appointmentId },
  });

  if (!medicalRecord) {
    medicalRecord = await prisma.medicalRecords.create({
      data: {
        appointment_id: appointmentId,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
      },
    });
  }

  const { temperature, blood_pressure, heart_rate, weight, height, respiratory_rate, oxygen_saturation } = data;
  const [systolic, diastolic] = blood_pressure.split('/').map(Number);

  return prisma.vitalSigns.create({
    data: {
      medical_id: medicalRecord.id,
      body_temperature: temperature,
      systolic,
      diastolic,
      heart_rate: String(heart_rate),
      weight,
      height,
      ...(respiratory_rate !== undefined ? { respiratory_rate } : {}),
      ...(oxygen_saturation !== undefined ? { oxygen_saturation } : {}),
    },
  });
};

export const getDiagnosisForAppointmentService = async (appointmentId: number) => {
  // Find the medical record for this appointment
  const medicalRecord = await prisma.medicalRecords.findUnique({
    where: { appointment_id: appointmentId },
    include: { diagnosis: { include: { doctor: true } } },
  });
  if (!medicalRecord) {
    return [];
  }
  return medicalRecord.diagnosis;
};

export const addDiagnosisForAppointmentService = async (
  appointmentId: number,
  doctorId: string,
  patientId: string,
  data: DiagnosisInput
) => {
  // Find or create the medical record for this appointment
  let medicalRecord = await prisma.medicalRecords.findUnique({
    where: { appointment_id: appointmentId },
  });
  if (!medicalRecord) {
    medicalRecord = await prisma.medicalRecords.create({
      data: {
        appointment_id: appointmentId,
        patient_id: patientId,
        doctor_id: doctorId,
      },
    });
  }
  // Create the diagnosis
  return prisma.diagnosis.create({
    data: {
      ...data,
      medical_id: medicalRecord.id,
      doctor_id: doctorId,
      patient_id: patientId,
    },
  });
};

export const getDoctorByUserId = async (userId: string) => {
  return prisma.doctor.findUnique({ where: { user_id: userId } });
};

export const getDoctorAppointmentsByUserId = async (userId: string) => {
  const doctor = await getDoctorByUserId(userId);
  if (!doctor) return null;
  return getDoctorAppointmentsService(doctor.id);
};

export const updateDoctorAppointmentStatus = async (userId: string, appointmentId: number, status: string, reason?: string) => {
  // Validate status is a valid AppointmentStatus
  if (!Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    return { error: 'Invalid status value' };
  }
  const doctor = await prisma.doctor.findFirst({ where: { user_id: userId } });
  if (!doctor) return { error: 'Doctor not found' };
  const appointment = await prisma.appointment.findFirst({ where: { id: appointmentId, doctor_id: doctor.id } });
  if (!appointment) return { error: 'Appointment not found' };
  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status as AppointmentStatus, reason }
  });
  return { updated };
};

export const addDiagnosisForAppointmentFull = async (
  userId: string,
  appointmentId: number,
  diagnosisData: DiagnosisInput
) => {
  // Lookup doctor by user_id
  const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
  if (!doctor) return { error: 'Doctor profile not found' };
  const doctorId = doctor.id;
  // Find patientId from appointment
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return { error: 'Appointment not found' };
  const patientId = appointment.patient_id;
  const newDiagnosis = await addDiagnosisForAppointmentService(
    appointmentId,
    doctorId,
    patientId,
    diagnosisData
  );
  return { newDiagnosis };
};