export const doctorOnboardingStyles = String.raw`
:root{
  --bg:#0C1017;--s1:#111A26;--bl:#3B82C8;--lt:#F3F2EF;--lt2:#E8E6E0;--lt3:#DDDAD2;
  --w:#FFFFFF;--d1:#1A1A17;--d2:#4A4840;--d3:#7A7870;--d4:#9A978F;
  --grn:#5CB882;--gld:#D4A840;--ter:#E8772E;--red:#D42020;
  --f:'Outfit',system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.32,1,.68,1);--spring:cubic-bezier(.34,1.56,.64,1);
}
*{box-sizing:border-box}
body{background:var(--bg);font-family:var(--f)}
.onboarding-page{min-height:100dvh;background:var(--bg);display:flex;flex-direction:column;align-items:center;position:relative;overflow-x:hidden}
.onboarding-page:before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle,rgba(59,130,200,.04) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;z-index:0}
.onboarding-page:after{content:'';position:fixed;top:-80px;left:50%;transform:translateX(-50%);width:520px;height:520px;background:radial-gradient(circle,rgba(59,130,200,.07) 0%,transparent 70%);pointer-events:none;z-index:0}
.doctor-onboarding-shell{width:100%;max-width:576px;min-height:100dvh;background:var(--bg);color:var(--d1);font-family:var(--f);position:relative;z-index:1}
@media(min-width:640px){.doctor-onboarding-shell{margin:24px auto;min-height:calc(100dvh - 48px);border-radius:20px;overflow:hidden;border:1px solid rgba(59,130,200,.10)}}
.onboarding-screen{min-height:100vh;min-height:100dvh}
.onboarding-welcome{background:var(--bg);color:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden}
.onboarding-welcome:before{content:'';position:absolute;inset:0;background-image:radial-gradient(circle,rgba(59,130,200,.04) 1px,transparent 1px);background-size:32px 32px;pointer-events:none}
.onboarding-welcome:after{content:'';position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:360px;height:360px;background:radial-gradient(circle,rgba(59,130,200,.07) 0%,transparent 70%);pointer-events:none}
.brand-header{display:flex;align-items:center;gap:10px;padding:22px 28px;position:relative;z-index:1}
.back-to-physician{margin-left:auto;font-size:13px;font-weight:600;color:rgba(255,255,255,.38);text-decoration:none;transition:color .15s}
.back-to-physician:hover{color:rgba(255,255,255,.65)}
.brand-mark{width:30px;height:30px;border-radius:8px;background:var(--bl);display:flex;align-items:center;justify-content:center;color:#fff}
.brand-header span{font-size:18px;font-weight:700}
.welcome-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 28px;position:relative;z-index:1}
.welcome-mark{width:70px;height:70px;border-radius:20px;background:rgba(59,130,200,.1);border:1px solid rgba(59,130,200,.15);display:flex;align-items:center;justify-content:center;margin-bottom:26px;color:var(--bl)}
.eyebrow{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.42);margin:0 0 12px}
.welcome-title{font-size:clamp(32px,8vw,42px);font-weight:800;line-height:1.05;letter-spacing:-.045em;margin:0 0 16px;max-width:390px}
.welcome-copy{font-size:16px;line-height:1.65;color:rgba(255,255,255,.56);max-width:380px;margin:0 0 32px}
.benefit-stack{display:flex;flex-direction:column;gap:12px;margin-bottom:28px}
.benefit-row{display:flex;gap:12px;align-items:flex-start;color:rgba(255,255,255,.6);font-size:15px;line-height:1.55}
.benefit-row strong{display:block;color:rgba(255,255,255,.86);font-size:14px;margin-bottom:1px}
.benefit-dot{width:36px;height:36px;border-radius:10px;flex-shrink:0;background:rgba(59,130,200,.08);position:relative}
.benefit-dot:after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--bl);font-weight:800}
.benefit-row[data-tone="green"] .benefit-dot{background:rgba(92,184,130,.08)}.benefit-row[data-tone="green"] .benefit-dot:after{color:var(--grn)}
.benefit-row[data-tone="gold"] .benefit-dot{background:rgba(212,168,64,.09)}.benefit-row[data-tone="gold"] .benefit-dot:after{color:var(--gld)}
.bottom-actions{padding:0 28px 40px;position:relative;z-index:1}
.btn-primary,.btn-secondary{width:100%;border-radius:16px;border:none;font-family:var(--f);font-weight:800;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;transition:transform .12s var(--spring),box-shadow .12s}
.btn-primary{min-height:58px;background:var(--bl);color:#fff;font-size:16px;box-shadow:0 4px 22px rgba(59,130,200,.28)}
.btn-primary:active,.btn-secondary:active{transform:scale(.97)}
.btn-secondary{min-height:52px;margin-top:10px;background:var(--w);border:1.5px solid var(--lt3);color:var(--d2);font-size:15px}
.sub-link{display:block;text-align:center;margin-top:14px;color:rgba(255,255,255,.38);font-size:14px;text-decoration:none;font-weight:600}
.form-screen{background:var(--lt);display:flex;flex-direction:column}
.form-nav{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;position:sticky;top:0;z-index:2;background:rgba(243,242,239,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.form-nav button{background:none;border:none;color:var(--d3);font-size:15px;font-weight:700;padding:10px 0;font-family:var(--f)}
.form-nav strong{font-size:17px}.form-nav span{font-size:13px;color:var(--d3);font-weight:700}
.progress-track{height:3px;background:var(--lt2);margin:0 28px}.progress-track div{height:100%;border-radius:2px;background:var(--bl);transition:width .4s var(--ease)}
.form-body{flex:1;padding:28px 28px 40px}
.form-heading{margin-bottom:24px}.form-heading span{font-size:12px;font-weight:800;letter-spacing:.10em;color:var(--d3);text-transform:uppercase}.form-heading h2{font-size:24px;line-height:1.1;font-weight:800;letter-spacing:-.02em;margin:6px 0 0}
.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:400px){.field-grid{grid-template-columns:1fr}}
.field-group{margin-bottom:18px}.field-group label{display:block;font-size:14px;font-weight:700;color:var(--d2);margin-bottom:7px}.field-group label span:not(.required){font-weight:500;color:var(--d4)}
.required{color:var(--red)}
.field-group input{width:100%;min-height:54px;border:1.5px solid var(--lt3);border-radius:14px;background:var(--w);padding:16px 18px;font:600 16px var(--f);color:var(--d1);outline:none;transition:border-color .15s,box-shadow .15s}
.field-group input:focus{border-color:var(--bl);box-shadow:0 0 0 3px rgba(59,130,200,.08)}
.field-group input::placeholder{color:var(--d4);font-weight:500}
.specialty-grid{display:flex;flex-wrap:wrap;gap:8px}
.specialty-chip{min-height:44px;padding:10px 16px;border-radius:12px;border:1.5px solid var(--lt3);background:var(--w);font:700 14px var(--f);color:var(--d2)}
.specialty-chip.on{border-color:var(--bl);background:rgba(59,130,200,.05);color:var(--bl)}
.form-note{font-size:14px;color:var(--d3);line-height:1.6;margin:-8px 0 20px}
.upload-box{width:100%;min-height:140px;border:2px dashed var(--lt3);border-radius:18px;background:transparent;color:var(--d3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:700 15px var(--f)}
.review-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 28px;text-align:center;background:var(--lt)}
.review-icon{width:72px;height:72px;border-radius:20px;background:rgba(59,130,200,.06);display:flex;align-items:center;justify-content:center;margin-bottom:24px}
.spinner{width:26px;height:26px;border:3px solid var(--lt3);border-top-color:var(--bl);border-radius:50%;animation:spin .7s linear infinite}.review-screen h2{font-size:24px;margin:0 0 8px}.review-screen p{color:var(--d3);font-size:15px;margin:0}
.ready-screen{min-height:100vh;background:var(--lt)}
.ready-hero{background:var(--bg);color:#fff;padding-bottom:32px}
.ready-summary{text-align:center;padding:24px 28px 0}.success-mark{width:72px;height:72px;border-radius:20px;background:rgba(92,184,130,.1);border:1px solid rgba(92,184,130,.18);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:var(--grn)}
.ready-summary h1{font-size:26px;letter-spacing:-.03em;margin:0 0 8px}.ready-summary p{font-size:15px;color:rgba(255,255,255,.5);line-height:1.6;max-width:330px;margin:0 auto}
.ready-progress{height:4px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;max-width:280px;margin:28px auto 0}.ready-progress span{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--bl),var(--grn));animation:grow 1s var(--ease) both}
.ready-progress-labels{display:flex;justify-content:space-between;max-width:280px;margin:8px auto 0;font-size:12px;color:rgba(255,255,255,.34)}
.ready-content{padding:24px 28px 40px}.portal-card{background:var(--w);border-radius:18px;padding:22px;margin-bottom:14px;box-shadow:0 2px 16px rgba(0,0,0,.04)}
.card-label{font-size:12px;font-weight:800;letter-spacing:.10em;color:var(--d3);text-transform:uppercase;margin-bottom:14px}.qr-card{text-align:center}.qr-box{width:160px;height:160px;margin:0 auto 16px;border-radius:16px;background:var(--w);border:1px solid var(--lt2);display:flex;align-items:center;justify-content:center}.qr-card strong{display:block;font-size:17px;margin-bottom:4px}.qr-card>span{display:block;font-size:14px;color:var(--bl);font-weight:700}
.qr-actions{display:flex;gap:8px;justify-content:center;margin-top:18px}.qr-actions button{min-height:42px;padding:10px 18px;border-radius:12px;border:1.5px solid var(--lt3);background:var(--w);font:800 14px var(--f);color:var(--d2)}.qr-actions button:first-child{background:var(--bl);border-color:var(--bl);color:#fff}
.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}.portal-stat{background:var(--w);border-radius:14px;padding:14px 8px;text-align:center;border:1px solid var(--lt2)}.portal-stat strong{display:block;font-size:24px;line-height:1;color:var(--d1)}.portal-stat span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--d3);font-weight:800;margin-top:6px}.portal-stat[data-tone="green"] strong{color:var(--grn)}.portal-stat[data-tone="red"] strong{color:var(--red)}
.next-row{display:flex;gap:14px;padding:14px 0;border-bottom:1px solid var(--lt2)}.next-row:last-child{border-bottom:none}.next-row>span{width:36px;height:36px;border-radius:10px;background:rgba(59,130,200,.08);color:var(--bl);display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0}.next-row strong{font-size:15px}.next-row p{font-size:13px;color:var(--d3);margin:2px 0 0;line-height:1.5}.dashboard-link{margin-top:8px}
@keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes grow{from{width:0}to{width:100%}}
.an{animation:up .5s var(--ease) both}.d1{animation-delay:.06s}.d2{animation-delay:.14s}.d3{animation-delay:.22s}.d4{animation-delay:.30s}.d5{animation-delay:.38s}
`;
