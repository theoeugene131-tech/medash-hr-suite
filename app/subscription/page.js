"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getSessionUser, getToken, clearSession } from "@/lib/api";

const inputStyle = { width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #d8dce3", borderRadius: 8, background: "#fff", color: "#201526", marginTop: 6 };

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("monthly");
  const [reference, setReference] = useState("");
  const [payerName, setPayerName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      await api("/api/auth/payment-request", {
        method: "POST",
        body: { plan, paymentReference: reference.trim(), payerName: payerName.trim(), note: note.trim() },
      });
      setMessage("Your payment reference has been submitted. Medash will verify it manually and activate your company subscription after confirmation.");
      setReference(""); setNote("");
    } catch (err) {
      setError(err.message || "Could not submit your payment reference.");
    } finally {
      setBusy(false);
    }
  }

  const signedIn = !!(user && getToken());
  return <main style={{ minHeight: "100vh", background: "#241623", color: "#EDEEF2", padding: "36px 18px", fontFamily: "Arial, sans-serif" }}>
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <a href="/" style={{ color: "#E2735B", textDecoration: "none" }}>← Medash HR Suite</a>
      <section style={{ marginTop: 24, background: "#EDEEF2", color: "#201526", borderRadius: 14, padding: 28 }}>
        <p style={{ color: "#4C8577", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Company subscription</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, margin: "8px 0" }}>Restore your Medash access</h1>
        <p style={{ color: "#58616b", lineHeight: 1.7 }}>Your 7-day free trial gives your company full access to HR, Payroll and Training. After the trial, access is paused until payment is verified. Your company records remain saved.</p>
        <div style={{ background: "#f3f6f5", border: "1px solid #d4e0dc", padding: 15, borderRadius: 9, margin: "18px 0" }}>
          <strong>How manual activation works</strong>
          <ol style={{ color: "#58616b", lineHeight: 1.8, paddingLeft: 20, marginBottom: 0 }}>
            <li>Choose a monthly or annual subscription.</li>
            <li>Make payment using the payment instructions supplied by Medash.</li>
            <li>Enter your payment reference below.</li>
            <li>Medash checks the payment and activates your company access.</li>
          </ol>
        </div>
        {!signedIn ? <div>
          <p style={{ lineHeight: 1.6 }}>Please sign in with your company owner or administrator account before submitting a payment reference.</p>
          <a href="/login" style={{ display: "inline-block", background: "#E2735B", color: "#fff", padding: "12px 17px", borderRadius: 7, textDecoration: "none", fontWeight: 700 }}>Sign in</a>
        </div> : <form onSubmit={submit} style={{ display: "grid", gap: 13 }}>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Subscription term
            <select value={plan} onChange={e => setPlan(e.target.value)} style={inputStyle}>
              <option value="monthly">Monthly · 30 days</option>
              <option value="annual">Annual · 365 days</option>
            </select>
          </label>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Payment reference / transaction ID
            <input required minLength={3} maxLength={120} value={reference} onChange={e => setReference(e.target.value)} placeholder="Enter the reference shown by your bank or payment provider" style={inputStyle} />
          </label>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Name on payment (optional)
            <input value={payerName} onChange={e => setPayerName(e.target.value)} maxLength={120} style={inputStyle} />
          </label>
          <label style={{ fontWeight: 700, fontSize: 13 }}>Additional information (optional)
            <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={500} rows={3} placeholder="Any details that will help us identify your payment" style={{ ...inputStyle, resize: "vertical" }} />
          </label>
          <button disabled={busy} style={{ border: 0, borderRadius: 8, background: "#286c62", color: "#fff", padding: 13, fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? "Submitting…" : "Submit payment for verification"}</button>
        </form>}
        {error && <p role="alert" style={{ background: "#fff0ef", color: "#a12d27", padding: 12, borderRadius: 7, lineHeight: 1.5 }}>{error}</p>}
        {message && <p role="status" style={{ background: "#eaf4ef", color: "#245c48", padding: 12, borderRadius: 7, lineHeight: 1.5 }}>{message}</p>}
        <p style={{ color: "#7b838c", fontSize: 12, lineHeight: 1.6, marginTop: 18 }}>Submitting a reference does not activate access automatically. Your company remains paused until a Medash platform administrator confirms receipt of payment.</p>
        <button type="button" onClick={() => router.push("/login")} style={{ marginTop: 8, border: "1px solid #cfd4da", background: "transparent", color: "#201526", padding: "9px 13px", borderRadius: 7, cursor: "pointer" }}>Return to application</button>
      </section>
    </div>
  </main>;
}
