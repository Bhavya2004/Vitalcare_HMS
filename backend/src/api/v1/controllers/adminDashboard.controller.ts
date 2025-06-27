import { Request, Response } from "express";

export const getAdminDashboard = (req: Request, res: Response): void => {
  res.send("Welcome to the Admin Dashboard!");
};