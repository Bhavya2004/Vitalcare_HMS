import bcrypt from 'bcryptjs';
import {  PrismaClient } from "@prisma/client";
import { DoctorCreateInput } from '../interfaces/doctors/doctor_types';

const prisma = new PrismaClient();

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
  data: any,
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

  return prisma.vitalSigns.create({
    data: {
      medical_id: medicalRecord.id,
      ...data,
    },
  });
}; 