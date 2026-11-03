import { Router } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "../lib/db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/requireAuth.js";

export const trainingRouter = Router();

export const publicTrainingRouter = Router();

function cleanAccessCode(value: unknown) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
}

async function companySubscriptionAllowsTraining(companyId: string) {
  const company = await db.find("companies", companyId);
  if (!company) return false;
  const status = company.subscriptionStatus || "legacy";
  const now = Date.now();
  if (status === "active") {
    const end = company.subscriptionEndsAt ? new Date(company.subscriptionEndsAt).getTime() : null;
    return end === null || end > now;
  }
  if (status === "trial" || status === "trialing") {
    const storedEnd = company.trialEndsAt ? new Date(company.trialEndsAt).getTime() : null;
    const started = company.trialStartedAt ? new Date(company.trialStartedAt).getTime() : null;
    const sevenDayEnd = started !== null ? started + 7 * 24 * 60 * 60 * 1000 : null;
    const end = storedEnd !== null && sevenDayEnd !== null ? Math.min(storedEnd, sevenDayEnd) : (sevenDayEnd ?? storedEnd);
    return end !== null && end > now;
  }
  return status === "legacy";
}

function subscriptionRequired(res: any) {
  return res.status(402).json({ error: "This company's Medash trial has ended or its subscription is not active. Ask the company administrator to renew access.", subscriptionRequired: true });
}

function getCourseLessons(course: any) {
  const source = Array.isArray(course?.modules) ? course.modules.filter((module: any) => module.type !== "quiz") : [];
  const candidates = source.length ? source : (typeof course?.materials === "string" ? [{ id: "materials", title: "Study material", content: course.materials, duration: "Self-paced" }] : []);
  const lessons: any[] = [];
  for (const module of candidates) {
    const content = String(module.content || "");
    const parts = content.split(/(?=MODULE\s+\d+\s*[—-])/i).map((part: string) => part.trim()).filter(Boolean);
    const shouldSplit = parts.length > 1 || (candidates.length === 1 && parts.length === 1 && /^MODULE\s+\d+\s*[—-]/i.test(parts[0]));
    const chunks = shouldSplit ? parts : [content];
    chunks.forEach((part: string, index: number) => {
      const firstLine = part.split("\n")[0] || "";
      const title = shouldSplit ? firstLine.replace(/^MODULE\s+\d+\s*[—-]?\s*/i, "").trim() : (module.title || `Lesson ${lessons.length + 1}`);
      lessons.push({
        id: shouldSplit ? `${module.id || "lesson"}-${index + 1}` : (module.id || String(lessons.length)),
        title: title || `Lesson ${lessons.length + 1}`,
        type: module.type || "doc",
        content: shouldSplit ? part.split("\n").slice(1).join("\n").trim() || part : content,
        duration: module.duration || "Self-paced",
      });
    });
  }
  return lessons;
}

publicTrainingRouter.post("/course", async (req, res) => {
  const code = cleanAccessCode(req.body?.code);
  if (!code) return res.status(400).json({ error: "Enter a training access code." });
  try {
    const access = await db.findByField("trainingAccessCodes", "code", code);
    if (!access || access.revokedAt) return res.status(404).json({ error: "This access code is invalid or has been disabled." });
    if (!(await companySubscriptionAllowsTraining(access.companyId))) return subscriptionRequired(res);
    const record = await db.findForCompany("companyState", access.companyId, access.companyId);
    const state = record?.state as Record<string, any> | undefined;
    const course = Array.isArray(state?.trainings) ? state!.trainings.find((item: any) => item.id === access.trainingId) : null;
    if (!course) return res.status(404).json({ error: "This course is no longer available." });
    const questions = Array.isArray(course.questions) ? course.questions : [];
    const modules = getCourseLessons(course);
    return res.json({ course: { id: course.id, title: course.title, description: course.description || "", materials: course.materials || modules.map((module: any) => module.content).filter(Boolean).join("\n\n") || "", modules, passPercent: Number.isInteger(course.passPercent) ? course.passPercent : 70, questions: questions.map((q: any, index: number) => ({ id: q.id || String(index), text: q.text, options: q.options })) } });
  } catch (error) {
    console.error("Public training course lookup failed:", error);
    return res.status(500).json({ error: "Could not load this course. Please try again." });
  }
});

