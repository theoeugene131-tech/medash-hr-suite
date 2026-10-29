"use client";

import { CompanyAPI } from "@/lib/api";
import { loadState, saveState } from "@/lib/store";

const REGIONS = {
  NG: {
    label: "Nigeria",
    currency: "NGN",
    locale: "en-NG",
    timezone: "Africa/Lagos",
    payrollLevel: "Manual entry / CSV only — estimate paused",
    payroll: "Automated Nigerian payroll estimates are paused because the current tax-year rules require professional validation. You can enter or import figures checked by a qualified payroll provider; do not rely on Medash for statutory calculations or filings.",
    available: ["Manual payroll entry and CSV import", "HR records, document checklist, leave, attendance, training and reports"],
    unavailable: ["Certified statutory payroll or tax filing", "Automatic bank payments or statutory remittances"],
  },
  GB: {
    label: "Europe/UK",
    currency: "GBP",
    locale: "en-GB",
    timezone: "Europe/London",
    payrollLevel: "Manual entry / CSV only",
    payroll: "UK statutory payroll calculation is not implemented. You can enter or import figures prepared and checked by your payroll provider, but Medash does not calculate PAYE, National Insurance, workplace pension duties, student loan deductions or RTI submissions.",
    available: ["Manual payroll entry and CSV import", "HR records, document checklist, leave, attendance, training and internal reports (document files remain browser-local)", "GBP, UK date/number format and London time-zone preference"],
    unavailable: ["Automatic UK tax / National Insurance calculations", "RTI submissions, pension filings or bank payments"],
  },
  US: {
    label: "United States",
    currency: "USD",
    locale: "en-US",
    timezone: "America/New_York",
    payrollLevel: "Manual entry / CSV only",
    payroll: "US statutory payroll calculation is not implemented. You can enter or import figures prepared and checked by your payroll provider, but Medash does not calculate federal, state or local taxes, Social Security, Medicare, unemployment contributions or tax filings.",
    available: ["Manual payroll entry and CSV import", "Shared HR records, documents, leave, attendance, training and internal reports", "USD, US date/number format and Eastern time-zone preference"],
    unavailable: ["Automatic federal/state/local payroll tax calculations", "Tax filings, statutory remittances or bank payments"],
  },
};

const SHARED_FEATURES = [
  "Team and employee records",
  "Document checklist and onboarding records (uploaded files remain browser-local)",
  "Leave and attendance tracking",
  "Training and performance reviews",
  "Hiring pipeline and organisation chart",
  "General HR records and activity reports",
];

