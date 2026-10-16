import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { employeesRouter } from "./routes/employees.js";
import { payrollRouter } from "./routes/payroll.js";
import { companyRouter } from "./routes/company.js";
import { adminRouter } from "./routes/admin.js";
import { companyStateRouter } from "./routes/companyState.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "medash-hr-suite-backend" }));
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "medash-hr-suite-backend" }));

app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/payroll", payrollRouter);
app.use("/api/company/state", companyStateRouter);
app.use("/api/company", companyRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));