publicTrainingRouter.post("/lesson-complete", async (req, res) => {
  const parsed = z.object({
    code: z.string().min(1).max(24),
    email: z.string().trim().email().max(254),
    lessonId: z.string().min(1).max(200),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter a valid email and select a lesson." });
  const code = cleanAccessCode(parsed.data.code);
  const email = parsed.data.email.trim().toLowerCase();
  try {
    const access = await db.findByField("trainingAccessCodes", "code", code);
    if (!access || access.revokedAt) return res.status(404).json({ error: "This access code is invalid or has been disabled." });
    if (!(await companySubscriptionAllowsTraining(access.companyId))) return subscriptionRequired(res);
    const record = await db.findForCompany("companyState", access.companyId, access.companyId);
    const state = record?.state as Record<string, any> | undefined;
    const course = Array.isArray(state?.trainings) ? state!.trainings.find((item: any) => item.id === access.trainingId) : null;
    const lesson = getCourseLessons(course).find((item: any) => item.id === parsed.data.lessonId);
    if (!lesson) return res.status(404).json({ error: "This lesson is not part of the shared course." });
    const progress = (await db.table("externalTrainingProgress", access.companyId)) as any[];
    const existing = progress.find((item) => item.accessCodeId === access.id && item.email === email && item.lessonId === lesson.id);
    if (!existing) {
      await db.insert("externalTrainingProgress", {
        id: "progress-" + randomBytes(12).toString("hex"),
        companyId: access.companyId,
        accessCodeId: access.id,
        trainingId: course.id,
        email,
        lessonId: lesson.id,
        completedAt: new Date().toISOString(),
      });
    }
    return res.json({ completed: true });
  } catch (error) {
    console.error("Public training lesson progress failed:", error);
    return res.status(500).json({ error: "Could not save lesson progress. Please try again." });
  }
});

publicTrainingRouter.post("/submit", async (req, res) => {
  const parsed = z.object({
    code: z.string().min(1).max(24),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(254),
    answers: z.record(z.number().int().min(0).max(3)),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter your name, a valid email, and answers to the exam." });
  const code = cleanAccessCode(parsed.data.code);
  try {
    const access = await db.findByField("trainingAccessCodes", "code", code);
    if (!access || access.revokedAt) return res.status(404).json({ error: "This access code is invalid or has been disabled." });
    if (!(await companySubscriptionAllowsTraining(access.companyId))) return subscriptionRequired(res);
    const record = await db.findForCompany("companyState", access.companyId, access.companyId);
    const state = record?.state as Record<string, any> | undefined;
    const course = Array.isArray(state?.trainings) ? state!.trainings.find((item: any) => item.id === access.trainingId) : null;
    const questions = Array.isArray(course?.questions) ? course.questions : [];
    if (!course || !questions.length) return res.status(404).json({ error: "This course has no exam available yet." });
    const lessons = getCourseLessons(course);
    if (!lessons.length) return res.status(400).json({ error: "This course has no study lessons. Contact your training administrator." });
    const completedLessonIds = new Set(((await db.table("externalTrainingProgress", access.companyId)) as any[])
      .filter((item) => item.accessCodeId === access.id && item.email === parsed.data.email.trim().toLowerCase())
      .map((item) => item.lessonId));
    if (lessons.some((lesson: any) => !completedLessonIds.has(lesson.id))) {
      return res.status(403).json({ error: "Complete every study lesson before submitting the final assessment." });
    }
    const answers = parsed.data.answers;
    const allowedKeys = new Set(questions.map((q: any, index: number) => q.id || String(index)));
    if (Object.keys(answers).some((key) => !allowedKeys.has(key))) return res.status(400).json({ error: "Your answers do not match this exam." });
    for (let i = 0; i < questions.length; i++) if (answers[questions[i].id || String(i)] === undefined) return res.status(400).json({ error: "Please answer every question." });
    const previous = ((await db.table("externalTrainingSubmissions", access.companyId)) as any[]).filter((item) => item.accessCodeId === access.id && item.email === parsed.data.email.trim().toLowerCase());
    const maxAttempts = Number.isInteger(course.attemptsPerRound) && course.attemptsPerRound > 0 ? course.attemptsPerRound : 3;
    if (previous.length >= maxAttempts) return res.status(403).json({ error: `You have used all ${maxAttempts} exam attempts for this course.` });
    if (Number.isInteger(access.seatLimit) && access.seatLimit > 0) {
      const distinctEmails = new Set(((await db.table("externalTrainingSubmissions", access.companyId)) as any[]).filter((item) => item.accessCodeId === access.id).map((item) => item.email));
      if (!distinctEmails.has(parsed.data.email.trim().toLowerCase()) && distinctEmails.size >= access.seatLimit) return res.status(403).json({ error: "This course has reached its trainee limit. Contact the training administrator." });
    }
    const correctCount = questions.reduce((sum: number, q: any, index: number) => sum + (answers[q.id || String(index)] === q.correctIndex ? 1 : 0), 0);
    const percent = Math.round((correctCount / questions.length) * 100);
    const passed = percent >= (Number.isInteger(course.passPercent) ? course.passPercent : 70);
    const submission = { id: "submission-" + randomBytes(12).toString("hex"), companyId: access.companyId, accessCodeId: access.id, trainingId: course.id, traineeName: parsed.data.name.trim(), email: parsed.data.email.trim().toLowerCase(), attempt: previous.length + 1, score: correctCount, total: questions.length, percent, passed, submittedAt: new Date().toISOString() };
    await db.insert("externalTrainingSubmissions", submission);
    return res.json({ result: { courseTitle: course.title, traineeName: submission.traineeName, score: correctCount, total: questions.length, percent, passed, passPercent: Number.isInteger(course.passPercent) ? course.passPercent : 70, attempt: submission.attempt } });
  } catch (error) {
    console.error("Public training exam submission failed:", error);
    return res.status(500).json({ error: "Could not submit your exam. Please try again." });
  }
});

trainingRouter.use(requireAuth);

trainingRouter.post("/lesson-complete", async (req: AuthedRequest, res) => {
  const parsed = z.object({
    trainingId: z.string().min(1).max(200),
    moduleId: z.string().min(1).max(200),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Select a valid course lesson." });
  if (req.auth!.role !== "employee" || !req.auth!.employeeId) {
    return res.status(403).json({ error: "Only the enrolled employee can record their lesson completion." });
  }
  try {
    const record = await db.findForCompany("companyState", req.auth!.companyId, req.auth!.companyId);
    const state = record?.state as Record<string, any> | undefined;
    const training = Array.isArray(state?.trainings) ? state!.trainings.find((item: any) => item.id === parsed.data.trainingId) : null;
    const lesson = Array.isArray(training?.modules) ? training.modules.find((item: any) => item.id === parsed.data.moduleId && item.type !== "quiz") : null;
    if (!training || !lesson) return res.status(404).json({ error: "This lesson is not part of the selected course." });
    const employee = await db.findForCompany("employees", req.auth!.employeeId, req.auth!.companyId);
    if (!employee) return res.status(403).json({ error: "Your employee account could not be verified." });
    const enrollments = Array.isArray(state!.enrollments) ? [...state!.enrollments] : [];
    let enrollment = enrollments.find((item: any) => item.employeeId === employee.id && item.trainingId === training.id);
    if (!enrollment) {
      enrollment = { id: "enrollment-" + randomBytes(10).toString("hex"), employeeId: employee.id, trainingId: training.id, progress: 0, completedModules: [], enrolledAt: new Date().toISOString().slice(0, 10), completedAt: null, score: null, certificateId: null };
      enrollments.push(enrollment);
    }
    const completed = new Set(Array.isArray(enrollment.completedModules) ? enrollment.completedModules : []);
    completed.add(lesson.id);
    enrollment.completedModules = [...completed];
    const lessonModules = training.modules.filter((item: any) => item.type !== "quiz");
    enrollment.progress = Math.round(100 * lessonModules.filter((item: any) => completed.has(item.id)).length / Math.max(1, lessonModules.length));
    state!.enrollments = enrollments;
    await db.updateForCompany("companyState", req.auth!.companyId, req.auth!.companyId, { state, updatedAt: new Date().toISOString() });
    return res.json({ completed: true, progress: enrollment.progress });
  } catch (error) {
    console.error("Training lesson completion failed:", error);
    return res.status(500).json({ error: "Could not save lesson completion. Please try again." });
  }
});

const GENERATED_COURSE_PROMPT = `You are a senior corporate instructional designer creating professional training for a mixed international workforce. Return only valid JSON with this shape:
{"title":"string","description":"two-sentence description","materials":"string","passPercent":70,"attemptsPerRound":3,"questions":[{"text":"scenario-based question","options":["A","B","C","D"],"correctIndex":0}]}
Create 8 to 10 substantial lessons, each introduced by a heading exactly like "MODULE 1 — LESSON TITLE". Each lesson must contain at least 130 words and include: learning objective; clear explanation of the concept; step-by-step workplace practice; a realistic workplace example or scenario; common mistakes or risks; and a short learner activity or reflection. Use plain, professional English and practical detail, not slogans or repeated filler. Build a coherent progression from foundations to application and review. Avoid legal conclusions: explain that local law and company policy vary, and identify jurisdiction-specific requirements only when confident. Do not invent statutes, deadlines, penalties, or official guidance.
Create 20 to 25 distinct multiple-choice questions. Every question must test a meaningful learning objective explicitly taught in the lessons. Use realistic workplace situations, decision-making and applied understanding; avoid trivial, vague, duplicate, trick, or meaningless questions. Each question must have exactly four plausible, distinct options and exactly one defensible correct answer. Distractors should reflect realistic mistakes, not jokes or obviously absurd choices. Vary correct answer positions. Do not reveal answers in question text. Do not include markdown fences.`;

function parseGeneratedCourse(raw: string) {
  const clean = raw.trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\`\`\`\s*$/, "");
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The AI did not return a JSON course.");
  const value = JSON.parse(clean.slice(start, end + 1));
  if (typeof value.title !== "string" || !value.title.trim() || typeof value.materials !== "string" || !value.materials.trim()) throw new Error("The generated course was incomplete.");
  const lessonParts = value.materials.split(/(?=MODULE\s+\d+\s*[—-])/i).map((part: string) => part.trim()).filter(Boolean);
  if (lessonParts.length < 8 || lessonParts.length > 10) throw new Error("The course must contain 8 to 10 lessons.");
  for (let index = 0; index < lessonParts.length; index++) {
    const words = lessonParts[index].split(/\s+/).filter(Boolean).length;
    if (words < 130) throw new Error(`Lesson ${index + 1} is too brief to teach the topic properly.`);
  }
  if (!Array.isArray(value.questions) || value.questions.length < 20 || value.questions.length > 25) throw new Error("The exam must contain 20 to 25 questions.");
  const questions = value.questions.map((q: any, index: number) => {
    if (!q || typeof q.text !== "string" || !q.text.trim() || !Array.isArray(q.options) || q.options.length !== 4 || q.options.some((o: unknown) => typeof o !== "string" || !o.trim()) || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
      throw new Error(`Question ${index + 1} was not formatted correctly.`);
    }
    const options = q.options.map((o: string) => o.trim());
    if (new Set(options.map((option: string) => option.toLowerCase())).size !== 4) throw new Error(`Question ${index + 1} contains duplicate options.`);
    return { id: `question-${index + 1}`, text: q.text.trim(), options, correctIndex: q.correctIndex };
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
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 16000 },
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


trainingRouter.post("/access", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = z.object({ trainingId: z.string().min(1).max(200), seatLimit: z.number().int().min(1).max(100000).nullable().optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Select a course and optionally set a valid trainee seat limit." });
  try {
    const record = await db.findForCompany("companyState", req.auth!.companyId, req.auth!.companyId);
    const state = record?.state as Record<string, any> | undefined;
    const course = Array.isArray(state?.trainings) ? state!.trainings.find((item: any) => item.id === parsed.data.trainingId) : null;
    if (!course) return res.status(404).json({ error: "Course not found in your company." });
    if (!Array.isArray(course.questions) || course.questions.length === 0) return res.status(400).json({ error: "Add exam questions to this course before sharing external access." });
    const existing = ((await db.table("trainingAccessCodes", req.auth!.companyId)) as any[]).find((item) => item.trainingId === course.id && !item.revokedAt);
    if (existing) {
      const updated = parsed.data.seatLimit !== undefined
        ? await db.updateForCompany("trainingAccessCodes", existing.id, req.auth!.companyId, { seatLimit: parsed.data.seatLimit ?? null })
        : existing;
      return res.json({ access: updated || existing, url: `${process.env.APP_URL || process.env.FRONTEND_URL || ""}/training-access?code=${existing.code}` });
    }
    const code = randomBytes(12).toString("hex").toUpperCase();
    const access = { id: "access-" + randomBytes(10).toString("hex"), companyId: req.auth!.companyId, trainingId: course.id, code, seatLimit: parsed.data.seatLimit ?? null, createdAt: new Date().toISOString(), revokedAt: null };
    await db.insert("trainingAccessCodes", access);
    return res.status(201).json({ access, url: `${process.env.APP_URL || process.env.FRONTEND_URL || ""}/training-access?code=${code}` });
  } catch (error) {
    console.error("Creating external training access failed:", error);
    return res.status(500).json({ error: "Could not create a training access code." });
  }
});

trainingRouter.get("/external-results", requireAdmin, async (req: AuthedRequest, res) => {
  const rows = (await db.table("externalTrainingSubmissions", req.auth!.companyId)) as any[];
  const access = (await db.table("trainingAccessCodes", req.auth!.companyId)) as any[];
  const stateRecord = await db.findForCompany("companyState", req.auth!.companyId, req.auth!.companyId);
  const trainings = Array.isArray(stateRecord?.state?.trainings) ? stateRecord.state.trainings : [];
  const titles = new Map(trainings.map((item: any) => [item.id, item.title]));
  const accessIds = new Set(access.map((item) => item.id));
  return res.json({ results: rows.filter((item) => accessIds.has(item.accessCodeId)).map((item) => ({ ...item, courseTitle: titles.get(item.trainingId) || "Archived course" })).sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt))) });
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
      const lessonModules = Array.isArray(training.modules) ? training.modules.filter((module: any) => module.type !== "quiz") : [];
      const enrollment = (Array.isArray(state!.enrollments) ? state!.enrollments : []).find((item: any) => item.employeeId === employeeId && item.trainingId === training.id);
      const completed = new Set(Array.isArray(enrollment?.completedModules) ? enrollment.completedModules : []);
      if (!lessonModules.length || lessonModules.some((module: any) => !completed.has(module.id))) {
        return res.status(403).json({ error: "Complete every course lesson before submitting the final assessment." });
      }
      const attemptsUsed = Number(enrollment?.attempts) || 0;
      const maxAttempts = Number.isInteger(training.attemptsPerRound) && training.attemptsPerRound > 0 ? training.attemptsPerRound : 3;
      if (attemptsUsed >= maxAttempts) {
        return res.status(403).json({ error: `You have used all ${maxAttempts} exam attempts for this course. Contact HR if you need another attempt.` });
      }
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
        const moduleIds = Array.isArray(training.modules) ? training.modules.filter((module: any) => module.type !== "quiz").map((module: any) => module.id).filter(Boolean) : [];
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
