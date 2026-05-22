export const doctorLandingStyles = String.raw`
@property --ra{syntax:"<angle>";initial-value:0deg;inherits:false}

:root{
  --bg:#0C1017;--s1:#0F1620;--s2:#131C28;
  --bl:#3B82C8;--bl2:#2E6BA8;
  --lt:#F3F2EF;--lt2:#E8E6E0;--lt3:#DDDAD2;
  --w:#FFFFFF;
  --d1:#1A1A17;--d2:#4A4840;--d3:#7A7870;--d4:#9A978F;
  --grn:#5CB882;--gld:#D4A840;--ter:#E8772E;--red:#D42020;
  --f:'Outfit',system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.32,1,.68,1);
  --spring:cubic-bezier(.34,1.56,.64,1);
  --nav-h:64px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--f);background:var(--bg);color:var(--d1);overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
button{cursor:pointer;font-family:var(--f);border:none}

.mx{max-width:1100px;margin:0 auto;padding:0 clamp(20px,5vw,52px)}

/* ── NAV ── */
#nav{
  position:fixed;top:0;left:0;right:0;z-index:200;height:var(--nav-h);
  display:flex;align-items:center;padding:0 clamp(20px,5vw,52px);
  transition:background .35s,box-shadow .35s;
}
#nav.scrolled{background:rgba(12,16,23,.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 1px 0 rgba(255,255,255,.07)}
.nav-logo{flex:1;display:flex;align-items:center;gap:10px}
.nav-mark{width:30px;height:30px;border-radius:8px;background:var(--bl);display:flex;align-items:center;justify-content:center}
.nav-name{font-size:17px;font-weight:700;color:#fff;letter-spacing:-.02em}
.nav-for{font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,.35);padding:3px 10px;border-radius:100px;border:1px solid rgba(255,255,255,.1);margin-left:4px;display:none}
@media(min-width:500px){.nav-for{display:inline}}
.nav-r{display:flex;align-items:center;gap:8px}
.nav-in{font-size:13px;font-weight:600;color:rgba(255,255,255,.45);padding:8px 12px;transition:color .2s}
.nav-in:hover{color:rgba(255,255,255,.75)}
.nav-btn{font-size:13px;font-weight:700;color:#fff;background:var(--bl);padding:9px 20px;border-radius:100px;transition:background .2s,transform .15s}
.nav-btn:hover{background:var(--bl2);transform:translateY(-1px)}

/* ══════════════════════════════════════
   HERO — ring floats free, not in card
══════════════════════════════════════ */
#hero{
  min-height:100svh;background:var(--bg);
  padding-top:var(--nav-h);
  position:relative;overflow:hidden;
  display:flex;flex-direction:column;
}
/* Noise texture overlay */
#hero::before{
  content:'';position:absolute;inset:0;z-index:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity:.028;pointer-events:none;
}
.hero-glow{
  position:absolute;pointer-events:none;border-radius:50%;filter:blur(80px);
  transition:opacity 1.5s;
}
.hero-glow-1{width:600px;height:600px;top:-100px;right:-100px;background:radial-gradient(circle,rgba(59,130,200,.14) 0%,transparent 65%)}
.hero-glow-2{width:400px;height:400px;bottom:0;left:-80px;background:radial-gradient(circle,rgba(92,184,130,.08) 0%,transparent 65%)}

.hero-body{
  position:relative;z-index:1;flex:1;
  display:flex;flex-direction:column;justify-content:center;
  padding:clamp(32px,7vh,72px) 0 clamp(20px,4vh,40px);
}
.hero-grid{
  display:grid;grid-template-columns:1fr;
  gap:clamp(40px,6vw,72px);align-items:center;
}
.hero-ring-side{order:2}
.hero-copy{order:1}
@media(min-width:768px){.hero-grid{grid-template-columns:1fr 1fr}.hero-ring-side{order:0}.hero-copy{order:0}}

/* Copy */
.hero-tag{
  display:inline-flex;align-items:center;gap:7px;
  font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--bl);margin-bottom:clamp(18px,3vh,26px);
}
.hero-tag-pulse{width:7px;height:7px;border-radius:50%;background:var(--bl);position:relative}
.hero-tag-pulse::after{
  content:'';position:absolute;inset:-4px;border-radius:50%;
  border:1.5px solid var(--bl);opacity:.5;
  animation:ping 2s ease-out infinite;
}
@keyframes glowPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.65;transform:scale(1.08)}}
@keyframes ping{0%{transform:scale(.8);opacity:.6}100%{transform:scale(1.8);opacity:0}}

.hero-h1{
  font-size:clamp(32px,5.8vw,60px);
  font-weight:900;line-height:1.05;letter-spacing:-.045em;
  color:#fff;margin-bottom:clamp(16px,2.5vh,22px);
}
.hero-h1 .hl{
  background:linear-gradient(135deg,var(--bl) 0%,#7CB9F0 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.hero-h1 .hl2{color:var(--grn);-webkit-text-fill-color:var(--grn)}

.hero-sub{
  font-size:clamp(15px,2.5vw,18px);color:rgba(255,255,255,.58);
  line-height:1.7;max-width:500px;margin-bottom:clamp(24px,4vh,36px);
}
.hero-sub strong{color:rgba(255,255,255,.82);font-weight:600}

.hero-btns{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:clamp(20px,3vh,30px)}
.btn-p{
  display:inline-flex;align-items:center;gap:8px;
  padding:clamp(14px,3vw,17px) clamp(22px,4vw,30px);
  border-radius:100px;background:var(--bl);
  font-size:clamp(14px,3vw,16px);font-weight:700;color:#fff;
  box-shadow:0 4px 28px rgba(59,130,200,.4);
  transition:background .2s,transform .2s var(--spring),box-shadow .2s;
}
.btn-p:hover{background:var(--bl2);transform:translateY(-2px);box-shadow:0 8px 36px rgba(59,130,200,.45)}
.btn-g{
  display:inline-flex;align-items:center;gap:6px;
  padding:clamp(13px,3vw,16px) clamp(18px,3.5vw,24px);
  border-radius:100px;background:transparent;
  font-size:clamp(13px,2.8vw,15px);font-weight:600;color:rgba(255,255,255,.6);
  border:1.5px solid rgba(255,255,255,.13);
  transition:color .2s,border-color .2s;
}
.btn-g:hover{color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.28)}

.hero-creds{display:flex;flex-wrap:wrap;gap:clamp(12px,3vw,20px)}
.hero-cred{
  display:flex;align-items:center;gap:5px;
  font-size:13px;font-weight:600;color:rgba(255,255,255,.58);
}
.hero-cred svg{opacity:.45;flex-shrink:0}

/* Ring — free floating, no card container */
.hero-ring-side{
  display:flex;flex-direction:column;align-items:center;
  position:relative;
}
.ring-free{
  position:relative;
  width:clamp(200px,52vw,380px);height:clamp(200px,52vw,380px);
  margin:0 auto;
}
/* Glow ring behind */
.ring-glow-bg{
  position:absolute;inset:-30px;border-radius:50%;
  transition:background 1.5s;
  filter:blur(48px);opacity:.55;animation:glowPulse 4s ease-in-out infinite;pointer-events:none;
  background:var(--red);
}
.ring-trk{
  position:absolute;inset:0;border-radius:50%;
  background:rgba(255,255,255,.07);
  -webkit-mask:radial-gradient(closest-side,transparent 82%,#000 82.5%,#000 96%,transparent 96.5%);
  mask:radial-gradient(closest-side,transparent 82%,#000 82.5%,#000 96%,transparent 96.5%);
}
.ring-fill{
  position:absolute;inset:0;border-radius:50%;
  background:conic-gradient(from 180deg,#5CB882 0%,#7EBC6C 14%,#9AB854 28%,#C4B044 42%,#D4A840 52%,#CC8844 66%,#E8772E 78%,#D03030 90%,#D42020 100%);
  -webkit-mask-image:radial-gradient(closest-side,transparent 82%,#000 82.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));
  -webkit-mask-composite:source-in;
  mask-image:radial-gradient(closest-side,transparent 82%,#000 82.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));
  mask-composite:intersect;
  transition:--ra 4s cubic-bezier(.25,0,.1,1);--ra:0deg;
}
@supports not(mask-composite:intersect){.ring-fill{-webkit-mask-image:radial-gradient(closest-side,transparent 82%,#000 82.5%,#000 96%,transparent 96.5%);mask-image:radial-gradient(closest-side,transparent 82%,#000 82.5%,#000 96%,transparent 96.5%)}}
.ring-center{
  position:absolute;inset:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center;
}
.ring-num{
  font-size:clamp(56px,14vw,88px);font-weight:900;line-height:1;
  letter-spacing:-.06em;transition:color 1s;
}
.ring-lbl{
  font-size:11px;font-weight:700;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(255,255,255,.38);margin-top:3px;
}

/* Floating data points around the ring */
.ring-data{
  position:absolute;
  box-shadow:0 4px 20px rgba(0,0,0,.4);
  background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.1);
  border-radius:10px;
  padding:7px 11px;
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
  transition:opacity .8s,transform .8s var(--ease);
}
.ring-data-name{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:2px}
.ring-data-val{font-size:13px;font-weight:800;color:#fff;letter-spacing:-.01em}
.ring-data-flag{font-size:10px;font-weight:600}
.rd-crp{top:-8px;right:-36px}
.rd-nlr{bottom:14px;right:-40px}
.rd-glu{bottom:-8px;left:-20px}
.rd-hdl{top:16px;left:-44px}

.ring-verdict{
  margin-top:clamp(12px,2.5vh,18px);
  text-align:center;max-width:260px;
  font-size:13px;line-height:1.6;color:rgba(255,255,255,.5);
  transition:color .8s;
}
.ring-verdict strong{font-weight:700;transition:color .8s}

/* Marker chips row */
.ring-chips{
  display:flex;flex-wrap:wrap;justify-content:center;gap:6px;
  margin-top:12px;max-width:300px;
}
.ring-chip{
  font-size:11px;font-weight:700;
  padding:4px 10px;border-radius:100px;
  background:rgba(255,255,255,.06);
  color:rgba(255,255,255,.5);
  border:1px solid rgba(255,255,255,.08);
  transition:background .6s,color .6s,border-color .6s;
}
.ring-chip.hi{background:rgba(212,32,32,.12);color:#E87070;border-color:rgba(212,32,32,.2)}
.ring-chip.mid{background:rgba(232,119,46,.1);color:#E8A070;border-color:rgba(232,119,46,.18)}
.ring-chip.ok{background:rgba(92,184,130,.1);color:var(--grn);border-color:rgba(92,184,130,.18)}

/* Mobile: copy on top, ring below */
@media(max-width:767px){
  .hero-ring-side{order:0;margin-top:0}
  .hero-copy{order:1}
}

/* ══════════════════════════════════════
   PROOF BAR — typographic anchor
══════════════════════════════════════ */
#proof{
  background:var(--s1);
  border-top:1px solid rgba(255,255,255,.06);
  border-bottom:1px solid rgba(255,255,255,.06);
  padding:clamp(28px,5vh,48px) 0;overflow:hidden;
}
.proof-inner{
  display:flex;align-items:center;
  gap:0;
}
.proof-big{
  flex:0 0 auto;
  font-size:clamp(80px,18vw,140px);
  font-weight:900;letter-spacing:-.06em;line-height:.9;
  color:var(--grn);
  position:relative;
  padding-right:clamp(24px,4vw,40px);
  margin-right:clamp(24px,4vw,40px);
  border-right:1px solid rgba(255,255,255,.08);
}
.proof-big sup{
  font-size:.28em;vertical-align:super;
  letter-spacing:0;color:rgba(92,184,130,.6);
  font-weight:700;
}
.proof-big-label{
  font-size:clamp(13px,2.5vw,14px);font-weight:700;
  letter-spacing:.10em;text-transform:uppercase;
  color:rgba(255,255,255,.35);
  margin-top:4px;
}
.proof-stats{
  flex:1;display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:clamp(16px,3vw,28px) clamp(20px,4vw,40px);
}
@media(min-width:640px){.proof-stats{grid-template-columns:repeat(3,1fr)}}
.proof-stat-n{
  font-size:clamp(24px,5vw,36px);font-weight:900;
  letter-spacing:-.04em;color:#fff;line-height:1;
}
.proof-stat-l{
  font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  color:rgba(255,255,255,.32);margin-top:4px;line-height:1.4;
}
.proof-stat-note{font-size:10px;color:rgba(255,255,255,.2);margin-top:2px}

/* ══════════════════════════════════════
   CLINICAL TOOL — light
══════════════════════════════════════ */
#clinical{background:var(--lt);padding:clamp(60px,10vh,100px) 0}
.section-tag{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
.section-h2{font-size:clamp(26px,4.5vw,44px);font-weight:900;letter-spacing:-.04em;line-height:1.1;margin-bottom:clamp(12px,2vh,18px)}
.section-body{font-size:clamp(15px,2.5vw,17px);line-height:1.7;margin-bottom:clamp(28px,5vh,44px)}

.clinical-split{display:grid;grid-template-columns:1fr;gap:clamp(36px,5vw,64px);align-items:start}
@media(min-width:768px){.clinical-split{grid-template-columns:1fr 1fr}}

.time-badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:10px 18px;border-radius:100px;
  background:rgba(92,184,130,.1);border:1px solid rgba(92,184,130,.2);
  font-size:clamp(14px,3vw,16px);font-weight:700;color:var(--grn);
  margin-bottom:clamp(20px,4vh,28px);
}

.step-list{display:flex;flex-direction:column;gap:0}
.step-row{
  display:flex;gap:16px;padding:clamp(16px,3vh,22px) 0;
  border-bottom:1px solid var(--lt2);
}
.step-row:last-child{border-bottom:none}
.step-n{
  width:34px;height:34px;border-radius:50%;
  background:rgba(59,130,200,.1);color:var(--bl);
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;flex-shrink:0;margin-top:2px;
}
.step-title{font-size:clamp(14px,2.8vw,16px);font-weight:700;color:var(--d1);margin-bottom:4px}
.step-desc{font-size:clamp(13px,2.5vw,14px);color:var(--d3);line-height:1.65}
.step-time{
  display:inline-flex;align-items:center;gap:4px;margin-top:8px;
  padding:3px 10px;border-radius:100px;background:rgba(92,184,130,.1);
  color:var(--grn);font-size:11px;font-weight:700;
}

/* 8 markers */
.markers-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mk-card{
  padding:13px 15px;background:var(--w);border-radius:12px;
  border:1px solid var(--lt2);cursor:default;
  transition:border-color .2s var(--spring),transform .2s var(--spring),box-shadow .2s;
}
.mk-card:hover{border-color:rgba(59,130,200,.4);transform:translateY(-2px);box-shadow:0 4px 20px rgba(59,130,200,.1)}
.mk-name{font-size:13px;font-weight:800;color:var(--d1)}
.mk-full{font-size:11px;color:var(--d4);margin-top:2px;line-height:1.4}
.mk-tag{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--bl);margin-top:7px}

/* ══════════════════════════════════════
   ANXIETIES — dark
══════════════════════════════════════ */
#anxieties{
  background:var(--bg);
  padding:clamp(60px,10vh,100px) 0;
}
.anxiety-grid{
  display:grid;grid-template-columns:1fr;gap:14px;
  margin-top:clamp(28px,5vh,44px);
}
@media(min-width:540px){.anxiety-grid{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.anxiety-grid{grid-template-columns:1fr 1fr 1fr 1fr}}

.ax-card{
  padding:clamp(20px,3.5vw,26px);
  background:var(--w);
  border:1px solid var(--lt2);
  border-radius:18px;
  transition:background .2s,border-color .2s,transform .2s var(--spring);
  position:relative;overflow:hidden;
  box-shadow:0 2px 12px rgba(0,0,0,.04);
}
.ax-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  transition:opacity .3s;opacity:0;
}
.ax-card:hover{background:rgba(255,255,255,.055);border-color:rgba(255,255,255,.14);transform:translateY(-3px)}
.ax-card:hover::before{opacity:1}
.ax-card.a1::before{background:var(--bl)}
.ax-card.a2::before{background:var(--gld)}
.ax-card.a3::before{background:var(--grn)}
.ax-card.a4::before{background:var(--ter)}

.ax-ico{
  width:38px;height:38px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:14px;
}
.ax-q{font-size:clamp(14px,2.8vw,16px);font-weight:800;color:var(--d1);margin-bottom:9px;line-height:1.35}
.ax-a{font-size:clamp(14px,2.8vw,15px);color:var(--d3);line-height:1.7}
.ax-a strong{color:rgba(255,255,255,.78);font-weight:600}

/* ══════════════════════════════════════
   INCOME — light, TWO SEPARATE ZONES
══════════════════════════════════════ */
#income{background:var(--lt);padding:clamp(60px,10vh,100px) 0}

.income-zone{
  border-radius:20px;margin-bottom:16px;
  overflow:hidden;
}

/* Zone 1 — Clinical (always included) */
.zone-clinical{
  border:2px solid rgba(59,130,200,.25);
  background:var(--w);
}
.zone-hd{
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
  padding:clamp(18px,3vw,24px) clamp(20px,4vw,28px);
  border-bottom:1px solid var(--lt2);
}
.zone-title{font-size:clamp(15px,3vw,17px);font-weight:800;color:var(--d1);display:flex;align-items:center;gap:10px}
.zone-badge{
  font-size:10px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;
  padding:4px 12px;border-radius:100px;
}
.zb-clinical{background:rgba(59,130,200,.1);color:var(--bl)}
.zb-opt{background:rgba(212,168,64,.1);color:#906010;border:1.5px dashed rgba(212,168,64,.3)}
.zone-body{display:grid;grid-template-columns:1fr 1fr;padding:clamp(16px,3vw,22px) clamp(20px,4vw,28px);gap:clamp(16px,3vw,24px)}
@media(max-width:540px){.zone-body{grid-template-columns:1fr}}

.stream{padding:0}
.stream-num{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;color:var(--bl)}
.stream-title{font-size:clamp(14px,2.8vw,16px);font-weight:800;color:var(--d1);margin-bottom:6px}
.stream-desc{font-size:clamp(13px,2.5vw,14px);color:var(--d3);line-height:1.65}
.stream-eg{
  margin-top:10px;padding:9px 12px;border-radius:10px;
  font-size:12px;line-height:1.55;font-weight:600;
}
.stream-eg.bl{background:rgba(59,130,200,.07);color:var(--bl2)}
.stream-eg.gd{background:rgba(212,168,64,.08);color:#7A6010}



.zone-opt-label{
  position:absolute;top:-12px;left:50%;transform:translateX(-50%);
  background:var(--lt);padding:2px 14px;
  font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(212,168,64,.7);border:1px solid rgba(212,168,64,.3);border-radius:100px;
  white-space:nowrap;
}


.income-note{
  margin-top:12px;padding:14px 18px;border-radius:12px;
  border-left:3px solid var(--bl);background:rgba(59,130,200,.05);
  font-size:13px;color:var(--d2);line-height:1.65;
}
.income-note strong{color:var(--d1)}

/* ══════════════════════════════════════
   DR. SHANE — dark, with quote as anchor
══════════════════════════════════════ */
#shane{
  background:var(--s2);
  padding:clamp(60px,10vh,100px) 0;
  position:relative;overflow:hidden;
}
#shane::before{
  content:'';position:absolute;
  top:-200px;right:-200px;
  width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(59,130,200,.06) 0%,transparent 65%);
  pointer-events:none;
}
.shane-layout{display:grid;grid-template-columns:1fr;gap:clamp(36px,6vw,64px);align-items:center}
@media(min-width:768px){.shane-layout{grid-template-columns:1fr 1fr}}

.shane-quote-wrap{position:relative}
.shane-quote-mark{
  font-size:clamp(80px,18vw,140px);line-height:.7;
  color:var(--bl);opacity:.18;font-weight:900;
  position:absolute;top:0;left:-8px;pointer-events:none;
  font-family:Georgia,serif;
}
.shane-quote{
  font-size:clamp(18px,3.5vw,26px);font-weight:500;font-style:italic;
  color:rgba(255,255,255,.85);line-height:1.55;
  padding-top:clamp(40px,8vw,64px);padding-left:clamp(12px,2vw,16px);
  letter-spacing:-.01em;
}
.shane-attr{
  display:flex;align-items:center;gap:12px;
  margin-top:clamp(18px,3vh,24px);padding-left:clamp(12px,2vw,16px);
}
.shane-avatar{
  width:48px;height:48px;border-radius:12px;background:var(--bl);
  display:flex;align-items:center;justify-content:center;
  font-size:16px;font-weight:800;color:#fff;flex-shrink:0;
  border:2px solid rgba(59,130,200,.4);
}
.shane-name{font-size:14px;font-weight:700;color:#fff}
.shane-title{font-size:12px;color:rgba(255,255,255,.42);margin-top:2px}

.shane-data{display:flex;flex-direction:column;gap:12px}
.shane-stat{
  padding:clamp(16px,3vw,20px);
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  border-radius:14px;
}
.shane-stat-n{
  font-size:clamp(28px,6vw,40px);font-weight:900;letter-spacing:-.04em;line-height:1;
}
.shane-stat-l{
  font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
  color:rgba(255,255,255,.38);margin-top:5px;line-height:1.4;
}
.shane-stat-note{font-size:11px;color:rgba(255,255,255,.22);margin-top:3px}

/* ══════════════════════════════════════
   PEERS — cream, VIBER-STYLE chat bubbles
══════════════════════════════════════ */
#peers{
  background:var(--lt);
  padding:clamp(60px,10vh,100px) 0;
}
.viber-cols{
  display:grid;grid-template-columns:1fr;gap:clamp(20px,3vw,28px);
  margin-top:clamp(28px,5vh,44px);
}
@media(min-width:640px){.viber-cols{grid-template-columns:1fr 1fr}}
@media(min-width:960px){.viber-cols{grid-template-columns:1fr 1fr 1fr}}

.viber-thread{
  background:var(--w);border-radius:16px;
  border:1px solid var(--lt2);
  overflow:hidden;
}
.viber-header{
  display:flex;align-items:center;gap:10px;
  padding:12px 16px;border-bottom:1px solid var(--lt2);
  background:var(--lt);
}
.viber-av{
  width:36px;height:36px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:800;color:#fff;flex-shrink:0;
}
.viber-dr-name{font-size:13px;font-weight:700;color:var(--d1)}
.viber-dr-spec{font-size:11px;color:var(--d4);margin-top:1px}

.viber-body{padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px}
.chat-bubble{
  max-width:90%;padding:10px 13px;border-radius:14px;
  font-size:clamp(14px,2.8vw,15px);line-height:1.6;
}
.chat-in{
  align-self:flex-start;
  background:rgba(59,130,200,.08);color:var(--d2);
  border-radius:4px 14px 14px 14px;
}
.chat-out{
  align-self:flex-end;
  background:var(--bl);color:#fff;
  border-radius:14px 14px 4px 14px;
}
.chat-time{align-self:flex-end;font-size:10px;color:var(--d4);margin-top:-4px}

/* ══════════════════════════════════════
   CTA — dark, single strong path
══════════════════════════════════════ */
#cta{
  background:var(--bg);
  padding:clamp(60px,12vh,110px) 0;
  position:relative;overflow:hidden;
}
.cta-glow{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);
  width:600px;height:600px;border-radius:50%;
  background:radial-gradient(circle,rgba(59,130,200,.07) 0%,transparent 65%);
  pointer-events:none;
}
.cta-inner{position:relative;z-index:1;text-align:center}
.cta-tag{
  display:inline-flex;align-items:center;gap:7px;
  font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--bl);margin-bottom:clamp(16px,3vh,22px);
}
.cta-h2{
  font-size:clamp(28px,5.5vw,54px);font-weight:900;letter-spacing:-.04em;
  line-height:1.08;color:#fff;max-width:640px;
  margin:0 auto clamp(12px,2vh,16px);
}
.cta-sub{
  font-size:clamp(14px,2.5vw,17px);color:rgba(255,255,255,.5);
  max-width:460px;margin:0 auto clamp(32px,6vh,52px);line-height:1.7;
}

/* Two path cards */
.cta-cards{
  display:grid;grid-template-columns:1fr;gap:12px;
  max-width:640px;margin:0 auto;
}


.cta-card{
  padding:clamp(20px,4vw,28px);border-radius:18px;
  text-align:left;
  transition:transform .2s var(--spring),box-shadow .2s;
}
.cta-card:hover{transform:translateY(-3px)}
.cta-card-primary{
  background:var(--bl);
  box-shadow:0 8px 40px rgba(59,130,200,.4);
}
.cta-card-primary:hover{box-shadow:0 16px 56px rgba(59,130,200,.5)}


.cta-card-tag{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px}
.cta-card-primary .cta-card-tag{color:rgba(255,255,255,.6)}

.cta-card-title{font-size:clamp(17px,3.5vw,21px);font-weight:900;letter-spacing:-.03em;margin-bottom:7px}
.cta-card-primary .cta-card-title{color:#fff}

.cta-card-desc{font-size:clamp(13px,2.5vw,14px);line-height:1.6;margin-bottom:16px}
.cta-card-primary .cta-card-desc{color:rgba(255,255,255,.7)}

.cta-card-btn{
  display:inline-flex;align-items:center;gap:5px;
  padding:10px 18px;border-radius:100px;
  font-size:13px;font-weight:700;
  transition:background .2s;
}
.cta-card-primary .cta-card-btn{background:rgba(255,255,255,.18);color:#fff}
.cta-card-primary .cta-card-btn:hover{background:rgba(255,255,255,.26)}



.cta-note{margin-top:clamp(16px,3vh,22px);font-size:12px;color:rgba(255,255,255,.28);max-width:440px;margin-left:auto;margin-right:auto}
.cta-note a{color:rgba(59,130,200,.6);text-decoration:underline;text-underline-offset:3px}

/* ── FOOTER ── */
#footer{
  background:rgba(0,0,0,.3);border-top:1px solid rgba(255,255,255,.05);
  padding:clamp(20px,4vh,32px) 0;
}
.foot-inner{
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:10px;
}
.foot-logo{display:flex;align-items:center;gap:8px}
.foot-mark{width:22px;height:22px;border-radius:6px;background:var(--bl);display:flex;align-items:center;justify-content:center}
.foot-name{font-size:13px;font-weight:700;color:rgba(255,255,255,.42)}
.foot-links{display:flex;gap:16px}
.foot-link{font-size:11px;color:rgba(255,255,255,.25);transition:color .2s}
.foot-link:hover{color:rgba(255,255,255,.55)}
.foot-copy{font-size:11px;color:rgba(255,255,255,.18)}

/* ── SCROLL REVEAL — varied motion ── */
.rv{opacity:0;transition:opacity .7s var(--ease),transform .7s var(--ease)}
.rv.in{opacity:1;transform:none!important}
.rv-up{transform:translateY(28px)}
.rv-left{transform:translateX(-24px)}
.rv-right{transform:translateX(24px)}
.rv-scale{transform:scale(.94)}
.rv-d1{transition-delay:.1s}
.rv-d2{transition-delay:.2s}
.rv-d3{transition-delay:.3s}
.rv-d4{transition-delay:.4s}
.rv-d5{transition-delay:.5s}
.rd-crp{animation:floatA 5s ease-in-out infinite}
.rd-nlr{animation:floatB 6s ease-in-out infinite}
.rd-hdl{animation:floatC 5.5s ease-in-out infinite}
.rd-glu{animation:floatD 4.8s ease-in-out infinite}
@keyframes floatA{0%,100%{transform:translate(0,0)}50%{transform:translate(2px,-4px)}}
@keyframes floatB{0%,100%{transform:translate(0,0)}50%{transform:translate(-3px,3px)}}
@keyframes floatC{0%,100%{transform:translate(0,0)}50%{transform:translate(3px,3px)}}
@keyframes floatD{0%,100%{transform:translate(0,0)}50%{transform:translate(-2px,-3px)}}
@media(prefers-reduced-motion:reduce){.rd-crp,.rd-nlr,.rd-hdl,.rd-glu,.ring-glow-bg{animation:none}}

.traj-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:20px;overflow:hidden;max-width:740px}
.traj-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid rgba(255,255,255,.07);flex-wrap:wrap;gap:8px}
.traj-hd-label{font-size:13px;font-weight:800;color:#fff;letter-spacing:-.01em}
.traj-hd-sub{font-size:11px;color:rgba(255,255,255,.38);margin-top:2px}
.traj-hd-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;background:rgba(92,184,130,.1);border:1px solid rgba(92,184,130,.2);font-size:11px;font-weight:700;color:var(--grn)}
.traj-chart-wrap{padding:16px 20px 4px;overflow:hidden}
.traj-svg{width:100%;height:auto;display:block}
.traj-ft{display:flex;align-items:center;justify-content:space-between;padding:12px 22px;border-top:1px solid rgba(255,255,255,.07);flex-wrap:wrap;gap:8px}
.traj-ft-drop{display:flex;align-items:baseline;gap:6px}
.traj-drop-num{font-size:clamp(20px,4vw,26px);font-weight:900;color:var(--grn);letter-spacing:-.04em}
.traj-drop-label{font-size:12px;font-weight:600;color:rgba(255,255,255,.45)}
.traj-ft-right{display:flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:rgba(255,255,255,.35)}



/* ══════════════════════════════════════════════════════
   MOBILE RESPONSIVE — aggressive floor rules
   Tested for 320px–480px viewport
══════════════════════════════════════════════════════ */

/* Global: minimum touch targets */
.btn-p,.btn-g,.nav-btn,.cta-card-btn{min-height:44px}

/* Nav: hide sign-in on tiny screens */
@media(max-width:440px){
  .nav-in{display:none}
  .nav-btn{font-size:13px;padding:8px 16px}
}

/* Hero ring: reduce and tuck chips in on small screens */
@media(max-width:480px){
  .ring-free{
    width:clamp(180px,56vw,240px)!important;
    height:clamp(180px,56vw,240px)!important;
  }
  .rd-crp{top:-4px;right:-22px}
  .rd-nlr{bottom:8px;right:-24px}
  .rd-hdl{top:10px;left:-26px}
  .rd-glu{bottom:-4px;left:-10px}
  .ring-data{padding:5px 8px}
  .ring-data-name{font-size:10px!important}
  .ring-data-val{font-size:12px!important}
  .ring-num{font-size:clamp(40px,14vw,60px)!important}
  .ring-chips{gap:4px}
  .ring-chip{font-size:11px!important;padding:3px 8px}
  .ring-verdict{font-size:13px!important;max-width:100%}
}

/* Proof bar: stack vertically on mobile */
@media(max-width:540px){
  .proof-inner{flex-direction:column;align-items:flex-start;gap:20px}
  .proof-big{
    border-right:none;
    padding-right:0;margin-right:0;
    border-bottom:1px solid rgba(255,255,255,.08);
    padding-bottom:16px;margin-bottom:4px;
    font-size:clamp(60px,16vw,100px)!important;
  }
  .proof-stats{grid-template-columns:repeat(3,1fr)}
  .proof-stat-n{font-size:clamp(20px,5vw,28px)!important}
  .proof-stat-l{font-size:12px!important}
  .proof-stat-note{font-size:11px!important}
}

/* Section headings — prevent too small on 320px */
@media(max-width:380px){
  .hero-h1{font-size:26px!important}
  .section-h2{font-size:22px!important}
  .cta-h2{font-size:24px!important}
}

/* Hero sub and body text floors */
@media(max-width:480px){
  .hero-sub{font-size:15px!important;line-height:1.7}
  .hero-tag{font-size:10px!important}
  .section-body{font-size:15px!important}
  .ax-q{font-size:15px!important}
  .ax-a{font-size:14px!important;line-height:1.75}
}

/* Anxiety cards: single column on small screens */
@media(max-width:460px){
  .anxiety-grid{grid-template-columns:1fr!important}
}

/* Shane layout: single column */
@media(max-width:767px){
  .shane-layout{grid-template-columns:1fr!important}
  .shane-quote{font-size:clamp(17px,4vw,22px)!important}
}

/* Viber threads: single column */
@media(max-width:639px){
  .viber-cols{grid-template-columns:1fr!important}
  .chat-bubble{font-size:14px!important}
}

/* Trajectory chart */
@media(max-width:520px){
  .traj-hd{padding:12px 14px}
  .traj-hd-label{font-size:13px!important}
  .traj-hd-sub{font-size:12px!important}
  .traj-chart-wrap{padding:10px 10px 2px}
  .traj-ft{
    padding:10px 14px;
    flex-direction:column;
    align-items:flex-start;
    gap:6px;
  }
  .traj-drop-num{font-size:22px!important}
  .traj-drop-label{font-size:13px!important}
  .traj-ft-right{font-size:12px!important}
}

/* CTA section */
@media(max-width:480px){
  .cta-card-title{font-size:20px!important}
  .cta-card-desc{font-size:14px!important}
  .cta-card-btn{font-size:14px!important;padding:12px 22px}
  .cta-sub{font-size:15px!important}
}

/* Footer */
@media(max-width:540px){
  .foot-inner{flex-direction:column;align-items:flex-start;gap:10px}
  .foot-links{gap:12px}
}


/* ══════════════════════════════════════════════════════════
   GRANDMA-PROOF MOBILE — hard floors for all text
   Target: nothing below 14px for readable text on mobile
   Applied at 640px and below
══════════════════════════════════════════════════════════ */

@media(max-width:640px){

  /* ── BODY / PARAGRAPH TEXT → 16px minimum ── */
  .hero-sub,
  .section-body,
  .ax-a,
  .shane-quote,
  .step-desc,
  .stream-desc,
  .income-note,
  .chat-bubble,
  .cta-sub,
  .cta-card-desc {
    font-size:16px!important;
    line-height:1.75!important;
  }

  /* ── PROMINENT LABELS / SECONDARY → 14px minimum ── */
  .hero-tag,
  .section-tag,
  .hero-cred,
  .ring-verdict,
  .ring-data-val,
  .time-badge,
  .step-title,
  .step-time,
  .mk-name,
  .mk-full,
  .ax-q,
  .stream-num,
  .stream-title,
  .stream-eg,
  .viber-dr-name,
  .viber-dr-spec,
  .viber-av,
  .shane-stat-l,
  .shane-stat-note,
  .shane-title,
  .traj-hd-label,
  .traj-hd-sub,
  .traj-hd-badge,
  .traj-drop-label,
  .traj-ft-right,
  .cta-tag,
  .cta-card-tag,
  .cta-card-btn,
  .cta-note,
  .proof-stat-l,
  .proof-big-label,
  .nav-in,
  .nav-btn,
  .foot-name,
  .foot-link,
  .foot-copy {
    font-size:14px!important;
  }

  /* ── TRULY TERTIARY (fine print, chips, flags) → 13px min ── */
  .ring-chip,
  .ring-lbl,
  .ring-data-name,
  .ring-data-flag,
  .chat-time,
  .mk-tag,
  .proof-stat-note,
  .zone-badge {
    font-size:13px!important;
  }

  /* ── LINE-HEIGHT: everything breathes ── */
  * { line-height:1.65 }

  /* ── PROOF BAR: stack so numbers don't fight ── */
  .proof-inner{
    flex-direction:column!important;
    align-items:flex-start!important;
    gap:20px!important;
  }
  .proof-big{
    font-size:80px!important;
    border-right:none!important;
    border-bottom:1px solid rgba(255,255,255,.08)!important;
    padding:0 0 16px!important;
    margin:0 0 4px!important;
  }
  .proof-stats{
    grid-template-columns:repeat(3,1fr)!important;
    width:100%!important;
  }
  .proof-stat-n{font-size:24px!important}

  /* ── RING: scale down, tuck chips in ── */
  .ring-free{
    width:clamp(180px,55vw,260px)!important;
    height:clamp(180px,55vw,260px)!important;
  }
  .ring-num{font-size:clamp(44px,15vw,72px)!important}
  .rd-crp{top:-4px!important;right:-18px!important}
  .rd-nlr{bottom:8px!important;right:-20px!important}
  .rd-hdl{top:10px!important;left:-22px!important}
  .rd-glu{bottom:-4px!important;left:-8px!important}
  .ring-data{padding:5px 8px!important}
  .ring-chips{gap:4px!important;max-width:100%!important}

  /* ── ANXIETIES: single column ── */
  .anxiety-grid{grid-template-columns:1fr!important}

  /* ── SHANE: single column ── */
  .shane-layout{grid-template-columns:1fr!important}

  /* ── VIBER: single column ── */
  .viber-cols{grid-template-columns:1fr!important}

  /* ── CTA card: bigger button ── */
  .cta-card-btn{
    padding:14px 24px!important;
    min-height:48px!important;
    width:100%!important;
    justify-content:center!important;
  }

  /* ── FOOTER: stack ── */
  .foot-inner{
    flex-direction:column!important;
    align-items:flex-start!important;
    gap:12px!important;
  }
  .foot-links{gap:14px!important}

  /* ── TRAJECTORY: tighten ── */
  .traj-hd{padding:14px 16px!important}
  .traj-chart-wrap{padding:12px 12px 4px!important}
  .traj-ft{
    flex-direction:column!important;
    align-items:flex-start!important;
    padding:12px 16px!important;
    gap:8px!important;
  }
  .traj-drop-num{font-size:24px!important}
}

/* Tiny screens (<380px): prevent H1/H2 overflow */
@media(max-width:380px){
  .hero-h1{font-size:26px!important;letter-spacing:-.02em!important}
  .section-h2{font-size:24px!important}
  .cta-h2{font-size:24px!important}
  .proof-big{font-size:64px!important}
  .nav-in{display:none!important}
}

/* Touch targets: minimum 48px for all interactive elements */
.btn-p,.btn-g,.nav-btn,.cta-card-btn{min-height:48px}
`;
