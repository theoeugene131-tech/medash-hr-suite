import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/requireAuth.js";

export const companyStateRouter = Router();
companyStateRouter.use(requireAuth);

const STATE_FIELDS = [
  "companyName", "countryCode", "currency", "locale", "timezone",
  "compliance", "reviews", "candidates", "trainings", "enrollments",
  "certificates", "leaves", "attendance", "orgUnits",
] as const;

function pickCompanyState(input: Record<string, unknown>) {
  const picked: Record<string, unknown> = {};
  for (const key of STATE_FIELDS) if (key in input) picked[key] = input[key];
  return picked;
}

companyStateRouter.get("/", async (req: AuthedRequest, res) => {
  const record = await db.find("companyState", req.auth!.companyId);
  if (!record?.state) return res.json({ state: null });
  const state = record.state as Record<string, any>;
  if (req.auth!.role !== "employee") return res.json({ state });

  const employeeId = req.auth!.employeeId;
  return res.json({
    state: {
      trainings: Array.isArray(state.trainings) ? state.trainings : [],
      leaves: (state.leaves || []).filter((item: any) => item.employeeId === employeeId),
      attendance: (state.attendance || []).filter((item: any) => item.employeeId === employeeId),
      enrollments: (state.enrollments || []).filter((item: any) => item.employeeId === employeeId),
      certificates: (state.certificates || []).filter((item: any) => item.employeeId === employeeId),
      companyName: state.companyName || "",
      countryCode: state.countryCode || "NG",
      currency: state.currency || "NGN",
      locale: state.locale || "en-NG",
      timezone: state.timezone || "Africa/Lagos",
      reviews: [],
      candidates: [],
      compliance: {},
      orgUnits: [],
    },
  });
});

companyStateRouter.put("/", async (req: AuthedRequest, res) => {
  const parsed = z.object({ state: z.record(z.unknown()) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid company state payload." });

  const companyId = req.auth!.companyId;
  const current = await db.find("companyState", companyId);
  const incoming = pickCompanyState(parsed.data.state);

  let nextState: Record<string, any>;
  if (req.auth!.role === "employee") {
    const employeeId = req.auth!.employeeId;
    const existingState = (current?.state || {}) as Record<string, any>;
    nextState = { ...existingState };
    for (const field of ["leaves", "attendance", "enrollments", "certificates"] as const) {
      const oldRows = Array.isArray(existingState[field]) ? existingState[field] : [];
      const incomingRows = Array.isArray(incoming[field]) ? incoming[field] as any[] : [];
      const otherEmployees = oldRows.filter((item: any) => item.employeeId !== employeeId);
      const ownRows = incomingRows.filter((item: any) => item.employeeId === employeeId);
      nextState[field] = [...otherEmployees, ...ownRows];
    }
  } else {
    nextState = { ...(current?.state || {}), ...incoming };
  }

  const row = { id: companyId, companyId, state: nextState, updatedAt: new Date().toISOString() };
  if (current) await db.update("companyState", companyId, row);
  else await db.insert("companyState", row);
  return res.json({ ok: true, updatedAt: row.updatedAt });
});
