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

function validPeriod(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}
function nonNegative(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000_000 ? Math.round(n * 100) / 100 : null;
}

// Manual payroll is available in every supported region. These are user-entered
// figures, not country-specific tax calculations or statutory advice.
payrollRouter.post("/manual", requireAdmin, async (req: AuthedRequest, res) => {
  const { period, lines } = req.body || {};
  if (!validPeriod(period)) return res.status(400).json({ error: "Enter a valid payroll period in YYYY-MM format." });
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 1000) {
    return res.status(400).json({ error: "Provide between 1 and 1,000 payroll lines." });
  }
  const companyId = req.auth!.companyId;
  const employees = await db.table("employees", companyId);
  const byId = new Map(employees.map((e: any) => [String(e.id), e]));
  const seen = new Set<string>();
  const cleanLines: any[] = [];
  for (const item of lines) {
    const employeeId = String(item?.employeeId || "");
    const employee = byId.get(employeeId);
    if (!employee || employee.active === false) {
      return res.status(400).json({ error: "Every payroll line must refer to an active employee in your company." });
    }
    if (seen.has(employeeId)) return res.status(400).json({ error: "An employee can appear only once in a payroll run." });
    seen.add(employeeId);
    const gross = nonNegative(item.gross);
    const monthlyPAYE = nonNegative(item.monthlyPAYE);
    const pensionEmployee = nonNegative(item.pensionEmployee);
    const pensionEmployer = nonNegative(item.pensionEmployer);
    const nhf = nonNegative(item.nhf);
    const nsitf = nonNegative(item.nsitf);
    const otherDeductions = nonNegative(item.otherDeductions);
    const netProvided = item.net === "" || item.net === null || item.net === undefined ? null : nonNegative(item.net);
    if ([gross, monthlyPAYE, pensionEmployee, pensionEmployer, nhf, nsitf, otherDeductions].some(v => v === null) || (netProvided === null && item.net !== "" && item.net !== undefined && item.net !== null)) {
      return res.status(400).json({ error: "Payroll amounts must be valid non-negative numbers." });
    }
    const deductions = Number(monthlyPAYE) + Number(pensionEmployee) + Number(nhf) + Number(otherDeductions);
    const net = netProvided === null ? Math.max(0, Number(gross) - deductions) : netProvided;
    cleanLines.push({
      employeeId, name: employee.name, role: employee.role,
      gross, monthlyPAYE, pensionEmployee, pensionEmployer, nhf, nsitf,
      otherDeductions, net, bank: employee.bank || "", account: employee.account || "",
      notes: typeof item.notes === "string" ? item.notes.slice(0, 1000) : ""
    });
  }
  const runs = await db.table("payrollRuns", companyId);
  if (runs.some((run: any) => run.period === period)) {
    return res.status(409).json({ error: "A payroll run already exists for this period. Open History and use a different period or review the existing run." });
  }
  const run = {
    id: nanoid(), companyId, period, createdAt: new Date().toISOString(),
    createdBy: req.auth!.userId, method: "manual", status: "draft", approvedAt: null,
    lines: cleanLines
  };
  await db.insert("payrollRuns", run);
  return res.status(201).json(run);
});

payrollRouter.post("/run", requireAdmin, async (req: AuthedRequest, res) => {
  const company = await db.find("companies", req.auth!.companyId);
  const countryCode = company?.countryCode || "NG";
  if (countryCode !== "NG") {
    return res.status(400).json({ error: countryCode === "GB" ? "Automated UK payroll calculations are not available yet. Use Manual payroll entry with figures verified for UK rules." : "Automated US payroll calculations are not available yet. Use Manual payroll entry with figures verified for federal and applicable state/local rules." });
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
  if (runs.some((run: any) => run.period === period)) {
    return res.status(409).json({ error: "A payroll run already exists for this period. Review History before creating another run." });
  }
  const lines = employees.map((employee: any) => ({
    employeeId: employee.id, name: employee.name, role: employee.role,
    gross: Number(employee.gross || 0), ...estimateDeductions(Number(employee.gross || 0))
  }));
  const run = {
    id: nanoid(), companyId: req.auth!.companyId, period,
    createdAt: new Date().toISOString(), lines, method: "automatic-estimate", status: "prepared"
  };
  await db.insert("payrollRuns", run);
  return res.status(201).json(run);
});
