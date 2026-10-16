import { Router } from "express";
import { nanoid } from "nanoid";
import { db } from "../lib/db.js";
import { estimateDeductions } from "../lib/tax.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/requireAuth.js";

export const payrollRouter = Router();
payrollRouter.use(requireAuth);

payrollRouter.get("/", async (req: AuthedRequest, res) => {
  const runs = await db.table("payrollRuns", req.auth!.companyId);
  if (req.auth!.role === "employee") {
    const own = runs.map((run: any) => ({
      period: run.period,
      createdAt: run.createdAt,
      line: (run.lines || []).find((line: any) => line.employeeId === req.auth!.employeeId)
    })).filter((row: any) => row.line);
    return res.json(own);
  }
  return res.json(runs);
});

payrollRouter.post("/run", requireAdmin, async (req: AuthedRequest, res) => {
  const company = await db.find("companies", req.auth!.companyId);
  const countryCode = company?.countryCode || "NG";
  if (countryCode !== "NG") {
    return res.status(400).json({ error: countryCode === "GB" ? "UK payroll is not available yet. UK tax, National Insurance, pension and payslip rules must be implemented and tested first." : "US payroll is not available yet. Federal/state tax, Social Security, Medicare and payslip rules must be implemented and tested first." });
  }
  const employees = (await db.table("employees", req.auth!.companyId)).filter((employee: any) => employee.active);
  if (!employees.length) return res.status(400).json({ error: "No active employees to include." });
  const runs = await db.table("payrollRuns", req.auth!.companyId);
  const last = runs.length ? String(runs[runs.length - 1].period || "") : "";
  const now = new Date();
  let period = last;
  if (!period) period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  else {
    const [year, month] = period.split("-").map(Number);
    const next = new Date(year, month, 1);
    period = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  }
  const lines = employees.map((employee: any) => ({
    employeeId: employee.id, name: employee.name, role: employee.role,
    gross: employee.gross, ...estimateDeductions(Number(employee.gross || 0))
  }));
  const run = {
    id: nanoid(), companyId: req.auth!.companyId, period,
    createdAt: new Date().toISOString(), lines, status: "prepared"
  };
  await db.insert("payrollRuns", run);
  return res.status(201).json(run);
});
