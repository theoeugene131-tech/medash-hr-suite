"use client";

import { useState } from "react";

function dateLabel(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PlatformAdminPage() {
  const [secret, setSecret] = useState("");
  const [companies, setCompanies] = useState([]);
  const [plan, setPlan] = useState("monthly");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function request(path, method = "GET", body) {
    const response = await fetch(path, {
      method,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-admin-activation-secret": secret,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  async function loadCompanies(event) {
    event?.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const data = await request("/api/admin/companies");
      setCompanies(Array.isArray(data) ? data : []);
      setMessage("Company list loaded.");
    } catch (error) {
      setMessage(error.message || "Could not load companies.");
    } finally {
      setBusy(false);
    }
  }

  async function activate(company) {
    if (!window.confirm("Activate a " + plan + " subscription for " + company.name + "?")) return;
    setBusy(true);
    setMessage("");
    try {
      await request("/api/admin/subscriptions/activate", "POST", { companyId: company.id, plan });
      setMessage("Subscription activated for " + company.name + ".");
      await loadCompanies();
    } catch (error) {
      setMessage(error.message || "Could not activate subscription.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#241623", color: "#EDEEF2", padding: "32px 20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ color: "#E2735B", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>Restricted access</p>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, margin: "8px 0" }}>Medash platform admin</h1>
        <p style={{ color: "#D4C6D1", lineHeight: 1.7, maxWidth: 760 }}>Review company signups and trial status, and activate a subscription after you have independently confirmed payment. Keep the admin secret private; do not paste it into customer support messages or share it with customers.</p>

        <form onSubmit={loadCompanies} style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "end", background: "#2E1D2D", border: "1px solid #4A3447", borderRadius: 12, padding: 18, marginTop: 24 }}>
          <label style={{ flex: "1 1 300px", fontSize: 13 }}>
            Platform admin secret
            <input type="password" autoComplete="current-password" value={secret} onChange={(event) => setSecret(event.target.value)} required style={{ display: "block", width: "100%", boxSizing: "border-box", padding: 12, marginTop: 8, borderRadius: 7, border: "1px solid #735A70", background: "#241623", color: "#fff" }} />
          </label>
          <label style={{ fontSize: 13 }}>
            Activation term
            <select value={plan} onChange={(event) => setPlan(event.target.value)} style={{ display: "block", padding: 12, marginTop: 8, borderRadius: 7, border: "1px solid #735A70", background: "#241623", color: "#fff" }}>
              <option value="monthly">Monthly · 30 days</option>
              <option value="annual">Annual · 365 days</option>
            </select>
          </label>
          <button type="submit" disabled={busy} style={{ padding: "12px 18px", border: 0, borderRadius: 7, background: "#E2735B", color: "#fff", fontWeight: 700, cursor: busy ? "wait" : "pointer" }}>{busy ? "Please wait…" : "Load companies"}</button>
        </form>

        {message && <p role="status" style={{ margin: "16px 0", padding: 12, borderRadius: 8, background: "#2E1D2D", color: "#EDEEF2", lineHeight: 1.6 }}>{message}</p>}

        <div style={{ marginTop: 22, overflowX: "auto", border: "1px solid #4A3447", borderRadius: 12 }}>
          <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", background: "#2E1D2D", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", background: "#3A2739" }}>
                {["Company", "Owner email", "Country", "Signed up", "Status", "Trial ends", "Paid until", "Action"].map((heading) => <th key={heading} style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{heading}</th>)}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{company.name || "Unnamed company"}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{company.ownerEmail || "—"}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{({ NG: "Nigeria", GB: "UK", US: "US" })[company.countryCode] || company.countryCode}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{dateLabel(company.createdAt)}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{company.subscriptionStatus || "unknown"}{company.subscriptionPlan ? " · " + company.subscriptionPlan : ""}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{dateLabel(company.trialEndsAt)}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}>{dateLabel(company.subscriptionEndsAt)}</td>
                  <td style={{ padding: 13, borderBottom: "1px solid #4A3447" }}><button type="button" disabled={busy} onClick={() => activate(company)} style={{ padding: "8px 10px", border: 0, borderRadius: 6, background: "#E2735B", color: "#fff", cursor: busy ? "wait" : "pointer", whiteSpace: "nowrap" }}>Activate {plan}</button></td>
                </tr>
              ))}
              {companies.length === 0 && <tr><td colSpan={8} style={{ padding: 20, color: "#B39FB0", textAlign: "center" }}>No company list loaded yet. Enter your secret above and choose “Load companies”.</td></tr>}
            </tbody>
          </table>
        </div>
        <p style={{ color: "#B39FB0", fontSize: 12, lineHeight: 1.7, marginTop: 16 }}>Manual activation only records the payment decision you make. It does not verify payments with Selar automatically. This page should only be used over HTTPS by the platform owner.</p>
      </div>
    </main>
  );
}
