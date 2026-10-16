"use client";

const REGIONS = {
  NG: {
    label: "Nigeria",
    currency: "NGN",
    locale: "en-NG",
    timezone: "Africa/Lagos",
    payroll: "Nigeria payroll rules are present but must be professionally checked for the current tax year before production use.",
  },
  GB: {
    label: "United Kingdom",
    currency: "GBP",
    locale: "en-GB",
    timezone: "Europe/London",
    payroll: "UK payroll calculations are not implemented yet. Do not use this app to calculate UK tax, National Insurance, pensions, or payslips.",
  },
  US: {
    label: "United States",
    currency: "USD",
    locale: "en-US",
    timezone: "America/New_York",
    payroll: "US payroll calculations are not implemented yet. Do not use this app to calculate federal/state tax, Social Security, Medicare, or payslips.",
  },
};

export default function CountrySettings({ state, update, showToast }) {
  const code = REGIONS[state.countryCode] ? state.countryCode : "NG";
  const region = REGIONS[code];

  function chooseCountry(nextCode) {
    const next = REGIONS[nextCode];
    if (!next) return;
    update((s) => {
      s.countryCode = nextCode;
      s.currency = next.currency;
      s.locale = next.locale;
      s.timezone = next.timezone;
    });
    if (showToast) showToast(`Country settings saved: ${next.label}`);
  }

  return (
    <section style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ color: "var(--coral)", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>International setup</p>
        <h2 style={{ fontFamily: "Newsreader, serif", fontSize: 30, margin: "6px 0" }}>Country &amp; Region</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>
          Choose the country where this company primarily operates. This saves the company’s regional preferences; it does not automatically make every HR or payroll rule compliant with local law.
        </p>
      </div>

      <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 12, padding: 22, marginBottom: 16 }}>
        <label htmlFor="medash-country" style={{ display: "block", fontSize: 12, marginBottom: 8, color: "var(--muted)" }}>Company country</label>
        <select id="medash-country" value={code} onChange={(e) => chooseCountry(e.target.value)} style={{ width: "100%", maxWidth: 460, padding: 12, background: "var(--bg)", color: "var(--paper)", border: "1px solid var(--line)", borderRadius: 7, fontSize: 14 }}>
          {Object.entries(REGIONS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginTop: 20 }}>
          {[
            ["Currency preference", region.currency],
            ["Date / number format", region.locale],
            ["Time zone default", region.timezone],
          ].map(([label, value]) => (
            <div key={label} style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: 14 }}>
              <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 7 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ border: "1px solid var(--line)", borderLeft: "4px solid var(--coral)", borderRadius: 8, padding: 18, background: "var(--bg-2)", marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, margin: "0 0 8px" }}>Payroll readiness for {region.label}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0, color: "var(--paper-dim)" }}>{region.payroll}</p>
      </div>

      <div style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>
        <strong style={{ color: "var(--paper)" }}>What this setting currently does:</strong> stores the selected company country, currency preference, locale, and time zone in this app’s saved state. The currency preference is not yet applied to every amount shown in the app, and changing the country does not change the existing Nigerian payroll calculations.
      </div>
    </section>
  );
}
