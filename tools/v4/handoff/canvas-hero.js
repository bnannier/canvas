/* Canvas v4.0.0 · <cv-hero kind="controls|inputs|…">: an animated landing vignette for each section page.
   Pure CSS loops on the page tokens (inherited through the shadow root); Reduce Motion freezes them. */
(function(){
var BASE=':host{display:block;width:100%}*{box-sizing:border-box}'+
'.st{--sp:cubic-bezier(.34,1.56,.64,1);position:relative;height:300px;border-radius:24px;overflow:hidden;isolation:isolate;container-type:inline-size;background:radial-gradient(120% 90% at 85% 0%,var(--ion-soft),transparent 60%),radial-gradient(90% 80% at 0% 100%,color-mix(in oklch,var(--cyan) 12%,transparent),transparent 60%),var(--sf);border:1px solid var(--ln);box-shadow:var(--sh-md);font-family:var(--ft);color:var(--tx);animation:in .9s cubic-bezier(.2,.8,.2,1) both}'+
'.st::before{content:"";position:absolute;inset:0;z-index:-1;background-image:radial-gradient(var(--ln) 1px,transparent 1px);background-size:18px 18px;-webkit-mask-image:linear-gradient(180deg,#000,transparent);mask-image:linear-gradient(180deg,#000,transparent)}'+
'.gl{background:var(--gl);-webkit-backdrop-filter:var(--bf);backdrop-filter:var(--bf);border:1px solid var(--ln2);box-shadow:var(--sh-lg)}'+
'.mono{font:500 11px/1.2 var(--fm);letter-spacing:.06em;color:var(--tx3);text-transform:uppercase}'+
'.c{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}'+
'cv-icon{display:inline-block;width:1em;height:1em;line-height:0;flex:none}'+
'.pn{width:min(360px,88%);border-radius:20px;display:flex;flex-direction:column}'+
'@keyframes in{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}'+
'@keyframes bl{50%{opacity:0}}'+
'@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01s!important;animation-iteration-count:1!important;animation-delay:0s!important}}';
var K={
foundations:function(){return ['.aa{font:300 120px/1 var(--fd);letter-spacing:-.02em;background:linear-gradient(135deg,var(--tx) 30%,var(--ion));-webkit-background-clip:text;background-clip:text;color:transparent;animation:wg 4.8s cubic-bezier(.65,0,.35,1) infinite alternate}'+
'@keyframes wg{from{font-weight:300;letter-spacing:-.02em}to{font-weight:800;letter-spacing:-.06em}}'+
'.sw{display:flex;gap:8px;animation:hr 12s linear infinite}.sw i{width:28px;height:28px;border-radius:50%;background:var(--ion);box-shadow:0 0 18px var(--ion-glow);animation:bob 2.4s var(--sp) infinite}'+
'.sw i:nth-child(2){background:var(--cyan);animation-delay:.12s}.sw i:nth-child(3){background:var(--mint);animation-delay:.24s}.sw i:nth-child(4){background:var(--c4);animation-delay:.36s}.sw i:nth-child(5){background:var(--c5);animation-delay:.48s}'+
'@keyframes hr{to{filter:hue-rotate(360deg)}}@keyframes bob{0%,100%{transform:translateY(0)}35%{transform:translateY(-9px)}}'+
'.spw{position:relative;width:220px;height:90px}.spw svg{position:absolute;inset:0;width:220px;height:90px;overflow:visible}'+
'.cv{fill:none;stroke:var(--ion);stroke-width:2.5;stroke-linecap:round;stroke-dasharray:330;stroke-dashoffset:330;animation:draw 3.4s cubic-bezier(.65,0,.35,1) infinite}'+
'.base{fill:none;stroke:var(--ln2);stroke-dasharray:3 5}'+
'@keyframes draw{0%{stroke-dashoffset:330}60%,100%{stroke-dashoffset:0}}'+
'.dot{position:absolute;left:0;top:0;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px var(--ion-ring),0 0 16px var(--ion-glow);offset-path:path("M4 84 C 60 84, 70 -14, 128 10 S 196 14, 216 12");animation:ride 3.4s cubic-bezier(.65,0,.35,1) infinite}'+
'@keyframes ride{0%{offset-distance:0%}60%,100%{offset-distance:100%}}'+
'@container (max-width:420px){.aa{font-size:84px}.rt{display:none}}',
'<div class="c" style="gap:36px;padding:28px"><div class="aa">Aa</div><div class="rt" style="display:flex;flex-direction:column;gap:18px;min-width:0"><div class="sw"><i></i><i></i><i></i><i></i><i></i></div><div class="spw"><svg viewBox="0 0 220 90"><path class="base" d="M4 12 H216"/><path class="cv" d="M4 84 C 60 84, 70 -14, 128 10 S 196 14, 216 12"/></svg><span class="dot"></span></div><div class="mono">wght 300 → 800 · one hue · one spring</div></div></div>'];},
layout:function(){return ['.fr{width:100%;max-width:540px;height:190px;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:10px;animation:fw 9s var(--sp) infinite}'+
'@keyframes fw{0%,26%{width:100%}33%,59%{width:64%}66%,92%{width:36%}100%{width:100%}}'+
'.bar{height:16px;border-radius:6px;background:var(--sf3);flex:none;display:flex;gap:6px;align-items:center;padding:0 6px}.bar i{width:6px;height:6px;border-radius:50%;background:var(--ln2)}'+
'.gd{flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(60px,1fr));gap:8px;align-content:start;overflow:hidden}'+
'.gd b{display:block;height:42px;border-radius:9px;background:var(--ion-soft);border:1px solid var(--ion-ring);transition:all .3s}.gd b:nth-child(3n+2){background:color-mix(in oklch,var(--cyan) 16%,transparent);border-color:color-mix(in oklch,var(--cyan) 35%,transparent)}'+
'.lab{position:relative;height:14px;width:240px;text-align:center}.lab span{position:absolute;inset:0;font:500 11px/14px var(--fm);letter-spacing:.06em;text-transform:uppercase;color:var(--ion-tx);opacity:0;animation:lb 9s infinite}'+
'.lab span:nth-child(2){animation-delay:3s}.lab span:nth-child(3){animation-delay:6s}@keyframes lb{0%,30%{opacity:1}33%,100%{opacity:0}}',
'<div class="c" style="flex-direction:column;gap:16px;padding:24px"><div class="lab"><span>Desktop · 12 columns</span><span>Tablet · 8 columns</span><span>Phone · 4 columns</span></div><div class="fr gl"><div class="bar"><i></i><i></i><i></i></div><div class="gd"><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b><b></b></div></div></div>'];},
controls:function(){return ['.pn{padding:6px 18px}.rw{display:flex;align-items:center;gap:14px;padding:14px 0;border-top:1px solid var(--ln)}.rw:first-child{border-top:0}'+
'.rw b{display:block;font:500 14px/1.3 var(--ft)}.rw small{display:block;font:400 12px/1.4 var(--ft);color:var(--tx3)}'+
'.sw{position:relative;flex:none;margin-left:auto;width:44px;height:26px;border-radius:999px;background:var(--sf4);border:1px solid var(--ln2);animation:swt 4s infinite}'+
'.sw i{position:absolute;top:1px;left:1px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);animation:swk 4s var(--sp) infinite}'+
'@keyframes swt{0%,15%,85%,100%{background:var(--sf4);border-color:var(--ln2);box-shadow:none}25%,75%{background:var(--ion);border-color:var(--ion);box-shadow:0 0 18px var(--ion-glow)}}'+
'@keyframes swk{0%,15%,85%,100%{transform:translateX(0)}25%,75%{transform:translateX(18px)}}'+
'.sl{position:relative;display:block;height:20px;margin-top:10px}.sl::before{content:"";position:absolute;left:0;right:0;top:7px;height:6px;border-radius:999px;background:var(--sf4)}'+
'.sl em{position:absolute;left:0;top:7px;height:6px;border-radius:999px;background:var(--ion);box-shadow:0 0 14px var(--ion-glow);animation:slf 5s var(--sp) infinite}'+
'.sl i{position:absolute;top:0;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.35);animation:slk 5s var(--sp) infinite}'+
'@keyframes slf{0%,10%,100%{width:24%}40%,55%{width:82%}}@keyframes slk{0%,10%,100%{left:24%}40%,55%{left:82%}}'+
'.cb{flex:none;width:18px;height:18px;border-radius:5px;border:1.5px solid var(--ln2);display:grid;place-items:center;animation:cbb 4s infinite}'+
'.cb svg{width:12px;height:12px;fill:none;stroke:var(--ion-fg);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:16;stroke-dashoffset:16;animation:cbk 4s infinite}'+
'@keyframes cbb{0%,30%,90%,100%{background:transparent;border-color:var(--ln2)}38%,82%{background:var(--ion);border-color:var(--ion)}}@keyframes cbk{0%,36%,90%,100%{stroke-dashoffset:16}48%,82%{stroke-dashoffset:0}}'+
'.bt{flex:none;margin-left:auto;height:34px;padding:0 14px;border-radius:10px;display:inline-flex;align-items:center;font:500 13px var(--ft);background:var(--ion);color:var(--ion-fg);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 8px 20px -8px var(--ion-glow);animation:prs 3s var(--sp) infinite}'+
'@keyframes prs{0%,60%,100%{transform:none}66%{transform:scale(.93)}74%{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 0 0 8px var(--ion-soft),0 14px 30px -8px var(--ion-glow)}}',
'<div class="c"><div class="pn gl"><div class="rw"><div><b>Glass surfaces</b><small>Frost on every pane</small></div><span class="sw"><i></i></span></div><div class="rw"><div style="flex:1"><b>Glass intensity</b><span class="sl"><em></em><i></i></span></div></div><div class="rw"><span class="cb"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></span><b>Release notes</b><span class="bt">Save</span></div></div></div>'];},
inputs:function(){return ['.pn{padding:18px;gap:16px}.lbl{font:500 12px var(--ft);color:var(--tx2);margin-bottom:6px}'+
'.fd{height:40px;padding:0 12px;border-radius:10px;background:var(--bg2);border:1px solid var(--ln2);display:flex;align-items:center;font:400 14px var(--fm);animation:fc 6s infinite}'+
'@keyframes fc{0%,8%,96%,100%{border-color:var(--ln2);box-shadow:none}14%,88%{border-color:var(--ion);box-shadow:0 0 0 4px var(--ion-ring)}}'+
'.ty{display:inline-block;overflow:hidden;white-space:nowrap;width:0;animation:typ 6s steps(9,end) infinite}@keyframes typ{0%,16%{width:0}46%,88%{width:9ch}96%,100%{width:0}}'+
'.ca{width:1.5px;height:16px;background:var(--ion);margin-left:1px;animation:bl 1s step-end infinite}'+
'.sf{margin-left:auto;font:400 12px var(--fm);color:var(--tx3)}'+
'.otp{display:flex;gap:8px}.otp i{font-style:normal;flex:1;max-width:44px;height:46px;border-radius:10px;display:grid;place-items:center;background:var(--bg2);border:1px solid var(--ln2);font:500 18px var(--fm);color:transparent;animation:ot 6s infinite}'+
'.otp i:nth-child(2){animation-delay:.25s}.otp i:nth-child(3){animation-delay:.5s}.otp i:nth-child(4){animation-delay:.75s}.otp i:nth-child(5){animation-delay:1s}.otp i:nth-child(6){animation-delay:1.25s}'+
'@keyframes ot{0%,50%{color:transparent;border-color:var(--ln2);transform:none}54%{transform:translateY(-3px);border-color:var(--ion)}60%,90%{color:var(--tx);border-color:var(--ion-ring);transform:none}100%{color:transparent;border-color:var(--ln2)}}',
'<div class="c"><div class="pn gl"><div><div class="lbl">Workspace URL</div><div class="fd"><span class="ty">northwind</span><span class="ca"></span><span class="sf">.canvas.dev</span></div></div><div><div class="lbl">Verification code</div><div class="otp"><i>4</i><i>8</i><i>2</i><i>1</i><i>0</i><i>7</i></div></div></div></div>'];},
navigation:function(){return ['.tb{position:relative;display:grid;grid-template-columns:repeat(4,96px);border-bottom:1px solid var(--ln);font:500 13px var(--ft);color:var(--tx2);text-align:center}'+
'.tb span{height:40px;line-height:40px;animation:lt 8s infinite}.tb span:nth-child(2){animation-delay:2s}.tb span:nth-child(3){animation-delay:4s}.tb span:nth-child(4){animation-delay:6s}@keyframes lt{0%,22%{color:var(--tx)}25%,100%{color:var(--tx2)}}'+
'.tb i{position:absolute;left:0;bottom:-1px;width:96px;height:2px;border-radius:2px;background:var(--ion);box-shadow:0 0 12px var(--ion-glow);animation:ul 8s var(--sp) infinite}'+
'@keyframes ul{0%,20%,100%{transform:translateX(0)}25%,45%{transform:translateX(96px)}50%,70%{transform:translateX(192px)}75%,95%{transform:translateX(288px)}}'+
'.bar{position:relative;width:min(380px,90%);height:60px;border-radius:999px;display:grid;grid-template-columns:repeat(5,1fr);align-items:center;justify-items:center;padding:6px;color:var(--tx2);font-size:20px}'+
'.bar b{position:absolute;top:6px;left:6px;height:46px;width:calc((100% - 12px) / 5);border-radius:999px;background:var(--ion-soft);border:1px solid var(--ion-ring);animation:pl 10s var(--sp) infinite}'+
'@keyframes pl{0%,16%,100%{transform:translateX(0)}20%,36%{transform:translateX(100%)}40%,56%{transform:translateX(200%)}60%,76%{transform:translateX(300%)}80%,96%{transform:translateX(400%)}}'+
'.bar cv-icon{position:relative}'+
'@container (max-width:420px){.tb{grid-template-columns:repeat(4,72px);font-size:11px}.tb i{width:72px;animation-name:ul2}}@keyframes ul2{0%,20%,100%{transform:translateX(0)}25%,45%{transform:translateX(72px)}50%,70%{transform:translateX(144px)}75%,95%{transform:translateX(216px)}}',
'<div class="c" style="flex-direction:column;gap:30px;padding:24px"><div class="tb"><span>Overview</span><span>Components</span><span>Tokens</span><span>Changelog</span><i></i></div><div class="bar gl"><b></b><cv-icon n="home"></cv-icon><cv-icon n="inbox"></cv-icon><cv-icon n="columns2"></cv-icon><cv-icon n="messageCircle"></cv-icon><cv-icon n="settings"></cv-icon></div></div>'];},
data:function(){return ['.stk{position:relative;width:270px;height:176px;transform-style:preserve-3d;animation:tl 8s ease-in-out infinite}'+
'@keyframes tl{0%,100%{transform:rotateX(16deg) rotateY(-20deg) rotateZ(3deg)}50%{transform:rotateX(8deg) rotateY(-8deg) rotateZ(0)}}'+
'.cd{position:absolute;inset:0;border-radius:18px;padding:18px}.c3{animation:f3 8s var(--sp) infinite}.c2{animation:f2 8s var(--sp) infinite}'+
'@keyframes f3{0%,100%{transform:translate3d(28px,-28px,-60px);opacity:.45}50%{transform:translate3d(56px,-48px,-90px);opacity:.6}}'+
'@keyframes f2{0%,100%{transform:translate3d(14px,-14px,-30px);opacity:.7}50%{transform:translate3d(28px,-24px,-45px);opacity:.8}}'+
'.num{font:600 46px/1.05 var(--fd);letter-spacing:-.03em;margin-top:10px;font-variant-numeric:tabular-nums}.dl{font:500 12px var(--fm);color:var(--ok);margin-top:4px}'+
'.spk{position:absolute;left:18px;bottom:16px;width:calc(100% - 36px);height:36px;overflow:visible}.spk path{fill:none;stroke:var(--ion);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:260;stroke-dashoffset:260;animation:dr2 4s cubic-bezier(.65,0,.35,1) infinite}'+
'@keyframes dr2{0%{stroke-dashoffset:260}50%,100%{stroke-dashoffset:0}}',
'<div class="c" style="perspective:900px"><div class="stk"><div class="cd gl c3"></div><div class="cd gl c2"></div><div class="cd gl"><div class="mono">Installs · this week</div><div class="num">48.2k</div><div class="dl">+12.4% vs. last week</div><svg class="spk" viewBox="0 0 200 36" preserveAspectRatio="none"><path d="M0 32 L20 28 L40 30 L60 22 L80 24 L100 16 L120 18 L140 10 L160 12 L180 4 L200 6"/></svg></div></div></div>'];},
charts:function(){return ['.wrap{position:absolute;inset:0;display:flex;gap:14px;padding:22px;align-items:stretch}'+
'.ch{flex:1.6;min-width:0;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:10px}.ln{width:100%;flex:1;min-height:0;overflow:visible}'+
'.gr line{stroke:var(--ln);stroke-dasharray:2 4}'+
'.pl{fill:none;stroke:var(--ion);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:420;stroke-dashoffset:420;animation:dr 6s cubic-bezier(.65,0,.35,1) infinite}'+
'@keyframes dr{0%,5%{stroke-dashoffset:420;opacity:1}45%,88%{stroke-dashoffset:0;opacity:1}98%,100%{stroke-dashoffset:0;opacity:0}}'+
'.ar{fill:var(--ion);fill-opacity:.14;animation:af 6s infinite}@keyframes af{0%,30%{opacity:0}50%,88%{opacity:1}98%,100%{opacity:0}}'+
'.end{fill:var(--ion);transform-box:fill-box;transform-origin:center;animation:ed 6s var(--sp) infinite}@keyframes ed{0%,44%{transform:scale(0)}52%,88%{transform:scale(1)}98%,100%{transform:scale(0)}}'+
'.side{flex:1;display:flex;flex-direction:column;gap:14px;min-width:0}'+
'.br{flex:1;border-radius:16px;padding:14px;display:flex;align-items:flex-end;gap:7px}'+
'.br i{flex:1;border-radius:5px 5px 3px 3px;background:linear-gradient(180deg,var(--cyan),color-mix(in oklch,var(--cyan) 30%,transparent));transform-origin:bottom;animation:bg 6s var(--sp) infinite}'+
'.br i:nth-child(1){height:40%}.br i:nth-child(2){height:62%;animation-delay:.08s}.br i:nth-child(3){height:48%;animation-delay:.16s}.br i:nth-child(4){height:80%;animation-delay:.24s}.br i:nth-child(5){height:66%;animation-delay:.32s}.br i:nth-child(6){height:92%;animation-delay:.4s}'+
'@keyframes bg{0%,8%{transform:scaleY(0)}30%,88%{transform:scaleY(1)}98%,100%{transform:scaleY(0)}}'+
'.dn{flex:1;border-radius:16px;display:grid;place-items:center}.dn svg{width:84px;height:84px;transform:rotate(-90deg)}.dn circle{fill:none;stroke-width:10}.tr{stroke:var(--sf4)}'+
'.s1{stroke:var(--ion);stroke-dasharray:0 189;animation:d1 6s var(--sp) infinite}@keyframes d1{0%,10%{stroke-dasharray:0 189}40%,88%{stroke-dasharray:96 189}98%,100%{stroke-dasharray:0 189}}'+
'.s2{stroke:var(--mint);stroke-dashoffset:-100;stroke-dasharray:0 189;animation:d2 6s var(--sp) infinite}@keyframes d2{0%,20%{stroke-dasharray:0 189}50%,88%{stroke-dasharray:56 189}98%,100%{stroke-dasharray:0 189}}'+
'@container (max-width:440px){.side{display:none}}',
'<div class="wrap"><div class="ch gl"><div class="mono">Weekly downloads</div><svg class="ln" viewBox="0 0 300 130" preserveAspectRatio="none"><g class="gr"><line x1="0" x2="300" y1="20" y2="20"/><line x1="0" x2="300" y1="55" y2="55"/><line x1="0" x2="300" y1="90" y2="90"/><line x1="0" x2="300" y1="125" y2="125"/></g><path class="ar" d="M0 110 L30 96 L60 100 L90 76 L120 82 L150 58 L180 64 L210 40 L240 46 L270 22 L300 28 L300 130 L0 130Z"/><path class="pl" d="M0 110 L30 96 L60 100 L90 76 L120 82 L150 58 L180 64 L210 40 L240 46 L270 22 L300 28"/><circle class="end" cx="300" cy="28" r="4.5"/></svg></div><div class="side"><div class="br gl"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="dn gl"><svg viewBox="0 0 80 80"><circle class="tr" cx="40" cy="40" r="30"/><circle class="s1" cx="40" cy="40" r="30"/><circle class="s2" cx="40" cy="40" r="30"/></svg></div></div></div>'];},
overlays:function(){return ['.pg{position:absolute;inset:0;padding:22px;display:flex;flex-direction:column;gap:10px}.sk{height:10px;border-radius:6px;background:var(--sf3)}'+
'.scr{position:absolute;inset:0;background:var(--scrim);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);opacity:0;animation:sc 8s infinite}@keyframes sc{0%,10%{opacity:0}18%,62%{opacity:1}70%,100%{opacity:0}}'+
'.dlg{position:absolute;left:50%;top:50%;width:min(320px,82%);padding:18px;border-radius:20px;display:flex;flex-direction:column;gap:10px;opacity:0;transform:translate(-50%,-42%);animation:dg 8s var(--sp) infinite}'+
'@keyframes dg{0%,12%{opacity:0;transform:translate(-50%,-42%) scale(.97)}22%,60%{opacity:1;transform:translate(-50%,-50%) scale(1)}68%,100%{opacity:0;transform:translate(-50%,-47%) scale(.98)}}'+
'.dlg b{font:600 16px/1.2 var(--fd)}.dlg p{margin:0;font:400 13px/1.45 var(--ft);color:var(--tx2)}'+
'.ic{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--ion-soft);color:var(--ion-tx);font-size:17px}'+
'.fld{height:36px;border-radius:10px;background:var(--bg2);border:1px solid var(--ion);box-shadow:0 0 0 4px var(--ion-ring);display:flex;align-items:center;padding:0 12px;font:400 13px var(--ft)}'+
'.ac{display:flex;justify-content:flex-end;gap:8px;margin-top:2px}.gh{height:32px;padding:0 12px;display:inline-flex;align-items:center;font:500 13px var(--ft);color:var(--tx2)}'+
'.pr{height:32px;padding:0 12px;border-radius:9px;display:inline-flex;align-items:center;background:var(--ion);color:var(--ion-fg);font:500 13px var(--ft);animation:pr2 8s var(--sp) infinite}@keyframes pr2{0%,52%,100%{transform:none}56%{transform:scale(.93)}}'+
'.tst{position:absolute;right:18px;bottom:18px;height:44px;padding:0 14px;border-radius:14px;display:flex;align-items:center;gap:10px;font:500 13px var(--ft);opacity:0;animation:ts 8s var(--sp) infinite}'+
'.tst cv-icon{color:var(--ok);font-size:17px}.tst em{font-style:normal;color:var(--ion-tx);font-weight:600}'+
'@keyframes ts{0%,64%{opacity:0;transform:translateY(24px)}72%,92%{opacity:1;transform:none}98%,100%{opacity:0;transform:translateY(8px)}}',
'<div class="pg"><div class="sk" style="width:38%;height:14px"></div><div class="sk" style="width:86%"></div><div class="sk" style="width:72%"></div><div class="sk" style="width:90%"></div><div class="sk" style="width:54%"></div><div class="sk" style="width:80%"></div><div class="sk" style="width:64%"></div></div><div class="scr"></div><div class="dlg gl"><span class="ic"><cv-icon n="users"></cv-icon></span><b>Invite teammates</b><p>They get edit access to this board only.</p><div class="fld">noor@nannier.com</div><div class="ac"><span class="gh">Cancel</span><span class="pr">Send invites</span></div></div><div class="tst gl"><cv-icon n="circleCheck"></cv-icon><span>Invites sent</span><em>Undo</em></div>'];},
skins:function(){return ['.pfl{position:relative;display:grid;grid-template-columns:repeat(3,84px);padding:3px;border-radius:12px;background:var(--sf3);border:1px solid var(--ln);font:500 12px var(--ft);text-align:center}'+
'.pfl::before{content:"";position:absolute;top:3px;left:3px;width:84px;height:calc(100% - 6px);border-radius:9px;background:var(--sf);box-shadow:var(--sh-sm);animation:pt 9s var(--sp) infinite}'+
'@keyframes pt{0%,28%,100%{transform:translateX(0)}33%,61%{transform:translateX(84px)}66%,94%{transform:translateX(168px)}}.pfl span{position:relative;height:28px;line-height:28px}'+
'.mo{display:flex;align-items:center;gap:22px}'+
'.mb{display:inline-flex;align-items:center;justify-content:center;background:var(--ion);color:var(--ion-fg);font:500 15px var(--ft);box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 10px 24px -10px var(--ion-glow);animation:mbk 9s var(--sp) infinite}'+
'@keyframes mbk{0%,28%,100%{height:40px;width:150px;border-radius:10px;font-family:var(--ft)}33%,61%{height:50px;width:196px;border-radius:999px;font-family:-apple-system,system-ui,sans-serif;font-weight:600}66%,94%{height:40px;width:168px;border-radius:999px;font-family:Roboto,system-ui,sans-serif}}'+
'.ms{position:relative;flex:none;border-radius:999px;background:var(--ion);animation:msk 9s var(--sp) infinite}'+
'@keyframes msk{0%,28%,100%{width:44px;height:26px;background:var(--ion)}33%,61%{width:51px;height:31px;background:var(--ok)}66%,94%{width:52px;height:32px;background:var(--ion)}}'+
'.ms i{position:absolute;top:50%;right:2px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transform:translateY(-50%);animation:mst 9s var(--sp) infinite}'+
'@keyframes mst{0%,28%,100%{width:22px;height:22px;background:#fff}33%,61%{width:27px;height:27px;background:#fff}66%,94%{width:24px;height:24px;background:var(--ion-fg)}}',
'<div class="c" style="flex-direction:column;gap:24px"><div class="pfl"><span>Web</span><span>iOS</span><span>Android</span></div><div class="mo"><span class="mb">Continue</span><span class="ms"><i></i></span></div><div class="mono">One tree · three native shapes</div></div>'];}
};
class CvHero extends HTMLElement{
 static get observedAttributes(){return['kind'];}
 connectedCallback(){this.r();}
 attributeChangedCallback(){if(this.isConnected)this.r();}
 disconnectedCallback(){cancelAnimationFrame(this._raf);}
 r(){var k=this.getAttribute('kind')||'controls';if(this._k===k)return;this._k=k;var v=(K[k]||K.controls)();
  (this.shadowRoot||this.attachShadow({mode:'open'})).innerHTML='<style>'+BASE+v[0]+'</style><div class="st">'+v[1]+'</div>';
  cancelAnimationFrame(this._raf);
  if(k==='data'){var el=this.shadowRoot.querySelector('.num'),self=this,red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(red){el.textContent='48.2k';return;}
   var t0=performance.now(),tick=function(now){var t=((now-t0)%4000)/4000,p=Math.min(1,t/.5),e=1-Math.pow(1-p,3);el.textContent=(48.2*e).toFixed(1)+'k';self._raf=requestAnimationFrame(tick);};self._raf=requestAnimationFrame(tick);}
 }
}
customElements.get('cv-hero')||customElements.define('cv-hero',CvHero);
})();
