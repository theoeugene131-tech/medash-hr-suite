"use client";

import { useState } from "react";
import { api } from "@/lib/api";

const fieldStyle = { width: "100%", padding: "9px 10px", border: "1px solid var(--line)", borderRadius: 6, background: "var(--bg-2)", color: "var(--ink)", fontSize: 12 };
const defaultQuestion = () => ({ id: `q-${Math.random().toString(36).slice(2, 9)}`, text: "", options: ["", "", "", ""], correctIndex: 0 });

export default function TrainingCourseBuilder({ onSave, onCancel }) {
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ title: "", category: "Compliance", duration: "2h", description: "", required: true, materials: "", passPercent: 70, attemptsPerRound: 3, questions: [defaultQuestion()] });

  function patch(field, value) { setDraft((current) => ({ ...current, [field]: value })); }
  function patchQuestion(id, patchValue) { setDraft((current) => ({ ...current, questions: current.questions.map((q) => q.id === id ? { ...q, ...patchValue } : q) })); }
  function patchOption(id, index, value) {
    setDraft((current) => ({ ...current, questions: current.questions.map((q) => {
      if (q.id !== id) return q;
      const options = [...q.options]; options[index] = value; return { ...q, options };
    }) }));
  }

  async function generate() {
    if (!topic.trim()) return;
    setBusy(true); setError("");
    try {
      const result = await api("/api/training/generate", { method: "POST", body: { topic: topic.trim() } });
      const course = result.course;
      setDraft((current) => ({
        ...current,
        title: course.title || current.title,
        description: course.description || current.description,
        materials: course.materials || "",
        passPercent: course.passPercent || 70,
        attemptsPerRound: course.attemptsPerRound || 3,
        questions: (course.questions || []).map((q) => ({ id: `q-${Math.random().toString(36).slice(2, 9)}`, text: q.text, options: q.options, correctIndex: q.correctIndex })),
      }));
    } catch (err) {
      setError(err.message || "Could not generate the course. You can still create it manually.");
    } finally { setBusy(false); }
  }

  function save() {
    if (!draft.title.trim()) { setError("Add a course title first."); return; }
    if (!draft.materials.trim()) { setError("Add study material before saving."); return; }
    if (!draft.questions.length || draft.questions.some((q) => !q.text.trim() || q.options.some((option) => !option.trim()) || q.correctIndex < 0 || q.correctIndex > 3)) {
      setError("Complete every question and all four options, then choose the correct answer."); return;
    }
    const modules = draft.materials.split(/(?=MODULE\s+\d+\s*[—-])/i).map((part, index) => {
      const lines = part.trim().split("\n");
      const title = lines[0]?.trim() || `Module ${index + 1}`;
      return { id: `module-${index + 1}-${Math.random().toString(36).slice(2, 6)}`, title, type: "doc", content: lines.slice(1).join("\n").trim() || part.trim(), duration: "15m" };
    }).filter((module) => module.content);
    const quizModule = { id: `quiz-${Math.random().toString(36).slice(2, 8)}`, title: "Final assessment", type: "quiz", content: `${draft.questions.length} questions · ${draft.passPercent}% pass mark`, duration: "20m" };
    onSave({ ...draft, id: `course-${Math.random().toString(36).slice(2, 10)}`, createdAt: new Date().toISOString().slice(0, 10), modules: [...modules, quizModule] });
  }

  return <div style={{ display: "grid", gap: 12, maxHeight: "72vh", overflowY: "auto", paddingRight: 3 }}>
    <div style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg-2)" }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>CertifyPath course builder</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Generate structured learning material and an exam with AI, then review and edit everything before saving. AI generation requires GEMINI_API_KEY on the backend; manual authoring works without it.</div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. UK workplace data protection" style={{ ...fieldStyle, flex: 1 }} />
        <button className="btn btn-primary" disabled={busy || !topic.trim()} onClick={generate}>{busy ? "Generating…" : "Generate with AI"}</button>
      </div>
    </div>
    <div className="field"><label>Course title *</label><input value={draft.title} onChange={(e) => patch("title", e.target.value)} style={fieldStyle} /></div>
    <div className="field-row">
      <div className="field"><label>Category</label><select value={draft.category} onChange={(e) => patch("category", e.target.value)} style={fieldStyle}><option>Compliance</option><option>Skills</option><option>Onboarding</option><option>Safety</option><option>Leadership</option><option>Data protection</option></select></div>
      <div className="field"><label>Duration</label><input value={draft.duration} onChange={(e) => patch("duration", e.target.value)} style={fieldStyle} /></div>
    </div>
    <div className="field"><label>Description</label><input value={draft.description} onChange={(e) => patch("description", e.target.value)} style={fieldStyle} /></div>
    <div className="field"><label>Study material *</label><textarea rows={8} value={draft.materials} onChange={(e) => patch("materials", e.target.value)} placeholder="Write training content or generate it above. Separate modules with headings such as MODULE 1 — INTRODUCTION." style={{ ...fieldStyle, resize: "vertical" }} /></div>
    <div className="field-row">
      <div className="field"><label>Pass mark (%)</label><input type="number" min="1" max="100" value={draft.passPercent} onChange={(e) => patch("passPercent", Math.min(100, Math.max(1, Number(e.target.value) || 1)))} style={fieldStyle} /></div>
      <div className="field"><label>Attempts before re-study</label><input type="number" min="1" max="10" value={draft.attemptsPerRound} onChange={(e) => patch("attemptsPerRound", Math.min(10, Math.max(1, Number(e.target.value) || 1)))} style={fieldStyle} /></div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong style={{ fontSize: 13 }}>Exam questions ({draft.questions.length})</strong><button className="btn" onClick={() => patch("questions", [...draft.questions, defaultQuestion()])}>+ Add question</button></div>
    {draft.questions.map((q, index) => <div key={q.id} style={{ border: "1px solid var(--line)", borderRadius: 7, padding: 10, display: "grid", gap: 7 }}>
      <div style={{ display: "flex", gap: 6 }}><input value={q.text} onChange={(e) => patchQuestion(q.id, { text: e.target.value })} placeholder={`Question ${index + 1}`} style={{ ...fieldStyle, flex: 1 }} />{draft.questions.length > 1 && <button className="btn" onClick={() => patch("questions", draft.questions.filter((item) => item.id !== q.id))}>Remove</button>}</div>
      {q.options.map((option, optionIndex) => <div key={optionIndex} style={{ display: "flex", alignItems: "center", gap: 7 }}><input type="radio" name={q.id} checked={q.correctIndex === optionIndex} onChange={() => patchQuestion(q.id, { correctIndex: optionIndex })} aria-label={`Option ${optionIndex + 1} is correct`} /><input value={option} onChange={(e) => patchOption(q.id, optionIndex, e.target.value)} placeholder={`Option ${optionIndex + 1}`} style={{ ...fieldStyle, flex: 1 }} /></div>)}
      <div style={{ fontSize: 10, color: "var(--muted)" }}>Select the radio button beside the correct answer.</div>
    </div>)}
    {error && <p style={{ color: "#B23A2E", fontSize: 12 }}>{error}</p>}
    <div style={{ display: "flex", gap: 8, marginTop: 4 }}><button className="btn btn-primary" onClick={save}>Save course</button><button className="btn" onClick={onCancel}>Cancel</button></div>
  </div>;
}