export default function CountrySettings({ state, update, showToast, cloudMode = false }) {
  const code = REGIONS[state.countryCode] ? state.countryCode : "NG";
  const region = REGIONS[code];

  async function chooseCountry(nextCode) {
    const next = REGIONS[nextCode];
    if (!next) return;
    if (cloudMode) {
      try {
        await CompanyAPI.updateRegion(nextCode);
      } catch (error) {
        if (showToast) showToast(error.message || "Could not save company region to the cloud.");
        return;
      }
    }
    // Update the persisted regional preferences immediately as well as React state.
    // formatMoney/formatDate read these preferences from localStorage; writing only
    // in a React effect caused a one-render delay where payroll still used the old locale.
    try {
      const saved = loadState() || {};
      saveState({
        ...saved,
        countryCode: nextCode,
        currency: next.currency,
        locale: next.locale,
        timezone: next.timezone,
      });
    } catch {
      // React state below still updates if browser storage is unavailable.
    }
    update((s) => {
      s.countryCode = nextCode;
      s.currency = next.currency;
      s.locale = next.locale;
      s.timezone = next.timezone;
    });
    if (showToast) showToast(`Company region saved: ${next.label}`);
  }

  return (
    <section style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ color: "var(--coral)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>International setup</p>
        <h2 style={{ fontFamily: "Newsreader, serif", fontSize: 30, margin: "6px 0" }}>Country &amp; Region</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
          The selected jurisdiction is <strong style={{ color: "var(--paper)" }}>{region.label}</strong>. It sets the company’s regional preferences and determines which payroll workflow is available. Changing it does not itself make the product legally compliant with that country’s employment or tax laws.
        </p>
      </div>

      <div style={{ background: "var(--bg-2)", border: "1px solid var(--coral)", borderRadius: 12, padding: 22, marginBottom: 18 }}>
        <label htmlFor="medash-country" style={{ display: "block", fontSize: 12, marginBottom: 8, color: "var(--muted)" }}>Active company jurisdiction</label>
        <select id="medash-country" value={code} onChange={(e) => chooseCountry(e.target.value)} style={{ width: "100%", maxWidth: 460, padding: 12, background: "var(--bg)", color: "var(--paper)", border: "1px solid var(--line)", borderRadius: 7, fontSize: 14 }}>
          {Object.entries(REGIONS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
        </select>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            ["Currency preference", region.currency],
            ["Date / number format", region.locale],
            ["Time zone default", region.timezone],
            ["Payroll workflow", region.payrollLevel],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 7 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: 18, marginBottom: 18 }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>HR tools available in all three countries</h3>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", margin: "0 0 12px" }}>These are general HR record-management tools, not a guarantee of local legal compliance.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 9 }}>
          {SHARED_FEATURES.map((item) => <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "var(--bg-2)", padding: 11, borderRadius: 7, fontSize: 12, lineHeight: 1.5 }}><span style={{ color: "var(--teal)" }}>✓</span><span>{item}</span></div>)}
        </div>
      </div>

      <div style={{ border: "1px solid var(--line)", borderLeft: "4px solid var(--coral)", borderRadius: 9, padding: 18, background: "var(--bg-2)", marginBottom: 16 }}>
        <p style={{ color: "var(--coral)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 6px" }}>Selected country</p>
        <h3 style={{ fontSize: 19, margin: "0 0 10px" }}>{region.label}: what you can do now</h3>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: "0 0 14px", color: "var(--paper-dim)" }}>{region.payroll}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 16 }}>
          <div>
            <h4 style={{ fontSize: 12, margin: "0 0 8px", color: "var(--teal)" }}>Available</h4>
            {region.available.map((item) => <p key={item} style={{ fontSize: 12, lineHeight: 1.6, margin: "6px 0" }}>✓ {item}</p>)}
          </div>
          <div>
            <h4 style={{ fontSize: 12, margin: "0 0 8px", color: "var(--coral)" }}>Not available yet</h4>
            {region.unavailable.map((item) => <p key={item} style={{ fontSize: 12, lineHeight: 1.6, margin: "6px 0" }}>— {item}</p>)}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        {Object.entries(REGIONS).filter(([key]) => key !== code).map(([key, other]) => (
          <div key={key} style={{ border: "1px solid var(--line)", borderRadius: 9, padding: 15 }}>
            <h3 style={{ fontSize: 14, margin: "0 0 7px" }}>{other.label}</h3>
            <p style={{ color: "var(--muted)", fontSize: 11, margin: "0 0 8px" }}>Currency {other.currency} · {other.locale} · {other.timezone}</p>
            <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0 }}>{other.payrollLevel}: {other.payroll}</p>
            <button onClick={() => chooseCountry(key)} style={{ marginTop: 12, border: "1px solid var(--line)", borderRadius: 6, background: "transparent", color: "var(--paper)", padding: "7px 10px", fontSize: 11, cursor: "pointer" }}>Set as company jurisdiction</button>
          </div>
        ))}
      </div>

      <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.7, marginTop: 18 }}>
        Currency, date formatting and time-zone preferences are saved to the company settings. Statutory payroll calculations are currently paused in all three countries. Payroll figures must be checked by a qualified local professional; the app does not submit tax returns, statutory filings or payments.
      </p>
    </section>
  );
}
