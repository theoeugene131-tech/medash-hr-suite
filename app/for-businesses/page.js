import Link from "next/link";

const features = [
  ["Employee records", "Keep employee profiles and key work details organised in one place."],
  ["Leave management", "Record leave requests and give managers a clearer view of team absences."],
  ["Attendance", "Maintain attendance records and review work patterns."],
  ["Hiring and onboarding", "Track candidates and organise onboarding information."],
  ["Documents and training", "Bring important HR documents, learning and reviews into a shared workflow."],
  ["Reports and team structure", "Give HR teams a clearer view of people, departments and activity."],
];

export const metadata = {
  title: "Medash HR Suite | HR management for growing teams",
  description: "Explore Medash HR Suite for employee records, leave, attendance, hiring, training and HR workflows for growing businesses.",
};

export default function ForBusinessesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#241623", color: "#EDEEF2", fontFamily: "Arial, sans-serif" }}>
      <header style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50% 50% 50% 6px", background: "#E2735B" }} />
          <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 23, fontWeight: 700 }}>Medash HR Suite</span>
        </div>
        <a href="https://wa.me/2348026892077?text=Hello%2C%20I%27d%20like%20to%20see%20a%20Medash%20HR%20Suite%20demo." target="_blank" rel="noreferrer" style={{ color: "#EDEEF2", border: "1px solid #735A70", borderRadius: 8, padding: "11px 16px", textDecoration: "none", fontSize: 14 }}>Request a demo</a>
      </header>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "68px 24px 76px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", alignItems: "center", gap: 44 }}>
        <div>
          <p style={{ color: "#E2735B", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>People operations, made clearer</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(38px, 6vw, 62px)", lineHeight: 1.08, letterSpacing: -1.5, margin: "18px 0" }}>Spend less time chasing HR details.</h1>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: "#D4C6D1", maxWidth: 590 }}>Bring employee information, leave, attendance, hiring, training and everyday HR workflows into one organised workspace for your team.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            <a href="https://wa.me/2348026892077?text=Hello%2C%20I%27d%20like%20to%20book%20a%20Medash%20HR%20Suite%20demo%20for%20my%20business." target="_blank" rel="noreferrer" style={{ background: "#E2735B", color: "#fff", borderRadius: 8, padding: "14px 20px", textDecoration: "none", fontWeight: 700 }}>Book a product demo ↗</a>
            <a href="#features" style={{ border: "1px solid #735A70", color: "#EDEEF2", borderRadius: 8, padding: "14px 20px", textDecoration: "none" }}>Explore features</a>
          </div>
          <p style={{ color: "#B39FB0", fontSize: 12, lineHeight: 1.7, marginTop: 18 }}>For growing businesses in the UK, US and Nigeria. Ask us about fit, setup and availability.</p>
        </div>
        <div style={{ background: "#2E1D2D", border: "1px solid #4A3447", borderRadius: 18, padding: 24, boxShadow: "0 22px 70px rgba(0,0,0,.2)" }}>
          <p style={{ color: "#B39FB0", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>One HR workspace</p>
          {["People and employee records", "Leave and attendance", "Hiring and onboarding", "Training and reviews", "HR reporting"].map((item, i) => (
            <div key={item} style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 0", borderBottom: i === 4 ? 0 : "1px solid #4A3447" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "#463044", color: "#F1B2A4", display: "grid", placeItems: "center", fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</div>
              <span style={{ fontSize: 14 }}>{item}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: 14, borderRadius: 10, background: "#241623", color: "#D4C6D1", fontSize: 12, lineHeight: 1.7 }}>Product note: UK and US payroll calculations are not yet available. We will not describe them as supported until the relevant rules are implemented and tested.</div>
        </div>
      </section>

      <section id="features" style={{ background: "#F3F0F4", color: "#241623", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ color: "#A84D3C", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Built around everyday HR work</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(30px, 4vw, 42px)", margin: "12px 0 28px" }}>The essentials, in one place.</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {features.map(([title, description]) => (
              <article key={title} style={{ background: "#fff", border: "1px solid #E3DCE4", borderRadius: 12, padding: 22 }}>
                <h3 style={{ fontSize: 17, margin: "0 0 10px" }}>{title}</h3>
                <p style={{ color: "#655A66", fontSize: 14, lineHeight: 1.75, margin: 0 }}>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "64px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, lineHeight: 1.2, margin: "0 0 14px" }}>See if Medash fits your team.</h2>
          <p style={{ color: "#D4C6D1", fontSize: 15, lineHeight: 1.8 }}>Tell us about your organisation and the HR work you want to simplify. We can discuss a walkthrough and the next steps before you commit.</p>
        </div>
        <div style={{ background: "#2E1D2D", border: "1px solid #4A3447", borderRadius: 14, padding: 24 }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, marginTop: 0 }}>When you contact us, include:</p>
          <ul style={{ color: "#D4C6D1", fontSize: 14, lineHeight: 2, paddingLeft: 20 }}>
            <li>Your country and business type</li>
            <li>Approximate employee count</li>
            <li>The HR tasks you want to improve</li>
            <li>Whether payroll is a must-have</li>
          </ul>
          <a href="https://wa.me/2348026892077?text=Hello%2C%20I%27m%20interested%20in%20Medash%20HR%20Suite.%20Country%3A%20%5BUK%2FUS%2FNigeria%5D.%20Business%20type%3A%20%5Btype%5D.%20Team%20size%3A%20%5Bnumber%5D.%20HR%20needs%3A%20%5Bneeds%5D." target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#E2735B", color: "#fff", borderRadius: 8, padding: "13px 17px", textDecoration: "none", fontWeight: 700 }}>Talk to Medash ↗</a>
        </div>
      </section>
      <footer style={{ borderTop: "1px solid #4A3447", maxWidth: 1120, margin: "0 auto", padding: "22px 24px 32px", color: "#B39FB0", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} Medash HR Suite · Next Level Global</span>
        <span>UK · US · Nigeria</span>
      </footer>
    </main>
  );
}
