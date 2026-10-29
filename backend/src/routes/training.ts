import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/requireAuth.js";

export const trainingRouter = Router();
trainingRouter.use(requireAuth);

const GENERATED_COURSE_PROMPT = `You are an expert corporate instructional designer. Return only valid JSON with this shape:
{"title":"string","description":"one sentence","materials":"string","passPercent":70,"attemptsPerRound":3,"questions":[{"text":"question","options":["A","B","C","D"],"correctIndex":0}]}
Write useful, practical workplace training in plain English. Materials should contain 6 to 10 clearly labelled modules, each with substantive guidance and practical examples. Create 10 to 20 multiple-choice questions, each with exactly four options and one correctIndex from 0 to 3. Questions must be answerable from the supplied materials. Vary correct answer positions. Do not include markdown fences.`;

function parseGeneratedCourse(raw: string) {
  const clean = raw.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\`\`\`\s*$/, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI did not return a JSON course.");
  const value = JSON.parse(clean.slice(start, end + 1));
  if (typeof value.title !== "string" || !value.title.trim() || typeof value.materials !== "string" || !value.materials.trim()) throw new Error("The generated course was incomplete.");
  if (!Array.isArray(value.questions) || value.questions.length < 1 || value.questions.length > 30) throw new Error("The generated exam was incomplete.");
  const questions = value.questions.map((q: any, index: number) => {
    if (!q || typeof q.text !== "string" || !q.text.trim() || !Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o: unknown) => typeof o !== "string" || !o.trim()) || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
      throw new Error(`Question ${index + 1} was not formatted correctly.`);
    }
    return { id: `question-${index + 1}`, text: q.text.trim(), options: q.options.map((o: string) => o.trim()), correctIndex: q.correctIndex };
  });
  return {
    title: value.title.trim(),
    description: typeof value.description === "string" ? value.description.trim() : "",
    materials: value.materials.trim(),
    passPercent: Number.isInteger(value.passPercent) && value.passPercent >= 1 && value.passPercent <= 100 ? value.passPercent : 70,
    attemptsPerRound: Number.isInteger(value.attemptsPerRound) && value.attemptsPerRound >= 1 && value.attemptsPerRound <= 10 ? value.attemptsPerRound : 3,
    questions,
  };
}

trainingRouter.post("/generate", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = z.object({ topic: z.string().trim().min(3).max(300) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter a training topic between 3 and 300 characters." });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "AI course generation is not configured yet. Add GEMINI_API_KEY to the backend environment, or create a course manually." });

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Create a complete staff training course about: ${parsed.data.topic}` }] }],
        systemInstruction: { parts: [{ text: GENERATED_COURSE_PROMPT }] },
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 12000 },
      }),
    });
    if (!response.ok) {
      console.error("Training generation provider returned status", response.status);
      return res.status(502).json({ error: response.status === 429 || response.status === 503 ? "The AI service is busy. Please try again shortly." : "The AI service could not generate this course. Check the backend API key." });
    }
    const payload = await response.json() as any;
    const text = payload.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("");
    if (!text) return res.status(502).json({ error: "The AI service returned an empty course. Please try again." });
    try {
      return res.json({ course: parseGeneratedCourse(text) });
    } catch (error) {
      console.error("Generated training course failed validation:", error);
      return res.status(502).json({ error: "The AI course was not in the expected format. Please try again or create the course manually." });
    }
  } catch (error) {
    console.error("Training generation request failed:", error);
    return res.status(502).json({ error: "Could not reach the AI service. Please try again later." });
  }
});

