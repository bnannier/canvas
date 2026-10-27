/* Canvas v4.0.0 kit · code-driven rendering, part 8: states and anatomy. Every listed state draws differently, every
   numbered anatomy part carries its marker, and each chart's anatomy names what that chart actually draws. */
(function run(){const K=window.CVK;if(!K||!K.OV||!K.reg||!K.codev7){setTimeout(run,20);return;}
const e=K.esc,a=K.a,f=K.f,ic=K.ic;
const RANK=8,SEEN={};const O=(s,fn)=>{const i=SEEN[s]=(SEEN[s]||0)+1;K.reg(K.OV[s]=K.OV[s]||[],RANK,i,fn);};
K.PW=K.PW||{};const WS={};const W=(s,pf,fn)=>{const m=K.PW[s]=K.PW[s]||{},key=s+':'+pf,i=WS[key]=(WS[key]||0)+1;K.reg(m[pf]=m[pf]||[],RANK,i,fn);};
const mark=(h,re,n)=>{if(h.includes('data-a="'+n+'"'))return h;let done=false;return h.replace(re,m=>{if(done)return m;done=true;return m.replace(/^<(\w+)/,'<$1 data-a="'+n+'"');});};
K.SPX=K.SPX||{};const AN=(s,list)=>{(K.SPX[s]=K.SPX[s]||{}).an=list;};const AP=(s,ap)=>{(K.SPX[s]=K.SPX[s]||{}).ap=ap;};
/* States: collapsible hover and focus, data-table focus, Android switch hover halo */
O('collapsible',(p,c,b)=>{let h=b(p,c);if(c.st==='hover')h=h.replace(/(<div data-a="2" style=")/,'$1background:var(--sf3);border-radius:10px;');if(c.st==='focus')h=h.replace(/(<div data-a="2" style=")/,'$1'+K.focus(c)+'border-radius:10px;');return h;});
O('data-table',(p,c,b)=>{let h=b(p,c);if(c.st==='focus'){const re=h.includes('data-a="3"')?/(<\w+ data-a="3" style=")/:/(<\w+ data-a="1" style=")/;h=h.replace(re,'$1outline:2px solid var(--ion-ring);outline-offset:-2px;');}return h;});
O('switch',(p,c,b)=>{let h=b(p,c);if(c.st==='hover'&&c.pf==='android')h=h.replace(/(<span data-a="2" style=")/,'$1box-shadow:0 0 0 8px color-mix(in oklch,var(--tx) 8%,transparent);');return h;});
/* Anatomy: markers for the parts each preview draws */
O('tab-bar',(p,c,b)=>{const h=b(p,c);return mark(h,/<div style="border-radius:999px;display:flex;flex-direction:column/,2);});
AN('media-objects',['Media','Title','Description','Meta','Action']);AP('media-objects',{title:'Grace Hopper',description:'Compilers · Berlin',action:{el:'Button',html:K.btn({outline:1,small:1,children:'Follow'})}});
O('histogram',(p,c,b)=>{const h=b(p,c);return h.includes('data-a="4"')?h:h.replace(/(<\/svg>)/,`<line data-a="4" x1="28" x2="352" y1="150" y2="150" stroke="var(--ln2)" stroke-width="1"/>$1`);});AN('histogram',['Chart frame','Bins','Axis labels','Baseline','Gridlines']);
O('box-plot',(p,c,b)=>{let h=b(p,c);h=mark(h,/<text\b/,3);h=mark(h,/<line x1="[^"]*" x2="[^"]*" y1="[^"]*" y2="[^"]*" stroke="[^"]*" stroke-width="2"\/>/,4);return h;});AN('box-plot',['Chart frame','Box','Axis labels','Median','Gridlines']);
O('waterfall-chart',(p,c,b)=>{let h=b(p,c);h=mark(h,/<text\b/,3);h=mark(h,/<rect x="[^"]*" y="[^"]*" width="40" height="[^"]*" rx="4" fill="var\(--c1\)"/,4);return h;});AN('waterfall-chart',['Chart frame','Change bar','Axis labels','Total bar','Gridlines']);
O('pie-chart',(p,c,b)=>mark(b(p,c),/<text\b/,3));AN('pie-chart',['Chart frame','Slice','Center value','Legend']);
O('treemap',(p,c,b)=>{let h=b(p,c);h=mark(h,/<div style="width:100%;height:100%;border-radius:8px;/,3);h=mark(h,/<div style="font:500 11px var\(--fm\);opacity:\.75">/,4);return h;});AN('treemap',['Chart frame','Tile','Label','Value']);
O('stacked-bar',(p,c,b)=>mark(b(p,c),/<span style="font:400 12px var\(--fm\);color:var\(--tx3\)">/,3));AN('stacked-bar',['Strip','Segment','Total','Legend']);
O('funnel-chart',(p,c,b)=>{let h=b(p,c);h=mark(h,/<span style="color:var\(--tx2\)/,3);h=mark(h,/<span style="text-align:right;font:500 12px var\(--fm\)">/,4);return h;});AN('funnel-chart',['Chart frame','Stage bar','Stage label','Value']);
O('radial-bar-chart',(p,c,b)=>mark(b(p,c),/<circle cx="90" cy="90" r="[^"]*" fill="none" stroke="var\(--sf3\)"/,3));AN('radial-bar-chart',['Chart frame','Bar','Track','Legend']);
O('bullet-chart',(p,c,b)=>mark(b(p,c),/<span style="position:relative;height:[^"]*background:linear-gradient/,4));
O('radar-chart',(p,c,b)=>{let h=b(p,c);h=mark(h,/<text\b/,3);h=mark(h,/<polygon points="[^"]*" fill="none" stroke="var\(--ln2\)"/,5);return h;});AN('radar-chart',['Chart frame','Series','Axis labels','Legend','Grid']);
O('metric-breakdown',(p,c,b)=>{const h=b(p,c);return h.includes('data-a="1"')?h:h.replace(/^<(\w+)/,'<$1 data-a="1"');});
O('bar-list',(p,c,b)=>mark(b(p,c),/<span style="position:relative">/,4));
O('depth-chart',(p,c,b)=>mark(b(p,c),/<path d="M[^"]*" fill="var\(--bad\)"/,3));AN('depth-chart',['Chart frame','Bids','Asks','Legend','Gridlines']);
O('heatmap',(p,c,b)=>mark(b(p,c),/<div style="font:500 13px [^"]*">/,3));AN('heatmap',['Grid','Cell','Title','Legend']);
O('geo-map',(p,c,b)=>mark(b(p,c),/<cv-world\b/,3));
/* MediaObject with an icon lead */
O('media-objects',(p,c,b)=>{let h=b(p,c);if(p.icon&&(p.icon.icon||p.icon.html)){const s=p.compact?28:40;h=h.replace(/(<span data-a="2" style="display:inline-flex">)[\s\S]*?(<\/span><div style="flex:1;min-width:0">)/,'$1'+`<span style="width:${s}px;height:${s}px;border-radius:${Math.round(s*.28)}px;display:grid;place-items:center;flex:none;background:var(--ion-soft);color:var(--ion-tx)">${K.icn(p.icon,Math.round(s*.45))}</span>`+'$2');}return h;});
/* InputOTP: autoFocus shows the caret in the next cell */
AP('input-otp',{autoFocus:true});
O('input-otp',(p,c,b)=>p.autoFocus&&!c.st?b(p,{...c,st:'focus'}):b(p,c));
K.codev8=1;
})();
