const ink = "#241A2A";
const muted = "#6D6370";
const coral = "#D97762";
const pale = "#F8F3F1";
const green = "#4D8A70";

export const metadata = {
  title: "Medash HR Suite | HR, Payroll & Employee Training",
  description: "A connected people-operations workspace for growing businesses, with HR management, payroll preparation and employee training across the UK, US and Nigeria.",
};

export default function ForBusinessesPage() {
  return (
    <main style={{fontFamily:"Arial, sans-serif",color:ink,background:"#fff",overflow:"hidden"}}>
      <header style={{maxWidth:1180,margin:"0 auto",padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20}}>
        <a href="#top" style={{display:"flex",alignItems:"center",gap:11,textDecoration:"none",color:ink,fontWeight:800,fontSize:21,letterSpacing:"-.6px"}}>
          <span style={{width:35,height:35,background:coral,borderRadius:"50% 50% 50% 7px",display:"grid",placeItems:"center",color:"#fff",fontFamily:"Georgia,serif"}}>M</span>
          <span>MEDASH <small style={{display:"block",fontSize:9,letterSpacing:2,color:muted,marginTop:2}}>HR SUITE</small></span>
        </a>
        <nav style={{display:"flex",alignItems:"center",gap:24,fontSize:14,flexWrap:"wrap"}}>
          <a href="#platform" style={{color:muted,textDecoration:"none"}}>Platform</a>
          <a href="#why-medash" style={{color:muted,textDecoration:"none"}}>Why Medash</a>
          <a href="#global" style={{color:muted,textDecoration:"none"}}>Global readiness</a>
          <a href="/login" style={{color:ink,textDecoration:"none",fontWeight:700}}>Log in</a>
          <a href="/login?demo=1&local=1" style={{background:coral,color:"#fff",padding:"11px 17px",borderRadius:7,textDecoration:"none",fontWeight:700}}>Explore free demo</a>
        </nav>
      </header>

      <section id="top" style={{background:pale,padding:"72px 28px 78px"}}>
        <div className="medash-hero-grid" style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"1.02fr .98fr",gap:50,alignItems:"center"}}>
          <div>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,color:coral,fontSize:12,fontWeight:800,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:20}}>
              <span style={{width:7,height:7,borderRadius:9,background:green}}/> People operations, made clearer
            </div>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(40px,5vw,66px)",lineHeight:1.04,letterSpacing:"-2.8px",margin:"0 0 22px",maxWidth:680,fontWeight:600}}>Run your people operations with <span style={{color:coral,fontStyle:"italic"}}>clarity and control.</span></h1>
            <p style={{fontSize:18,lineHeight:1.7,color:muted,maxWidth:610,margin:"0 0 30px"}}>Medash HR Suite brings HR management, payroll and employee training into one organised workspace for growing businesses.</p>
            <div style={{display:"flex",gap:13,flexWrap:"wrap"}}>
              <a href="/login?demo=1&local=1" style={{background:coral,color:"#fff",padding:"15px 22px",borderRadius:7,textDecoration:"none",fontWeight:800}}>Explore the free demo →</a>
              <a href="/login" style={{border:"1px solid #D8CDD5",color:ink,padding:"15px 22px",borderRadius:7,textDecoration:"none",fontWeight:700}}>Access your workspace</a>
            </div>
            <p style={{fontSize:12,color:muted,marginTop:15}}>Explore sample information. No payment or account required.</p>
          </div>
          <div style={{background:"#fff",border:"1px solid #E9E1E7",borderRadius:15,padding:18,boxShadow:"0 24px 70px rgba(36,26,42,.10)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 8px 17px",borderBottom:"1px solid #EEE8ED"}}>
              <div><div style={{fontWeight:800,fontSize:15}}>Workforce dashboard</div><div style={{fontSize:11,color:muted,marginTop:4}}>Illustrative product preview</div></div>
              <span style={{background:"#F9EAE6",color:"#A34F3E",padding:"6px 9px",borderRadius:20,fontSize:10,fontWeight:800}}>SAMPLE DATA</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,padding:"17px 0"}}>
              {[[ "Team members","48" ],[ "Payroll status","Ready" ],[ "Training courses","12" ],[ "Pending leave","03" ]].map(([label,value])=><div key={label} style={{background:pale,borderRadius:9,padding:17}}><div style={{fontSize:11,color:muted}}>{label}</div><div style={{fontSize:27,fontWeight:800,marginTop:8}}>{value}</div></div>)}
            </div>
            <div style={{background:ink,color:"#fff",borderRadius:9,padding:17}}>
              <div style={{fontSize:11,color:"#D6C9D4"}}>ONE CONNECTED WORKSPACE</div>
              <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
                {["HR","Payroll","Training"].map(x=><span key={x} style={{background:"rgba(255,255,255,.12)",padding:"9px 13px",borderRadius:6,fontSize:12,fontWeight:700}}>{x}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" style={{maxWidth:1180,margin:"0 auto",padding:"76px 28px"}}>
        <div style={{maxWidth:700,marginBottom:34}}>
          <div style={{color:coral,fontSize:12,fontWeight:800,letterSpacing:"1.4px",textTransform:"uppercase"}}>The Medash platform</div>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:"-1.3px",margin:"12px 0",fontWeight:600}}>Three essential areas. One connected suite.</h2>
          <p style={{color:muted,lineHeight:1.7}}>Give your team a more consistent way to manage employee information, pay processes and continuous learning.</p>
        </div>
        <div className="medash-platform-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {[
            ["01","HR Management","Organise employee records, onboarding documents, leave, attendance, recruitment and performance activities."],
            ["02","Payroll","Prepare payroll, review calculations and maintain payroll history with support for local settings and manual HR review."],
            ["03","Employee Training","Give employees access to structured learning materials, course activities, assessments and completion records."]
          ].map(([n,title,desc])=><article key={title} style={{border:"1px solid #E9E1E7",borderRadius:11,padding:25,background:"#fff"}}>
            <div style={{color:coral,fontWeight:800,fontSize:13}}>{n}</div><h3 style={{fontFamily:"Georgia,serif",fontSize:21,margin:"16px 0 10px"}}>{title}</h3><p style={{color:muted,fontSize:14,lineHeight:1.7,margin:0}}>{desc}</p>
          </article>)}
        </div>
      </section>

      <section id="why-medash" style={{background:ink,color:"#fff",padding:"70px 28px"}}>
        <div className="medash-why-grid" style={{maxWidth:1180,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:55,alignItems:"center"}}>
          <div><div style={{color:"#F0A18E",fontSize:12,fontWeight:800,letterSpacing:"1.4px"}}>BUILT FOR PRACTICAL WORK</div><h2 style={{fontFamily:"Georgia,serif",fontSize:38,letterSpacing:"-1.2px",lineHeight:1.15,margin:"14px 0 18px",fontWeight:600}}>Less scattered administration. Better workforce visibility.</h2><p style={{color:"#D2C7D2",lineHeight:1.8,fontSize:15}}>Bring day-to-day people processes into a single environment, with clear areas for HR, Payroll and Training. Start with the tools your organisation needs and build from there.</p></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {["Employee records in one place","Payroll preparation and history","Learning and course assessments","Leave and attendance workflows","Recruitment and performance tools","Role-based work areas"].map(x=><div key={x} style={{border:"1px solid rgba(255,255,255,.16)",borderRadius:8,padding:16,fontSize:13,lineHeight:1.5}}>✓ &nbsp;{x}</div>)}
          </div>
        </div>
      </section>

      <section id="global" className="medash-markets-grid" style={{maxWidth:1180,margin:"0 auto",padding:"76px 28px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center"}}>
        <div><div style={{color:coral,fontSize:12,fontWeight:800,letterSpacing:"1.4px"}}>INTERNATIONAL READINESS</div><h2 style={{fontFamily:"Georgia,serif",fontSize:36,letterSpacing:"-1px",margin:"12px 0",fontWeight:600}}>Designed with international businesses in mind.</h2><p style={{color:muted,lineHeight:1.8}}>Medash supports country and currency settings for organisations working across different regions. Country-specific payroll calculations and statutory requirements must be selected, reviewed and validated for the relevant jurisdiction before operational use.</p></div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{["United Kingdom","United States","Nigeria"].map(x=><div key={x} style={{border:"1px solid #E9E1E7",borderRadius:9,padding:"18px 20px",fontWeight:700,flex:"1 1 140px"}}>{x}<div style={{fontSize:11,color:muted,fontWeight:400,marginTop:6}}>Priority market</div></div>)}</div>
      </section>

      <section style={{background:"#F4E9E7",padding:"60px 28px",textAlign:"center"}}>
        <div style={{maxWidth:760,margin:"0 auto"}}><h2 style={{fontFamily:"Georgia,serif",fontSize:36,letterSpacing:"-1px",margin:"0 0 14px",fontWeight:600}}>See how Medash works.</h2><p style={{color:muted,lineHeight:1.7,margin:"0 0 25px"}}>Explore the sample workspace before deciding whether Medash is right for your organisation.</p><a href="/login?demo=1&local=1" style={{display:"inline-block",background:coral,color:"#fff",padding:"15px 24px",borderRadius:7,textDecoration:"none",fontWeight:800}}>Start your free demo →</a></div>
      </section>
      <footer style={{maxWidth:1180,margin:"0 auto",padding:"28px",display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",fontSize:12,color:muted}}><span>© {new Date().getFullYear()} Medash HR Suite</span><span>HR Management · Payroll · Training</span><a href="https://wa.me/2349026892077" target="_blank" rel="noreferrer" style={{color:coral,textDecoration:"none",fontWeight:700}}>WhatsApp +234 902 689 2077</a><a href="/login" style={{color:coral,textDecoration:"none",fontWeight:700}}>Client login</a></footer>
      <style>{`@media(max-width:800px){header{align-items:flex-start!important;flex-direction:column!important}header nav{gap:12px!important}.medash-hero-grid,.medash-why-grid,.medash-markets-grid{grid-template-columns:1fr!important}.medash-platform-grid{grid-template-columns:1fr!important}main section{padding-top:48px!important;padding-bottom:48px!important}}`}</style>
    </main>
  );
}
