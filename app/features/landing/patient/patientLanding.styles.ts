export const patientLandingStyles = String.raw`
@property --ra{syntax:"<angle>";initial-value:0deg;inherits:false}

:root{
  --bg:#0C1017;--s1:#0F1620;--s2:#131C28;--s3:#162030;
  --bl:#3B82C8;--bl2:#2E6BA8;
  --lt:#F3F2EF;--lt2:#E8E6E0;--lt3:#DDDAD2;
  --w:#FFFFFF;
  --d1:#1A1A17;--d2:#4A4840;--d3:#7A7870;--d4:#9A978F;
  --grn:#5CB882;--gld:#D4A840;--ter:#E8772E;--red:#D42020;
  --f:'Outfit',system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.32,1,.68,1);
  --spring:cubic-bezier(.34,1.56,.64,1);
}

*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--f);background:var(--bg);color:#fff;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}

/* ── NAV ── */
#nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  height:64px;display:flex;align-items:center;
  padding:0 clamp(20px,5vw,48px);
  transition:background .3s,border-color .3s;
  border-bottom:1px solid transparent;
}
#nav.stuck{background:rgba(12,16,23,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-color:rgba(255,255,255,.07)}
.nav-logo{display:flex;align-items:center;gap:9px;flex:1}
.nav-shield{width:32px;height:32px;background:var(--bl);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nav-wordmark{font-size:18px;font-weight:800;letter-spacing:-.03em;color:#fff}
.nav-wordmark em{color:var(--grn);font-style:normal}
.nav-cta{
  font-size:14px;font-weight:700;color:#fff;
  background:var(--bl);padding:10px 22px;
  border-radius:100px;border:none;cursor:pointer;
  transition:background .2s,transform .15s;
  white-space:nowrap;
}
.nav-cta:hover{background:var(--bl2);transform:translateY(-1px)}
.nav-dr{font-size:13px;color:rgba(255,255,255,.42);margin-right:16px;display:none}
@media(min-width:540px){.nav-dr{display:block}}

/* ── WRAP ── */
.mx{max-width:1080px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
.mx-sm{max-width:720px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
.mx-xs{max-width:560px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}

/* ── REVEAL ── */
.rv{opacity:0;transition:opacity .7s var(--ease),transform .7s var(--ease);transform:translateY(24px)}
.rv.in{opacity:1;transform:none}
.rv-l{transform:translateX(-24px)}
.rv-r{transform:translateX(24px)}
.d1{transition-delay:.08s}.d2{transition-delay:.16s}.d3{transition-delay:.24s}.d4{transition-delay:.32s}.d5{transition-delay:.40s}

/* ── CANONICAL RING ── */
.ring-wrap{position:relative;flex-shrink:0}
.ring-glow{position:absolute;inset:-28px;border-radius:50%;filter:blur(44px);opacity:.45;pointer-events:none;transition:background 1.2s,opacity .6s}
.ring-trk{
  position:absolute;inset:0;border-radius:50%;
  background:rgba(255,255,255,.07);
  -webkit-mask:radial-gradient(closest-side,transparent 81%,#000 81.5%,#000 96%,transparent 96.5%);
  mask:radial-gradient(closest-side,transparent 81%,#000 81.5%,#000 96%,transparent 96.5%);
}
.ring-fill{
  position:absolute;inset:0;border-radius:50%;
  background:conic-gradient(from 180deg,#5CB882 0%,#7EBC6C 14%,#9AB854 28%,#C4B044 42%,#D4A840 52%,#CC8844 66%,#E8772E 78%,#D03030 90%,#D42020 100%);
  -webkit-mask-image:radial-gradient(closest-side,transparent 81%,#000 81.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));
  -webkit-mask-composite:source-in;
  mask-image:radial-gradient(closest-side,transparent 81%,#000 81.5%,#000 96%,transparent 96.5%),conic-gradient(from 180deg,#000 var(--ra),transparent var(--ra));
  mask-composite:intersect;
  --ra:0deg;transition:--ra 1.6s cubic-bezier(.25,0,.1,1);
}
.ring-ctr{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}

/* ══════════════════════════════════════════════
   HERO
══════════════════════════════════════════════ */
#hero{
  min-height:100svh;background:var(--bg);
  padding-top:64px;position:relative;overflow:hidden;
  display:flex;flex-direction:column;
}
.hero-noise{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");opacity:.025;pointer-events:none}
.hero-orb{position:absolute;border-radius:50%;pointer-events:none;filter:blur(80px)}
.hero-orb-1{width:640px;height:640px;top:-180px;right:-160px;background:radial-gradient(circle,rgba(59,130,200,.13) 0%,transparent 65%)}
.hero-orb-2{width:480px;height:480px;bottom:-80px;left:-120px;background:radial-gradient(circle,rgba(92,184,130,.08) 0%,transparent 65%)}

.hero-body{
  flex:1;position:relative;z-index:1;
  display:flex;align-items:center;
  padding:clamp(40px,8vh,80px) 0 clamp(24px,5vh,48px);
}
.hero-grid{
  display:grid;grid-template-columns:1fr;
  gap:clamp(48px,7vw,80px);align-items:center;
}
@media(min-width:768px){.hero-grid{grid-template-columns:1fr 1fr}}

.hero-tag{
  display:inline-flex;align-items:center;gap:7px;
  font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:var(--bl);margin-bottom:clamp(16px,3vh,22px);
}
.tag-dot{width:7px;height:7px;border-radius:50%;background:var(--bl);position:relative}
.tag-dot::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1.5px solid var(--bl);opacity:.5;animation:ping 2s ease-out infinite}
@keyframes ping{0%{transform:scale(.8);opacity:.75}100%{transform:scale(1.8);opacity:0}}

.hero-h1{
  font-size:clamp(32px,6vw,62px);
  font-weight:900;letter-spacing:-.045em;line-height:1.05;
  color:#fff;margin-bottom:clamp(16px,2.5vh,22px);
}
.hero-h1 em{font-style:normal;color:var(--grn)}

.hero-body-copy{
  font-size:clamp(16px,2.5vw,19px);color:rgba(255,255,255,.65);
  line-height:1.75;max-width:480px;
  margin-bottom:clamp(28px,5vh,40px);
}
.hero-body-copy strong{color:rgba(255,255,255,.88);font-weight:600}

.hero-btns{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:clamp(24px,4vh,32px)}
.btn-primary{
  display:inline-flex;align-items:center;gap:8px;
  padding:clamp(14px,3vw,18px) clamp(24px,4vw,36px);
  background:var(--bl);color:#fff;border-radius:100px;border:none;
  font-family:var(--f);font-size:clamp(15px,2.5vw,17px);font-weight:700;
  cursor:pointer;box-shadow:0 4px 32px rgba(59,130,200,.38);
  transition:background .2s,transform .2s var(--spring),box-shadow .2s;
}
.btn-primary:hover{background:var(--bl2);transform:translateY(-2px);box-shadow:0 8px 40px rgba(59,130,200,.44)}
.btn-ghost{
  display:inline-flex;align-items:center;gap:6px;
  padding:clamp(13px,3vw,17px) clamp(20px,3.5vw,28px);
  background:transparent;color:rgba(255,255,255,.65);
  border:1.5px solid rgba(255,255,255,.15);border-radius:100px;
  font-family:var(--f);font-size:clamp(14px,2.3vw,16px);font-weight:600;
  cursor:pointer;transition:color .2s,border-color .2s;
}
.btn-ghost:hover{color:#fff;border-color:rgba(255,255,255,.32)}

.hero-trust{display:flex;flex-wrap:wrap;gap:clamp(12px,3vw,20px)}
.trust-item{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:600;color:rgba(255,255,255,.42)}
.trust-item svg{opacity:.5;flex-shrink:0}

/* Ring side */
.hero-ring-side{display:flex;flex-direction:column;align-items:center;gap:20px;order:-1}
@media(min-width:768px){.hero-ring-side{order:0;align-items:flex-end}}

.hero-ring{width:clamp(220px,44vw,320px);height:clamp(220px,44vw,320px)}
.ring-score{font-size:clamp(54px,13vw,82px);font-weight:900;letter-spacing:-.06em;line-height:1;transition:color .8s}
.ring-lbl{font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:4px}
.ring-verdict{font-size:15px;font-weight:700;text-align:center;transition:color .5s}

.ring-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;max-width:320px}
.chip-marker{
  font-size:12px;font-weight:700;padding:5px 12px;border-radius:100px;
  border:1px solid;transition:background .5s,color .5s,border-color .5s;
}
.chip-hi{background:rgba(212,32,32,.12);color:#E87070;border-color:rgba(212,32,32,.22)}
.chip-mid{background:rgba(232,119,46,.1);color:#E8A060;border-color:rgba(232,119,46,.2)}
.chip-ok{background:rgba(92,184,130,.1);color:var(--grn);border-color:rgba(92,184,130,.2)}

.ring-toggle{display:flex;gap:8px}
.rtog{
  padding:8px 18px;border-radius:100px;font-family:var(--f);
  font-size:13px;font-weight:700;cursor:pointer;border:none;
  background:rgba(255,255,255,.07);color:rgba(255,255,255,.45);
  transition:background .2s,color .2s;
}
.rtog.on{background:rgba(59,130,200,.18);color:#fff}

/* ══════════════════════════════════════════════
   PROOF STRIP
══════════════════════════════════════════════ */
#proof{
  background:var(--s1);
  border-top:1px solid rgba(255,255,255,.06);
  border-bottom:1px solid rgba(255,255,255,.06);
  padding:clamp(28px,5vh,44px) 0;
}
.proof-row{display:flex;flex-wrap:wrap;gap:0;align-items:stretch;justify-content:center}
.proof-stat{
  flex:1;min-width:120px;max-width:240px;
  padding:clamp(16px,3vh,24px) clamp(20px,3vw,36px);
  border-right:1px solid rgba(255,255,255,.07);
  text-align:center;
}
.proof-stat:last-child{border-right:none}
.proof-n{font-size:clamp(28px,6vw,42px);font-weight:900;letter-spacing:-.05em;line-height:1;margin-bottom:6px}
.proof-l{font-size:12px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,.38);line-height:1.4}

/* ══════════════════════════════════════════════
   WHY IT MATTERS — light
══════════════════════════════════════════════ */
#why{background:var(--lt);padding:clamp(60px,10vh,96px) 0}
.section-tag{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:12px}
.section-h{font-size:clamp(26px,5vw,44px);font-weight:900;letter-spacing:-.04em;line-height:1.1;margin-bottom:clamp(14px,2.5vh,20px)}
.section-body{font-size:clamp(16px,2.5vw,18px);line-height:1.75;color:var(--d3)}

.disease-grid{
  display:grid;grid-template-columns:repeat(2,1fr);gap:10px;
  margin-top:clamp(28px,5vh,40px);
}
@media(min-width:540px){.disease-grid{grid-template-columns:repeat(3,1fr)}}
@media(min-width:768px){.disease-grid{grid-template-columns:repeat(6,1fr)}}
.disease-card{
  padding:clamp(14px,3vw,18px) 14px;
  background:var(--w);border:1px solid var(--lt2);
  border-radius:14px;text-align:center;
  transition:border-color .2s,transform .2s var(--spring),box-shadow .2s;
}
.disease-card:hover{border-color:rgba(59,130,200,.35);transform:translateY(-2px);box-shadow:0 6px 24px rgba(59,130,200,.1)}
.disease-ico{font-size:22px;margin-bottom:8px;line-height:1}
.disease-lbl{font-size:13px;font-weight:700;color:var(--d1);line-height:1.3}
.disease-note{font-size:11px;color:var(--d4);margin-top:3px}

.inflammation-bar{
  margin-top:clamp(28px,5vh,40px);padding:20px 24px;
  background:var(--w);border:1px solid var(--lt2);border-radius:18px;
}
.ibar-label{font-size:13px;font-weight:700;color:var(--d2);margin-bottom:12px;letter-spacing:.04em}
.ibar-track{height:10px;background:var(--lt2);border-radius:100px;position:relative;overflow:hidden}
.ibar-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#5CB882 0%,#D4A840 45%,#E8772E 72%,#D42020 100%);width:0;transition:width 1.4s cubic-bezier(.25,0,.1,1)}
.ibar-markers{display:flex;justify-content:space-between;margin-top:8px}
.ibar-m{font-size:11px;color:var(--d4);font-weight:600}

/* ══════════════════════════════════════════════
   HOW IT WORKS — dark
══════════════════════════════════════════════ */
#how{background:var(--bg);padding:clamp(60px,10vh,96px) 0;border-top:1px solid rgba(255,255,255,.05)}
.steps{display:flex;flex-direction:column;gap:0;margin-top:clamp(32px,6vh,48px)}
.step-row{
  display:flex;gap:clamp(16px,4vw,28px);
  padding:clamp(20px,4vh,28px) 0;
  border-bottom:1px solid rgba(255,255,255,.06);
  align-items:flex-start;
}
.step-row:last-child{border-bottom:none}
.step-num{
  width:44px;height:44px;border-radius:50%;
  background:rgba(59,130,200,.14);
  border:1.5px solid rgba(59,130,200,.25);
  color:var(--bl);font-size:16px;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
}
.step-body{flex:1}
.step-h{font-size:clamp(17px,3vw,20px);font-weight:800;color:#fff;margin-bottom:6px;letter-spacing:-.02em}
.step-p{font-size:clamp(15px,2.5vw,16px);color:rgba(255,255,255,.58);line-height:1.7}
.step-badge{
  display:inline-flex;align-items:center;gap:5px;
  margin-top:10px;padding:5px 12px;border-radius:100px;
  background:rgba(92,184,130,.1);border:1px solid rgba(92,184,130,.18);
  font-size:12px;font-weight:700;color:var(--grn);
}

/* ══════════════════════════════════════════════
   MARKERS DEEP — light
══════════════════════════════════════════════ */
#markers{background:var(--lt);padding:clamp(60px,10vh,96px) 0}
.markers-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:10px;margin-top:clamp(28px,5vh,40px);
}
@media(min-width:600px){.markers-grid{grid-template-columns:repeat(4,1fr)}}
.mk{
  padding:clamp(14px,3vw,18px);background:var(--w);
  border:1px solid var(--lt2);border-radius:14px;
  transition:border-color .2s,box-shadow .2s,transform .2s var(--spring);
}
.mk:hover{border-color:rgba(59,130,200,.3);box-shadow:0 4px 20px rgba(59,130,200,.08);transform:translateY(-2px)}
.mk-name{font-size:15px;font-weight:800;color:var(--d1);margin-bottom:2px}
.mk-full{font-size:12px;color:var(--d4);margin-bottom:8px;line-height:1.4}
.mk-role{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--bl)}

.formula-strip{
  margin-top:clamp(28px,5vh,40px);
  display:flex;flex-wrap:wrap;gap:0;
  background:var(--d1);border-radius:18px;overflow:hidden;
}
.formula-item{
  flex:1;min-width:140px;padding:clamp(16px,3vw,22px) clamp(14px,3vw,20px);
  border-right:1px solid rgba(255,255,255,.06);
}
.formula-item:last-child{border-right:none}
.formula-num{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:6px}
.formula-name{font-size:clamp(15px,3vw,17px);font-weight:800;color:#fff;margin-bottom:4px}
.formula-ing{font-size:13px;color:rgba(255,255,255,.52);line-height:1.5}

/* ══════════════════════════════════════════════
   OFFER — dark
══════════════════════════════════════════════ */
#offer{background:var(--s2);padding:clamp(60px,10vh,96px) 0;border-top:1px solid rgba(255,255,255,.06)}

.offer-layout{
  display:grid;grid-template-columns:1fr;
  gap:clamp(32px,5vw,56px);align-items:start;
}
@media(min-width:768px){.offer-layout{grid-template-columns:1fr 1fr}}

.offer-box{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.1);
  border-radius:22px;overflow:hidden;
}
.ob-top{
  padding:clamp(20px,4vw,28px);
  border-bottom:1px solid rgba(255,255,255,.07);
}
.ob-title{font-size:clamp(18px,3.5vw,22px);font-weight:900;color:#fff;margin-bottom:6px;letter-spacing:-.03em}
.ob-sub{font-size:14px;color:rgba(255,255,255,.48);line-height:1.6}
.ob-items{padding:clamp(16px,3vw,22px);display:flex;flex-direction:column;gap:12px}
.ob-item{display:flex;gap:12px;align-items:flex-start}
.ob-check{
  width:22px;height:22px;border-radius:50%;
  background:rgba(92,184,130,.15);color:var(--grn);
  font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;margin-top:1px;
}
.ob-text{font-size:clamp(14px,2.5vw,15px);color:rgba(255,255,255,.78);line-height:1.6}
.ob-text strong{color:#fff;font-weight:700}
.ob-price{
  padding:clamp(16px,3vw,22px);
  border-top:1px solid rgba(255,255,255,.07);
  background:rgba(59,130,200,.06);
}
.pr-label{font-size:12px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:8px}
.pr-amount{font-size:clamp(32px,7vw,48px);font-weight:900;letter-spacing:-.05em;color:#fff;line-height:1}
.pr-was{font-size:14px;color:rgba(255,255,255,.32);margin-top:4px;text-decoration:line-through}
.pr-save{display:inline-block;background:rgba(92,184,130,.15);color:var(--grn);font-size:13px;font-weight:700;padding:4px 12px;border-radius:100px;margin-top:8px}
.pr-install{font-size:14px;color:rgba(255,255,255,.5);margin-top:8px}

/* Doctor strip */
.doc-strip{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.08);
  border-radius:18px;padding:clamp(20px,4vw,28px);
}
.doc-top{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.doc-avatar{
  width:52px;height:52px;border-radius:14px;
  background:var(--bl);display:flex;align-items:center;justify-content:center;
  font-size:22px;flex-shrink:0;
}
.doc-name{font-size:17px;font-weight:800;color:#fff;letter-spacing:-.02em}
.doc-title{font-size:13px;color:rgba(255,255,255,.45);margin-top:2px}
.doc-quote{
  font-size:clamp(15px,2.8vw,16px);color:rgba(255,255,255,.72);
  line-height:1.72;font-style:italic;
  border-left:2px solid var(--bl);padding-left:16px;margin-bottom:16px;
}
.doc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ds{padding:12px;background:rgba(255,255,255,.04);border-radius:12px;text-align:center}
.ds-n{font-size:clamp(20px,4vw,26px);font-weight:900;letter-spacing:-.04em;line-height:1}
.ds-l{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-top:4px;line-height:1.4}

/* ══════════════════════════════════════════════
   GUARANTEE — light
══════════════════════════════════════════════ */
#guarantee{background:var(--lt);padding:clamp(56px,9vh,88px) 0}
.guar-wrap{
  display:flex;gap:clamp(20px,4vw,32px);align-items:flex-start;
  padding:clamp(24px,5vw,36px);
  background:var(--w);border:1px solid var(--lt2);border-radius:22px;
  box-shadow:0 4px 32px rgba(0,0,0,.06);
}
.guar-icon{
  width:56px;height:56px;border-radius:16px;
  background:rgba(92,184,130,.1);border:1.5px solid rgba(92,184,130,.2);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.guar-h{font-size:clamp(20px,4vw,26px);font-weight:900;color:var(--d1);margin-bottom:10px;letter-spacing:-.03em}
.guar-p{font-size:clamp(15px,2.5vw,17px);color:var(--d2);line-height:1.75}

/* ══════════════════════════════════════════════
   NOT FOR EVERYONE — dark
══════════════════════════════════════════════ */
#qualify{background:var(--bg);padding:clamp(56px,9vh,88px) 0;border-top:1px solid rgba(255,255,255,.05)}
.qualify-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:12px;
  margin-top:clamp(24px,5vh,36px);
}
.qual-card{
  padding:clamp(16px,3vw,20px);border-radius:16px;
}
.qual-yes{background:rgba(92,184,130,.08);border:1px solid rgba(92,184,130,.18)}
.qual-no{background:rgba(212,32,32,.06);border:1px solid rgba(212,32,32,.14)}
.qual-head{font-size:13px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;margin-bottom:12px}
.qual-yes .qual-head{color:var(--grn)}
.qual-no .qual-head{color:var(--red)}
.qual-item{display:flex;gap:9px;align-items:flex-start;margin-bottom:10px;font-size:clamp(14px,2.5vw,15px);color:rgba(255,255,255,.72);line-height:1.55}
.qual-dot{width:18px;height:18px;border-radius:50%;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700}
.qual-yes .qual-dot{background:rgba(92,184,130,.2);color:var(--grn)}
.qual-no .qual-dot{background:rgba(212,32,32,.15);color:var(--red)}

/* ══════════════════════════════════════════════
   CLOSE — dark
══════════════════════════════════════════════ */
#close{
  background:var(--bg);padding:clamp(72px,12vh,120px) 0;
  position:relative;overflow:hidden;
  border-top:1px solid rgba(255,255,255,.05);
}
.close-orb{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,200,.06) 0%,transparent 65%);pointer-events:none}
.close-inner{position:relative;z-index:1;text-align:center}
.close-h{font-size:clamp(26px,6vw,52px);font-weight:900;letter-spacing:-.045em;line-height:1.08;color:#fff;margin-bottom:clamp(14px,2.5vh,20px);max-width:640px;margin-left:auto;margin-right:auto}
.close-h em{font-style:normal;color:var(--grn)}
.close-sub{font-size:clamp(16px,2.5vw,18px);color:rgba(255,255,255,.52);max-width:440px;margin:0 auto clamp(32px,6vh,48px);line-height:1.75}

.close-cta-wrap{display:flex;flex-direction:column;align-items:center;gap:16px}
.close-proof{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(12px,3vw,20px)}
.close-proof-item{font-size:14px;font-weight:600;color:rgba(255,255,255,.42);display:flex;align-items:center;gap:6px}
.close-proof-item::before{content:'✓';color:var(--grn);font-weight:800}

/* ══════════════════════════════════════════════
   FOOTER
══════════════════════════════════════════════ */
footer{background:rgba(0,0,0,.35);border-top:1px solid rgba(255,255,255,.05);padding:clamp(24px,5vh,36px) 0 0}
.ft-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:20px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.06)}
.ft-logo{font-size:17px;font-weight:800;color:#fff;letter-spacing:-.02em}
.ft-logo em{color:var(--grn);font-style:normal}
.ft-links{display:flex;flex-wrap:wrap;gap:clamp(12px,3vw,20px)}
.ft-link{font-size:13px;color:rgba(255,255,255,.35);transition:color .2s}
.ft-link:hover{color:rgba(255,255,255,.7)}
.ft-disc{font-size:12px;color:rgba(255,255,255,.22);line-height:1.75;padding:20px 0;max-width:900px}
.ft-disc strong{color:rgba(255,255,255,.32);display:block;margin-bottom:4px}

/* ══════════════════════════════════════════════
   STICKY BAR
══════════════════════════════════════════════ */
#sticky{
  position:fixed;bottom:0;left:0;right:0;z-index:90;
  background:rgba(12,16,23,.97);border-top:1px solid rgba(255,255,255,.08);
  padding:12px clamp(20px,5vw,48px);
  padding-bottom:max(12px,env(safe-area-inset-bottom));
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
  transform:translateY(100%);transition:transform .35s var(--ease);
}
#sticky.on{transform:translateY(0)}
.sk-l{display:flex;flex-direction:column;gap:2px}
.sk-title{font-size:14px;font-weight:700;color:#fff}
.sk-sub{font-size:12px;color:rgba(255,255,255,.42)}
.sk-btn{
  display:inline-flex;align-items:center;gap:6px;
  padding:12px 24px;background:var(--bl);color:#fff;
  border-radius:100px;font-family:var(--f);font-size:14px;font-weight:700;
  white-space:nowrap;transition:background .2s;flex-shrink:0;
}
.sk-btn:hover{background:var(--bl2)}

/* ══════════════════════════════════════════════
   WHATSAPP FLOAT
══════════════════════════════════════════════ */
#wa{
  position:fixed;bottom:calc(72px + env(safe-area-inset-bottom));right:20px;
  width:52px;height:52px;border-radius:50%;
  background:#25D366;display:flex;align-items:center;justify-content:center;
  font-size:24px;box-shadow:0 4px 24px rgba(0,0,0,.35);z-index:90;
  transform:scale(0);transition:transform .3s var(--spring);
}
#wa.on{transform:scale(1)}

/* ══════════════════════════════════════════════
   MOBILE RESPONSIVE
══════════════════════════════════════════════ */
@media(max-width:640px){
  .qualify-grid{grid-template-columns:1fr}
  .proof-stat{min-width:100px}
  .guar-wrap{flex-direction:column}
  .formula-strip{flex-direction:column}
  .formula-item{border-right:none;border-bottom:1px solid rgba(255,255,255,.06)}
  .formula-item:last-child{border-bottom:none}
  .ft-top{flex-direction:column}
  .disease-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:400px){
  .disease-grid{grid-template-columns:repeat(2,1fr)}
  .markers-grid{grid-template-columns:1fr 1fr}
}

/* ── Protocol tiers ── */
.proto-grid{display:grid;grid-template-columns:1fr;gap:12px;margin-top:clamp(24px,5vh,36px)}
@media(min-width:480px){.proto-grid{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.proto-grid{grid-template-columns:repeat(4,1fr)}}
.proto-card{
  padding:clamp(18px,3vw,22px);border-radius:18px;
  background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.09);
  display:flex;flex-direction:column;gap:0;
  transition:border-color .2s,transform .2s var(--spring),box-shadow .2s;
  position:relative;overflow:hidden;
}
.proto-card:hover{border-color:rgba(59,130,200,.4);transform:translateY(-3px);box-shadow:0 8px 32px rgba(59,130,200,.15)}
.proto-card.recommended{border-color:var(--bl);box-shadow:0 0 0 1px var(--bl)}
.proto-rec-badge{
  position:absolute;top:0;right:0;
  background:var(--bl);color:#fff;
  font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  padding:4px 12px;border-radius:0 0 0 10px;
}
.proto-name{font-size:17px;font-weight:800;color:#fff;letter-spacing:-.02em;margin-bottom:4px}
.proto-caps{font-size:13px;color:rgba(255,255,255,.42);margin-bottom:16px}
.proto-cap-price{
  font-size:clamp(26px,5vw,34px);font-weight:900;
  letter-spacing:-.05em;color:var(--bl);line-height:1;margin-bottom:3px;
}
.proto-cap-label{
  font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
  color:var(--bl);opacity:.65;margin-bottom:14px;
}
.proto-price{
  font-size:13px;color:rgba(255,255,255,.35);
  margin-bottom:14px;letter-spacing:.01em;
}
.proto-scans{
  display:flex;align-items:center;gap:6px;
  font-size:13px;color:rgba(255,255,255,.55);
  margin-bottom:12px;
}
.proto-cta{
  display:block;width:100%;padding:12px;border-radius:100px;
  background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);
  border:none;font-family:var(--f);font-size:14px;font-weight:700;
  cursor:pointer;text-align:center;
  transition:background .2s,color .2s;margin-top:auto;
}
.proto-card.recommended .proto-cta{background:var(--bl);color:#fff}
.proto-cta:hover{background:var(--bl);color:#fff}

/* ══ PATIENT VIBER THREADS (matches acquisition page) ══ */
#voices{
  background:var(--lt);
  padding:clamp(60px,10vh,96px) 0;
}
.viber-cols{
  display:grid;grid-template-columns:1fr;
  gap:clamp(20px,3vw,28px);
  margin-top:clamp(28px,5vh,44px);
}
@media(min-width:640px){.viber-cols{grid-template-columns:1fr 1fr}}
.viber-thread{
  background:var(--w);border-radius:16px;
  border:1px solid var(--lt2);overflow:hidden;
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
.viber-dr-name{font-size:14px;font-weight:700;color:var(--d1)}
.viber-dr-spec{font-size:12px;color:var(--d4);margin-top:1px}
.viber-body{padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px}
.chat-bubble{
  max-width:90%;padding:10px 13px;border-radius:14px;
  font-size:clamp(14px,2.8vw,15px);line-height:1.65;
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
.chat-time{align-self:flex-end;font-size:11px;color:var(--d4);margin-top:-4px}
`;