trainingRouter.post("/submit", async (req: AuthedRequest, res) => {
  const parsed = z.object({
    trainingId: z.string().min(1).max(200),
    answers: z.record(z.number().int().min(0).max(3)),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Submit one selected option for each exam question." });

  try {
    const record = await db.findForCompany("companyState", req.auth!.companyId, req.auth!.companyId);
    const state = record?.state as Record<string, any> | undefined;
    const training = Array.isArray(state?.trainings) ? state!.trainings.find((item: any) => item.id === parsed.data.trainingId) : null;
    if (!training || !Array.isArray(training.questions) || training.questions.length === 0) {
      return res.status(404).json({ error: "This course does not have a saved exam yet. Ask HR to update the course." });
    }
    let employeeId: string | null = null;
    if (req.auth!.role === "employee") {
      employeeId = req.auth!.employeeId || null;
      if (!employeeId) return res.status(403).json({ error: "Your employee account could not be verified." });
      const employee = await db.findForCompany("employees", employeeId, req.auth!.companyId);
      if (!employee) return res.status(403).json({ error: "Your employee account could not be verified." });
    }
    const questions = training.questions as Array<{ id?: string; text: string; options: string[]; correctIndex: number }>;
    const allowedKeys = new Set(questions.map((question, index) => question.id || String(index)));
    if (Object.keys(parsed.data.answers).some((key) => !allowedKeys.has(key))) return res.status(400).json({ error: "The submitted answers do not match this exam." });
    for (let index = 0; index < questions.length; index++) {
      const key = questions[index].id || String(index);
      if (parsed.data.answers[key] === undefined) return res.status(400).json({ error: "Please answer every question before submitting." });
    }
    const correctCount = questions.reduce((sum, question, index) => sum + (parsed.data.answers[question.id || String(index)] === question.correctIndex ? 1 : 0), 0);
    const percent = Math.round((correctCount / questions.length) * 100);
    const passPercent = Number.isInteger(training.passPercent) ? training.passPercent : 70;
    const passed = percent >= passPercent;
    let certificate: Record<string, any> | null = null;
    if (employeeId) {
      const enrollments = Array.isArray(state!.enrollments) ? [...state!.enrollments] : [];
      let enrollment = enrollments.find((item: any) => item.employeeId === employeeId && item.trainingId === training.id);
      if (!enrollment) {
        enrollment = { id: "enrollment-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), employeeId, trainingId: training.id, progress: 0, completedModules: [], enrolledAt: new Date().toISOString().slice(0, 10), completedAt: null, score: null, certificateId: null, attempts: 0 };
        enrollments.push(enrollment);
      }
      enrollment.attempts = (Number(enrollment.attempts) || 0) + 1;
      enrollment.lastAttemptAt = new Date().toISOString();
      enrollment.lastScore = percent;
      enrollment.score = percent;
      if (passed) {
        const moduleIds = Array.isArray(training.modules) ? training.modules.map((module: any) => module.id).filter(Boolean) : [];
        enrollment.completedModules = [...new Set([...(Array.isArray(enrollment.completedModules) ? enrollment.completedModules : []), ...moduleIds])];
        enrollment.progress = 100;
        enrollment.completedAt = enrollment.completedAt || new Date().toISOString().slice(0, 10);
        const certificates = Array.isArray(state!.certificates) ? [...state!.certificates] : [];
        certificate = certificates.find((item: any) => item.employeeId === employeeId && item.trainingId === training.id) || null;
        if (!certificate) {
          certificate = { id: "certificate-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8), employeeId, trainingId: training.id, issuedAt: new Date().toISOString().slice(0, 10), score: percent };
          certificates.push(certificate);
        } else certificate.score = Math.max(Number(certificate.score) || 0, percent);
        enrollment.certificateId = certificate.id;
        state!.certificates = certificates;
      }
      state!.enrollments = enrollments;
      await db.updateForCompany("companyState", req.auth!.companyId, req.auth!.companyId, { state, updatedAt: new Date().toISOString() });
    }
    return res.json({ result: { score: percent, percent, correctCount, total: questions.length, passed, passPercent, certificate } });
  } catch (error) {
    console.error("Training exam scoring failed:", error);
    return res.status(500).json({ error: "Could not score the exam. Please try again." });
  }
});
