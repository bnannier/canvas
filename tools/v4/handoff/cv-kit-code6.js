/* Canvas v4.0.0 kit · code-driven rendering, part 6: the deep-check fixes. Sub-component labels for icon-only and
   collapsed states, object-shaped actions, element empty states, ActionPanel children, and the iOS / Android
   skins reading the same props the web skin draws. */
(function run(){const K=window.CVK;if(!K||!K.OV||!K.reg||!K.codev5||!K.PFR||!K.PFR.input||!K.R['action-panels']){setTimeout(run,20);return;}
const X=window.CVX,e=K.esc,a=K.a,f=K.f,ic=K.ic,H=K.H,T_=K.T_,P=K.PFR;
const RANK=6,SEEN={};const O=(s,fn)=>{const i=SEEN[s]=(SEEN[s]||0)+1;K.reg(K.OV[s]=K.OV[s]||[],RANK,i,fn);};
const has=p=>p.__kids!=null&&p.__kids!=='';
const lbl=x=>typeof x==='string'||typeof x==='number'?String(x):x&&(x.label||x.title||x.name)||'';
const SR=t=>`<span style="position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap">${e(t)}</span>`;
/* the matching </div> for the element that carries data-a="n" */
const close=(h,n)=>{const i=h.indexOf('data-a="'+n+'"');if(i<0)return -1;const s=h.lastIndexOf('<',i);const tag=h.slice(s+1).match(/^\w+/)[0];let d=0,k=s;const re=new RegExp('<(/?)'+tag+'\\b','g');re.lastIndex=s;let m;while((m=re.exec(h))){if(m[1])d--;else d++;if(!d)return m.index;}return -1;};
const insEnd=(h,n,add)=>{const j=close(h,n);return j<0?h:h.slice(0,j)+add+h.slice(j);};
const insStart=(h,n,add)=>{const i=h.indexOf('data-a="'+n+'"');if(i<0)return h;const j=h.indexOf('>',i);return h.slice(0,j+1)+add+h.slice(j+1);};
const styleOf=(h,n,add)=>{const i=h.indexOf('data-a="'+n+'"');if(i<0)return h;const s=h.indexOf('style="',i);if(s<0)return h;const t=h.indexOf('"',s+7);return h.slice(0,t)+';'+add+h.slice(t);};
const rootStyle=(h,add)=>{const m=h.match(/^<\w+[^>]*?style="([^"]*)"/);if(!m)return h;return h.replace(m[0],m[0].slice(0,-1)+';'+add+'"');};
K.PW=K.PW||{};const WS={};const W=(s,pf,fn)=>{const m=K.PW[s]=K.PW[s]||{},key=s+':'+pf,i=WS[key]=(WS[key]||0)+1;K.reg(m[pf]=m[pf]||[],RANK,i,fn);};
const both=(s,fn)=>{W(s,'ios',fn);W(s,'android',fn);};
/* Toast: action given as { label, onPress } */
K.AD.toast=p=>p.action&&typeof p.action==='object'&&p.action.html==null?{...p,action:lbl(p.action)}:p;
/* ButtonGroup: icon names from items, labels for icon-only segments, the stepper's current item */
O('button-group',(p,c,b)=>{let h=b(p,c);const it=p.__items;if(!it)return h;
 if(p.stepper){const act=p.active??1;h=h.replace(/(<span style="min-width:32px;text-align:center;font:500 14px var\(--fm\)">)2(<\/span>)/,'$1'+e(it[act]||it[0]||'')+'$2');}
 if(p.iconsOnly){let i=0;h=h.replace(/<\/cv-icon>/g,m=>m+(it[i]!=null?SR(it[i++]):''));}return h;});
both('button-group',(p,c,b,o)=>{let h=o(p,c,b);if(p.iconsOnly&&p.__items){let i=0;h=h.replace(/<cv-icon n="(layoutList|layoutGrid|columns2)"/g,m=>{const n=p.__icons&&p.__icons[i++];return n?'<cv-icon n="'+n+'"':m;});let k=0;h=h.replace(/<\/cv-icon>/g,m=>m+(p.__items[k]!=null?SR(p.__items[k++]):''));}return h;});
/* Sidebar collapsed: item names stay readable to assistive tech */
O('sidebar',(p,c,b)=>{let h=b(p,c);if(p.collapsed&&Array.isArray(p.items)){let i=0;h=h.replace(/(<div(?: data-a="[0-9]+")? title="[^"]*" style="position:relative;[^"]*">)(<cv-icon[^>]*><\/cv-icon>)/g,(m,s1,s2)=>s1+s2+SR(lbl(p.items[i++])));}return h;});
/* DataTable: an element as the empty message */
O('data-table',(p,c,b)=>{if(!(p.emptyMessage&&p.emptyMessage.html!=null))return b(p,c);return b({...p,emptyMessage:'\u0000'},c).replace(/(<div style="padding:28px 16px;text-align:center;[^"]*">)\u0000(<\/div>)/,'$1'+p.emptyMessage.html+'$2');});
/* ActionPanel: the snippet's fields under the title, the action beside or below */
O('action-panels',(p,c,b)=>{if(!has(p)&&!p.__deep)return b(p,c);const d=!!p.destructive;
 return `<div${a(1)} style="width:100%;max-width:560px;padding:18px;border-radius:16px;box-sizing:border-box;background:${d?'var(--bad-soft)':'var(--sf)'};border:1px solid ${d?'color-mix(in oklch,var(--bad) 35%,transparent)':'var(--ln)'};display:flex;flex-direction:column;gap:14px"><div style="display:flex;justify-content:space-between;align-items:${has(p)?'flex-start':'center'};gap:16px;flex-wrap:wrap"><div style="display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 220px"><div${a(2)} style="font:600 15px ${f};color:${d?'var(--bad)':'var(--tx)'}">${e(T_(p.title))}</div>${p.description?`<div${a(3)} style="font:400 13px/1.5 ${f};color:var(--tx2)">${e(T_(p.description))}</div>`:''}</div>${!has(p)&&p.actionLabel?`<span${a(4)}>${K.btn({destructive:d,secondary:!d,small:1,children:p.actionLabel},c)}</span>`:p.toggle?`<span${a(4)}>${K.render('switch',{checked:!!p.checked},c)}</span>`:''}</div>${has(p)?`<div style="display:flex;flex-direction:column;gap:12px">${p.__kids}</div>${p.actionLabel?`<div${a(4)} style="display:flex;justify-content:flex-end;padding-top:12px;border-top:1px solid var(--ln)">${K.btn({destructive:d,children:p.actionLabel},c)}</div>`:''}`:''}</div>`;});
/* Input on iOS and Android: toolbar search, trailing icon, action suffix */
both('input',(p,c,b,o)=>{const pf=c.pf;
 if(p.search&&!p.label){const v=p.value;return pf==='ios'?`<div${a(2)} style="display:flex;align-items:center;gap:6px;width:300px;max-width:100%;height:36px;padding:0 8px;border-radius:10px;background:var(--sf3);box-sizing:border-box">${ic('search',16,'color:var(--tx3)')}<span${a(4)} style="flex:1;font:400 17px ${f};color:${v?'var(--tx)':'var(--tx3)'}">${e(v||p.placeholder||'Search')}</span></div>`:`<div${a(2)} style="display:flex;align-items:center;gap:16px;width:320px;max-width:100%;height:56px;padding:0 16px;border-radius:999px;background:var(--sf3);box-sizing:border-box">${ic('search',22,'color:var(--tx2)')}<span${a(4)} style="flex:1;font:400 16px ${f};color:${v?'var(--tx)':'var(--tx2)'}">${e(v||p.placeholder||'Search')}</span></div>`;}
 const q={...p};let tail='';
 if(p.trailingIcon&&p.icon&&p.icon.icon){tail+=`<span${a(5)} style="display:inline-flex;color:var(--tx3)">${ic(p.icon.icon,20)}</span>`;delete q.icon;}
 if(p.action&&p.suffix){delete q.suffix;tail+=pf==='ios'?`<span style="align-self:stretch;margin-right:-12px;padding:0 12px;display:flex;align-items:center;border-left:1px solid var(--ln2);font:600 15px ${f};color:var(--ion-tx);background:var(--sf2)">${e(p.suffix)}</span>`:`<span style="font:500 14px ${f};letter-spacing:.5px;text-transform:uppercase;color:var(--ion-tx)">${e(p.suffix)}</span>`;}
 let h=o(q,c,b);if(tail)h=insEnd(h,2,tail);if(p.readOnly&&pf==='android')h=styleOf(h,2,'box-shadow:inset 0 -1px 0 var(--tx3);background-image:none;background-color:transparent;border:1px dashed var(--ln2)');return h;});
/* Select on iOS and Android: a leading icon and the inline label */
both('select',(p,c,b,o)=>{let q={...p};const inl=p.inline&&p.label;if(inl)delete q.label;let h=o(q,c,b);
 if(p.icon)h=insStart(h,2,`<span style="display:inline-flex;margin-right:${c.pf==='android'?4:0}px;color:var(--tx3)">${ic(typeof p.icon==='string'?p.icon:p.icon.icon||'globe',18)}</span>`);
 if(p.icon&&c.pf==='ios')h=styleOf(h,2,'gap:8px');
 if(inl)h=`<div style="display:inline-flex;align-items:center;gap:12px"><span${a(1)} style="font:500 ${c.pf==='ios'?15:14}px ${f};color:var(--tx2);white-space:nowrap">${e(p.label)}</span><div style="width:180px">${h}</div></div>`;return h;});
/* Textarea flush on iOS and Android */
both('textarea',(p,c,b,o)=>{let h=o(p,c,b);return p.flush?styleOf(h,2,'border:0;border-radius:0;background:transparent;box-shadow:none').replace(/width:340px;max-width:100%/,'width:100%;max-width:100%'):h;});
/* Tabs wrap on iOS and Android */
both('tabs',(p,c,b,o)=>{const h=o(p,c,b);return p.wrap?rootStyle(h,'flex-wrap:wrap;row-gap:4px'):h;});
/* Radio row on Android (iOS keeps the inset grouped checkmark list) */
W('radio','android',(p,c,b,o)=>{const h=o(p,c,b);return p.row||p.horizontal?rootStyle(h,'flex-direction:row;flex-wrap:wrap;column-gap:24px'):h;});
/* Slider step ticks on iOS (tick dots under the fill) and Android (stop dots) */
both('slider',(p,c,b,o)=>{let h=o(p,c,b);const S=K.sv(p),n=p.step&&(S.mx-S.mn)/p.step<=24?Math.round((S.mx-S.mn)/p.step):0;if(!n)return h;
 const t=Array.from({length:n+1},(x,i)=>`<span style="position:absolute;top:50%;left:calc(${i/n*100}% - 2px);width:4px;height:4px;margin-top:-2px;border-radius:50%;background:${i/n*100<=S.pct&&c.pf==='android'?'var(--ion-fg)':'var(--tx3)'};opacity:.75;z-index:1"></span>`).join('');
 const k=h.indexOf('<div data-a="3"');return k<0?h:h.slice(0,k)+t+h.slice(k);});
/* Stepper bounds on iOS and Android */
both('stepper',(p,c,b,o)=>{let h=o(p,c,b);const v=p.value??2,st=p.step||1;if(p.min!=null&&v-st<p.min)h=styleOf(h,1,'opacity:.35');if(p.max!=null&&v+st>p.max)h=styleOf(h,3,'opacity:.35');return h;});
/* Chip colours on Android */
const CH={red:25,orange:50,amber:80,yellow:95,lime:125,green:150,teal:185,cyan:205,blue:245,indigo:270,violet:290,purple:305,pink:350,rose:10};
W('chip','android',(p,c,b,o)=>{let h=o(p,c,b);const k=Object.keys(CH).find(x=>p[x]===true);if(k){const Hh=CH[k];h=styleOf(h,1,`background:oklch(.7 .15 ${Hh} / .16);color:color-mix(in oklch,oklch(.64 .17 ${Hh}) 72%,var(--tx));border-color:oklch(.7 .15 ${Hh} / .3)`);}else if(p.gray)h=styleOf(h,1,'background:var(--sf3);color:var(--tx2)');return h;});
/* Progress description on iOS and Android */
both('progress',(p,c,b,o)=>{let h=o(p,c,b);if(p.description){const k=h.indexOf('<div data-a="2"');if(k>0)h=h.slice(0,k)+`<div style="margin-top:-4px;font:400 ${c.pf==='ios'?13:12}px ${f};color:var(--tx3)">${e(p.description)}</div>`+h.slice(k);}return h;});
K.codev6=1;
})();
