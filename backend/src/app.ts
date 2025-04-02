//This file will load middleware, routes, error handling.
import express from "express";
import adminRoutes from "./api/v1/routes/adminRoutes";
import authRoutes from "./api/v1/routes/authRoutes";

const app = express();

app.use(express.json());

app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);

export default app;