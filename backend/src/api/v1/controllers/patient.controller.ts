import { Request, Response } from "express";
import { z } from "zod";
import { registerPatientDetailsService, checkPatientRegistrationService, getPatientDashboardStatsService } from '../services/patient.service';

/**
 * Registers patient details in the system.
 *
 * This function handles the registration of patient details by validating the input data,
 * checking for existing patient records, and creating a new patient record in the database.
 * It also supports file uploads for patient images and validates the input using Zod schemas.
 *
 * @param req - The HTTP request object, which includes the user ID, body fields, and file data.
 * @param res - The HTTP response object used to send the response back to the client.
 * @returns A promise that resolves to void. Sends an appropriate HTTP response to the client.
 *
 * @throws {z.ZodError} If the input validation fails, a 400 response is sent with validation errors.
 * @throws {Error} If an unexpected error occurs, a 500 response is sent with an internal server error message.
 *
 * HTTP Responses:
 * - 201: Patient details registered successfully. Returns the patient details.
 * - 400: Validation failed or patient details already registered.
 * - 401: Unauthorized access if the user ID is missing.
 * - 500: Internal server error for unexpected issues.
 */
export const registerPatientDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const formData = { ...(req.body as Record<string, unknown>) };
    const patient = await registerPatientDetailsService(userId, formData, req.file);
    res.status(201).json({
      message: "Patient details registered successfully",
      patient,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      res.status(400).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  }
};

/**
 * Checks if the patient is already registered or not.
 *
 * @param req - The HTTP request object, which should include the `userId` property.
 * @param res - The HTTP response object used to send the response.
 * @returns A promise that resolves to void. Sends a JSON response indicating whether the patient is registered.
 *
 * @throws {Error} If an unexpected error occurs during the process, a 500 status code is returned with an error message.
 *
 * HTTP Responses:
 * - 401 Unauthorized: If the `userId` is not present in the request.
 * - 200 OK: If the request is successful, returns a JSON object with `isRegistered` set to `true` or `false`.
 */
export const checkPatientRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const isRegistered = await checkPatientRegistrationService(userId);
    res.json({ isRegistered });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Internal server error" });
  }
};

/**
 * Controller for patient dashboard stats
 */
export const getPatientDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.userId || typeof req.userId !== 'string') {
      res.status(401).json({ message: 'Unauthorized: userId missing' });
      return;
    }
    const stats = await getPatientDashboardStatsService(req.userId);
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch patient dashboard stats' });
  }
};