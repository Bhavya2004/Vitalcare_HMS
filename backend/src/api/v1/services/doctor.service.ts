import bcrypt from 'bcryptjs';
import {  PrismaClient } from "@prisma/client";

export interface WorkingDayInput {
  day: string;
  start_time: string;
  close_time: string;
}

export interface DoctorCreateInput {
  email: string;
  password: string;
  name: string;
  specialization: string;
  department: string;
  license_number: string;
  phone: string;
  address: string;
  type: 'FULL' | 'PART';
  working_days: WorkingDayInput[];
  user_id?: string;
}

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