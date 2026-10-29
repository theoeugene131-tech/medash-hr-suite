"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const field = { width: "100%", padding: "11px 12px", border: "1px solid #d7dce2", borderRadius: 8, color: "#17212b", background: "#fff", boxSizing: "border-box" };

export default function TrainingAccessPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialCode = params.get("code");
    if (initialCode) setCode(initialCode.toUpperCase());
  }, []);

  async function loadCourse(event) {
    event?.preventDefault();
    setBusy(true); setError(""); setResult(null); setCourse(null); setAnswers({});
    try {
      const response = await api("/api/training/public/course", { method: "POST", body: { code: code.trim() } });
      setCourse(response.course);
    } catch (e) { setError(e.message || "Could not load this course."); }
    finally { setBusy(false); }
  }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await api("/api/training/public/submit", { method: "POST", body: { code: code.trim(), name, email, answers } });
      setResult(response.result);
    } catch (e) { setError(e.message || "Could not submit the exam."); }
    finally { setBusy(false); }
  }

  return <main style={{ minHeight: "100vh", background: "#f4f6f8", color: "#17212b", padding: "28px 16px", fontFamily: "Arial, sans-serif" }}>
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <button onClick={() => router.push("/")} style={{ border: 0, background: "transparent", padding: 0, color: "#356d67", cursor: "pointer" }}>← Medash HR Suite</button>
        <h1 style={{ margin: "18px 0 6px", fontSize: 30 }}>External training</h1>
        <p style={{ color: "#586574", lineHeight: 1.5 }}>Enter the access code provided by your training administrator. You do not need a Medash employee login.</p>
      </header>
      <section style={{ background: "#fff", border: "1px solid #e0e5e9", borderRadius: 14, padding: 20, boxShadow: "0 5px 20px rgba(25,35,45,.04)" }}>
        {!course && !result && <form onSubmit={loadCourse} style={{ display: "grid", gap: 12 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Training access code<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} required maxLength={24} placeholder="Enter your code" style={{ ...field, marginTop: 7, letterSpacing: 2 }} /></label>
          <button disabled={busy} style={{ border: 0, borderRadius: 8, background: "#286c62", color: "#fff", padding: 12, fontWeight: 700, cursor: "pointer" }}>{busy ? "Loading course…" : "Open course"}</button>
        </form>}
        {course && !result && <form onSubmit={submit} style={{ display: "grid", gap: 18 }}>
          <div><h2 style={{ margin: "0 0 6px", fontSize: 24 }}>{course.title}</h2><p style={{ margin: 0, color: "#586574" }}>{course.description}</p><p style={{ fontSize: 13, color: "#586574" }}>Pass mark: {course.passPercent}% · {course.questions.length} questions</p></div>
          {course.materials && <details open style={{ border: "1px solid #e0e5e9", borderRadius: 9, padding: 12 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Study material</summary><div style={{ whiteSpace: "pre-wrap", lineHeight: 1.65, marginTop: 12 }}>{course.materials}</div></details>}
          <div style={{ display: "grid", gap: 16 }}>
            {course.questions.map((q, i) => <fieldset key={q.id} style={{ margin: 0, border: "1px solid #e0e5e9", borderRadius: 10, padding: 14 }}>
              <legend style={{ padding: "0 5px", fontWeight: 700 }}>{i + 1}. {q.text}</legend>
              <div style={{ display: "grid", gap: 9, marginTop: 8 }}>
                {q.options.map((option, j) => <label key={j} style={{ display: "flex", gap: 9, alignItems: "flex-start", cursor: "pointer" }}><input type="radio" name={q.id} checked={answers[q.id] === j} onChange={() => setAnswers(old => ({ ...old, [q.id]: j }))} required /> <span>{option}</span></label>)}
              </div>
            </fieldset>)}
          </div>
          <div style={{ display: "grid", gap: 10, borderTop: "1px solid #e0e5e9", paddingTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>Your full name<input value={name} onChange={e => setName(e.target.value)} required maxLength={120} style={{ ...field, marginTop: 6 }} /></label>
            <label style={{ fontSize: 13, fontWeight: 700 }}>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} style={{ ...field, marginTop: 6 }} /></label>
            <button disabled={busy} style={{ border: 0, borderRadius: 8, background: "#286c62", color: "#fff", padding: 12, fontWeight: 700, cursor: "pointer" }}>{busy ? "Marking exam…" : "Submit exam"}</button>
          </div>
        </form>}
        {result && <div style={{ display: "grid", gap: 12 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", color: "#586574" }}>Exam result</div>
          <h2 style={{ margin: 0 }}>{result.passed ? "Congratulations — you passed" : "Not passed yet"}</h2>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{result.percent}%</div>
          <p style={{ margin: 0 }}>Score: {result.score} of {result.total}. Required pass mark: {result.passPercent}%.</p>
          <p style={{ margin: 0, color: "#586574" }}>Course: {result.courseTitle} · Attempt {result.attempt}</p>
          <button onClick={() => { setCourse(null); setResult(null); setAnswers({}); setName(""); setEmail(""); }} style={{ border: "1px solid #d7dce2", borderRadius: 8, background: "#fff", padding: 11, cursor: "pointer" }}>Return to access code</button>
        </div>}
        {error && <p role="alert" style={{ color: "#b42318", background: "#fff2f0", borderRadius: 7, padding: 10, marginBottom: 0 }}>{error}</p>}
      </section>
      <p style={{ textAlign: "center", fontSize: 12, color: "#6a7480", marginTop: 18 }}>Your exam is marked on the server. Correct answers are not sent to your browser.</p>
    </div>
  </main>;
}
