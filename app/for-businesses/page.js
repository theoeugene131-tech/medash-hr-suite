const features = [
  { number: "01", title: "HR", subtitle: "A clearer view of your people", description: "Keep employee records, onboarding documents, leave, attendance, recruitment and performance activity organised in one workspace.", items: ["Employee records", "Leave and attendance", "Hiring and onboarding", "Documents and performance"] },
  { number: "02", title: "Payroll", subtitle: "Keep payroll work organised", description: "Prepare payroll using manual entry or supported imports, review payroll history and keep key payroll information together.", items: ["Manual payroll preparation", "Payroll history", "Country and currency settings", "Payroll reporting"] },
  { number: "03", title: "Training", subtitle: "Help your people keep learning", description: "Create and assign learning, give employees access to course lessons and assessments, and follow learning progress.", items: ["Course library and builder", "Employee learning access", "Assessments and progress", "Training records"] },
];
const steps = [
  ["Bring your people together", "Set up your organisation and keep employee information in one place."],
  ["Organise everyday work", "Manage HR activities, prepare payroll records and coordinate employee learning."],
  ["See what needs attention", "Use team information, records and reports to support better day-to-day decisions."],
];
export const metadata = {
  title: "Medash HR Suite | HR, Payroll & Employee Training",
  description: "A practical people-management workspace for growing businesses in the UK, US and Nigeria.",
};
export default function ForBusinessesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#FBF9F7", color: "#211A29", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        .medash-wrap { width: min(1160px, calc(100% - 48px)); margin: 0 auto; }
        .medash-link { text-decoration: none; transition: transform .18s ease, background .18s ease; }
        .medash-link:hover { transform: translateY(-2px); }
        .medash-primary { background: #D97762; color: white; padding: 14px 20px; border-radius: 9px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
        .medash-secondary { border: 1px solid #D8D0D8; color: #211A29; padding: 13px 19px; border-radius: 9px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
        .medash-eyebrow { color: #A34F3E; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 800; }
        .medash-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 18px; }
        .medash-card { background: white; border: 1px solid #EAE4E8; border-radius: 16px; padding: 25px; box-shadow: 0 10px 30px rgba(42,28,42,.035); }
        @media (max-width: 820px) { .medash-grid { grid-template-columns: 1fr; } .medash-hero { grid-template-columns: 1fr !important; padding-top: 52px !important; } .medash-dashboard { max-width: 620px; width: 100%; margin: 0 auto; } }
        @media (max-width: 520px) { .medash-wrap { width: min(100% - 32px, 1160px); } .medash-navlinks { gap: 12px !important; } .medash-navlinks a:not(.medash-primary) { display: none; } .medash-hero h1 { font-size: 43px !important; } }
      `}</style>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(251,249,247,.94)", backdropFilter: "blur(14px)", borderBottom: "1px solid #EEE8EB" }}>
        <div className="medash-wrap" style={{ minHeight: 76, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
          <a href="#top" className="medash-link" style={{ display: "flex", alignItems: "center", gap: 11, color: "#211A29" }}>
            <span style={{ width: 37, height: 37, borderRadius: "50% 50% 50% 7px", background: "#D97762", display: "grid", placeItems: "center", color: "white", fontWeight: 800, fontSize: 17 }}>M</span>
            <span><strong style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 21 }}>Medash</strong><small style={{ display: "block", color: "#6D6672", fontSize: 10, letterSpacing: 1.7, textTransform: "uppercase", marginTop: 2 }}>HR Suite</small></span>
          </a>
          <nav className="medash-navlinks" style={{ display: "flex", alignItems: "center", gap: 25, fontSize: 13, fontWeight: 700 }}>
            <a className="medash-link" href="#platform" style={{ color: "#6D6672" }}>Platform</a>
            <a className="medash-link" href="#how-it-works" style={{ color: "#6D6672" }}>How it works</a>
            <a className="medash-link" href="#regions" style={{ color: "#6D6672" }}>Regions</a>
            <a className="medash-link medash-primary" href="/" style={{ padding: "11px 16px" }}>Sign in <span aria-hidden="true" style={{ marginLeft: 8 }}>↗</span></a>
          </nav>
        </div>
      </header>
      <section id="top" className="medash-wrap medash-hero" style={{ display: "grid", gridTemplateColumns: "1.02fr .98fr", gap: 56, alignItems: "center", paddingTop: 82, paddingBottom: 88 }}>
        <div>
          <div className="medash-eyebrow">People operations, brought together</div>
          <h1 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(46px, 5.4vw, 68px)", lineHeight: 1.04, letterSpacing: "-2.4px", fontWeight: 600, margin: "20px 0 22px", maxWidth: 640 }}>Make managing your people feel more <span style={{ color: "#D97762", fontStyle: "italic" }}>manageable.</span></h1>
          <p style={{ color: "#6D6672", fontSize: 17, lineHeight: 1.8, maxWidth: 570, margin: 0 }}>One practical workspace for employee records, HR activity, payroll preparation and staff training — designed to help growing businesses stay organised.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
            <a className="medash-link medash-primary" href="/" style={{ minWidth: 150 }}>Access Medash <span aria-hidden="true" style={{ marginLeft: 10 }}>↗</span></a>
            <a className="medash-link medash-secondary" href="#platform">Explore the platform</a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 30, color: "#6D6672", fontSize: 12, fontWeight: 700 }}><span>✓ HR workspace</span><span>✓ Payroll records</span><span>✓ Employee learning</span></div>
        </div>
        <div className="medash-dashboard" style={{ background: "#211A29", borderRadius: 19, padding: 13, boxShadow: "0 30px 80px rgba(43,27,43,.2)", transform: "rotate(1deg)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 11px 17px", color: "#F8F2F5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 20, background: "#76B49D" }} /><span style={{ fontSize: 12, fontWeight: 700 }}>MEDASH HR SUITE</span></div><span style={{ color: "#BFB2C1", fontSize: 10 }}>WORKSPACE PREVIEW</span>
          </div>
          <div style={{ background: "#F8F6F7", borderRadius: 12, padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div><div style={{ fontSize: 10, color: "#6D6672", textTransform: "uppercase", letterSpacing: 1 }}>Your workspace</div><div style={{ fontFamily: "Georgia, serif", fontSize: 23, marginTop: 4 }}>Good morning</div></div><div style={{ borderRadius: 8, background: "#FCEAE5", color: "#A34F3E", padding: "7px 9px", fontSize: 10, fontWeight: 800 }}>UK · US · NG</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
              {["HR","Payroll","Training"].map(label=><div key={label} style={{ background: "white", border: "1px solid #ECE6EA", borderRadius: 9, padding: "13px 10px" }}><div style={{ width: 25, height: 25, borderRadius: 7, background: "#F8E5E0", marginBottom: 10, display: "grid", placeItems: "center", color: "#A34F3E", fontSize: 11, fontWeight: 800 }}>{label[0]}</div><div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div><div style={{ color: "#6D6672", fontSize: 10, marginTop: 4 }}>{label==="HR"?"People":label==="Payroll"?"Records":"Learning"}</div></div>)}
            </div>
            <div style={{ marginTop: 13, background: "white", border: "1px solid #ECE6EA", borderRadius: 9, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 13 }}><strong style={{ fontSize: 12 }}>People operations</strong><span style={{ color: "#6D6672", fontSize: 10 }}>Workspace overview</span></div>
              {["Employee information","Leave and attendance","Payroll preparation","Learning and development"].map((item,i)=><div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #F1EDF0" }}><span style={{ width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: 6, background: i===2?"#FCEAE5":"#E9F1ED", color: i===2?"#A34F3E":"#477B67", fontSize: 10, fontWeight: 800 }}>{String(i+1).padStart(2,"0")}</span><span style={{ fontSize: 11, color: "#4C4550" }}>{item}</span><span style={{ marginLeft: "auto", color: "#A69CA7", fontSize: 13 }}>›</span></div>)}
            </div>
            <p style={{ color: "#827985", fontSize: 9, margin: "12px 0 0", lineHeight: 1.5 }}>Illustrative product preview — actual workspace content depends on your account and setup.</p>
          </div>
        </div>
      </section>
      <section style={{ background: "#F0EAEE", borderTop: "1px solid #EAE2E7", borderBottom: "1px solid #EAE2E7" }}>
        <div className="medash-wrap" style={{ padding: "24px 0", display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6D6672", fontWeight: 700 }}>A practical platform for teams operating across</span>{["UNITED KINGDOM","UNITED STATES","NIGERIA"].map(x=><span key={x} style={{ fontSize: 11, letterSpacing: 1.3, fontWeight: 800, color: "#211A29" }}>{x}</span>)}
        </div>
      </section>
      <section id="platform" className="medash-wrap" style={{ paddingTop: 82, paddingBottom: 86 }}>
        <div style={{ maxWidth: 650, marginBottom: 32 }}><div className="medash-eyebrow">One suite, three core areas</div><h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(34px,4vw,47px)", lineHeight: 1.12, letterSpacing: "-1.2px", fontWeight: 600, margin: "13px 0" }}>The tools your people team works with, in one place.</h2><p style={{ color: "#6D6672", lineHeight: 1.8, fontSize: 15 }}>Move between HR, payroll and training without treating them as disconnected parts of the employee experience.</p></div>
        <div className="medash-grid">{features.map(f=><article key={f.number} className="medash-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><span style={{ fontSize: 11, letterSpacing: 1.4, color: "#A34F3E", fontWeight: 800 }}>AREA {f.number}</span><span style={{ width: 35, height: 35, borderRadius: 10, background: "#F9EAE6", color: "#A34F3E", display: "grid", placeItems: "center", fontWeight: 800 }}>{f.number}</span></div>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 29, margin: "0 0 5px" }}>{f.title}</h3><div style={{ color: "#A34F3E", fontSize: 12, fontWeight: 800, marginBottom: 14 }}>{f.subtitle}</div><p style={{ color: "#6D6672", fontSize: 13, lineHeight: 1.8, minHeight: 92 }}>{f.description}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", borderTop: "1px solid #EEE8EB" }}>{f.items.map(item=><li key={item} style={{ padding: "10px 0", borderBottom: "1px solid #F1EDF0", color: "#514A55", fontSize: 12 }}><span style={{ color: "#4D8A70", fontWeight: 800, marginRight: 9 }}>✓</span>{item}</li>)}</ul>
        </article>)}</div>
      </section>
      <section id="how-it-works" style={{ background: "#211A29", color: "#F8F3F6", padding: "78px 0" }}>
        <div className="medash-wrap"><div className="medash-eyebrow" style={{ color: "#F0A18E" }}>A simpler daily rhythm</div><h2 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(34px,4vw,46px)", fontWeight: 600, letterSpacing: "-1px", margin: "13px 0 34px" }}>From scattered tasks to a clearer workflow.</h2>
          <div className="medash-grid">{steps.map(([title,desc],i)=><div key={title} style={{ borderTop: "1px solid #594B5B", paddingTop: 20 }}><div style={{ color: "#F0A18E", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>STEP 0{i+1}</div><h3 style={{ fontFamily: "Georgia, serif", fontSize: 23, margin: "16px 0 9px" }}>{title}</h3><p style={{ color: "#C8BDCA", fontSize: 13, lineHeight: 1.8, margin: 0 }}>{desc}</p></div>)}</div>
        </div>
      </section>
      <section id="regions" className="medash-wrap" style={{ padding: "78px 0 82px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "center" }}>
        <div><div className="medash-eyebrow">Designed for more than one market</div><h2 style={{ fontFamily: "Georgia, serif", fontSize: 39, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-1px", margin: "14px 0" }}>A workspace with regional settings.</h2><p style={{ color: "#6D6672", fontSize: 14, lineHeight: 1.9 }}>Medash includes country and currency settings for organisations working in the UK, US and Nigeria. Choose the relevant jurisdiction for your organisation and keep regional context visible in the workspace.</p></div>
        <div style={{ background: "#F0EAEE", borderRadius: 16, padding: 25, display: "grid", gap: 12 }}>{[["GB","United Kingdom","Europe / UK"],["US","United States","US settings"],["NG","Nigeria","Nigeria settings"]].map(([code,name,label])=><div key={code} style={{ background: "white", border: "1px solid #E5DDE3", borderRadius: 10, padding: "15px 16px", display: "flex", alignItems: "center", gap: 13 }}><span style={{ width: 37, height: 37, borderRadius: 9, background: "#F9EAE6", color: "#A34F3E", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12 }}>{code}</span><span style={{ fontSize: 13, fontWeight: 800 }}>{name}</span><span style={{ marginLeft: "auto", color: "#6D6672", fontSize: 11 }}>{label}</span></div>)}</div>
      </section>
      <section style={{ background: "#F0EAEE", padding: "58px 0" }}><div className="medash-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 25, flexWrap: "wrap" }}><div style={{ maxWidth: 690 }}><div className="medash-eyebrow">Ready to take a closer look?</div><h2 style={{ fontFamily: "Georgia, serif", fontSize: 36, margin: "10px 0" }}>See how Medash can support your team.</h2><p style={{ color: "#6D6672", fontSize: 14, lineHeight: 1.8, margin: 0 }}>Sign in to your workspace or explore the platform overview before getting started.</p></div><a href="/" className="medash-link medash-primary">Open Medash HR Suite <span aria-hidden="true" style={{ marginLeft: 10 }}>↗</span></a></div></section>
      <footer style={{ background: "#211A29", color: "#C8BDCA", padding: "28px 0" }}><div className="medash-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 15, flexWrap: "wrap" }}><div><strong style={{ color: "white", fontFamily: "Georgia, serif", fontSize: 19 }}>Medash HR Suite</strong><div style={{ fontSize: 11, marginTop: 5 }}>People operations for growing teams.</div></div><div style={{ fontSize: 11 }}>UK · US · Nigeria <span style={{ margin: "0 8px", color: "#796A7B" }}>•</span> © {new Date().getFullYear()} Medash</div></div></footer>
    </main>
  );
}
