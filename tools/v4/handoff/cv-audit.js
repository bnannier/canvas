/* Canvas v4.0.0 · variant audit. Compiles every Variants example with CVX (the same code-driven path the detail page
   renders with), then removes each prop of each element in turn: a prop whose removal leaves the preview unchanged is
   one the preview ignores. CVAudit.run() → [{slug,name,room,vi,t,code,sev,iss:[{c,props,d}]}] */
(function(){
const IGN=/^(on[A-Z]\w*|key|ref|testID|accessibility\w*|aria-[\w-]+|id|nativeID|render[A-Z]\w*|keyExtractor|getItemKey|__\w+)$/;
const BEH=/^(steadyPress|autoComplete|keyboardType|autoCapitalize|autoCorrect|responsive|secureTextEntry|returnKeyType|inputMode|name|hitSlop|delayLongPress|spellCheck|autoFocus|maxLength|textContentType|blurOnSubmit|selectTextOnFocus|href|target|rel|draggable|reorderable|unlocked|dismissible|closeOnSelect|loop|autoplay|interval|replay|once|threshold|delay|duration|systemFocus|inheritOverlays|maxLength|onMenu)$/;
const SIZE=/^(start|xxxs|xxs|xs|sm|md|lg|xl|xxl|xxxl|wide|wider|widest|page|width|height|minTileWidth|menuWidth|span|stacks|maxWidth|minWidth)$/;
const STATE=/^(default[A-Z]\w*|value|open|month|daysInMonth|startWeekday|selected|current|checked|expanded|min|max|step|today|page|active|order)$/;
const DATA=/^(items|columns|rows|labels|series|data|values|options|tabs|steps|messages|events|points|candles|segments|stages|axes|periods|groups|links|actions|footer|code|source|poster|formatValue|sections|cells|slides|nodes|initial)$/;
const CAT={
 unparsed:['Not parsed','high','The snippet cannot be compiled; the preview shows the playground defaults'],
 missing:['No renderer','high','This element has no preview renderer, so only its children are drawn'],
 error:['Render error','high','The preview throws'],
 content:['Children replaced','high','The element\u2019s children are swapped for built-in demo content'],
 data:['Data ignored','high','The preview draws its own demo data instead'],
 text:['Text ignored','high','The snippet\u2019s copy does not appear in the preview'],
 label:['Label not shown','high','The element\u2019s label text does not appear'],
 flag:['Variant flag ignored','high','The flag that defines the example has no effect'],
 state:['Initial state ignored','medium','The starting value or open state is not applied'],
 style:['Style ignored','medium','The style object is not applied'],
 size:['Sizing ignored','medium','The width step or layout sizing is not applied'],
 behavior:['Behaviour only','low','Non-visual prop; nothing to show']};
const RANK={high:0,medium:1,low:2};
const sh=v=>v&&typeof v==='object'?(v.$===1?'<'+v.t+'\u2026>':Array.isArray(v)?'[\u2026'+v.length+']':'{\u2026}'):typeof v==='string'?'"'+v.slice(0,40)+(v.length>40?'\u2026':'')+'"':typeof v==='function'?'fn':String(v);
const kind=(k,v)=>BEH.test(k)?'behavior':/style$/i.test(k)?'style':SIZE.test(k)?'size':STATE.test(k)?'state':DATA.test(k)?'data':v===true?'flag':typeof v==='string'||(v&&v.$===1)?'text':typeof v==='number'?'state':'data';
const deepStr=v=>{const o=[];const go=(x,d)=>{if(d>5||x==null)return;if(typeof x==='string'){if(x.length>1&&!/^(var\(|#|oklch|rgb|color-mix)/.test(x))o.push(x);return;}if(typeof x==='number'||typeof x==='boolean'||typeof x==='function')return;if(x.$===1){go(x.c,d+1);return;}if(Array.isArray(x))x.forEach(y=>go(y,d+1));else for(const k in x)if(!/^(id|key|value|columnId|href|src|uri|icon|type|role|date)$/.test(k))go(x[k],d+1);};go(v,0);return o;};
const PRIMS=new Set(['View','Text','ScrollView','Pressable','TouchableOpacity','SafeAreaView','Icon','','Page','OverlayProvider','Stateful']);
function run(){const D=window.CV_DOCS,K=window.CVK,X=window.CVX,out=[];
 const KN={};const known=(slug,k)=>{if(!KN[slug]){const sp=K.spec(slug),s=new Set();K.knobs(sp.k).filter(Boolean).forEach(q=>{if(q.ty==='flags')q.o.forEach(o=>o!=='-'&&s.add(o));else s.add(q.n);});const P=K.PFR[slug]||{};KN[slug]={s,src:String(sp.r)+(sp.__src||'')+(K.OV[slug]||[]).map(o=>String(o.fn||o)).join('')+String(P.ios||'')+String(P.android||'')+String(K.btn)+String(K.panel)};}
  const b=k.replace(/^default([A-Z])/,(m,c)=>c.toLowerCase());return [k,b].some(x=>KN[slug].s.has(x)||new RegExp('\\.'+x.replace(/[^\w]/g,'')+'\\b').test(KN[slug].src));};
 for(const slug of D.order){const c=D.c[slug];
  (c.variants||[]).forEach((v,vi)=>{if(!v.code)return;const iss=[],add=(cat,props,d)=>{const x=!d&&iss.find(i=>i.c===cat&&!i.d);if(x)x.props.push(...props);else iss.push({c:cat,props,d:d||''});};
   const r=X.run(v.code);
   if(!r.ok)add('unparsed',[],r.err);
   else{const h0=X.html(r.tree,{pf:'web'});
    if(/render error/.test(h0))add('error',[],(h0.match(/render error: ([^<]*)/)||[])[1]||'');
    const miss=new Set(),hid=new Set();X.walk(r.tree,n=>{if(n.p.open===false)X.walk(n,m=>{if(m!==n)hid.add(m);});});
    X.walk(r.tree,n=>{if(X.PRIM[n.t]){const ps=String(X.PRIM[n.t]);Object.keys(n.p).filter(k=>!IGN.test(k)&&n.p[k]!==false&&n.p[k]!==undefined&&!new RegExp('\\.'+k+'\\b').test(ps)&&!(n.t==='Icon'&&n.p[k]===true)).forEach(k=>{const keep=n.p[k];delete n.p[k];const h1=X.html(r.tree,{pf:'web'});n.p[k]=keep;if(h1===h0)add(kind(k,keep),['<'+n.t+'> '+k]);});return;}
     const s=X.tag(n.t);if(s&&!K.R[s]&&!(K.SUBS&&K.SUBS[s])){miss.add(n.t);return;}if(!s){if(!PRIMS.has(n.t)&&!X.PASS.has(n.t))miss.add(n.t);return;}
     Object.keys(n.p).filter(k=>!IGN.test(k)&&n.p[k]!==false&&n.p[k]!==undefined&&n.p[k]!==''&&!(Array.isArray(n.p[k])&&!n.p[k].length)&&!(n.t==='Draggable'&&k==='data')).forEach(k=>{const keep=n.p[k];delete n.p[k];const h1=X.html(r.tree,{pf:'web'});n.p[k]=keep;
      if(h1!==h0)return;if(kind(k,keep)==='behavior'){const n0=X.html(r.tree,{pf:'web',narrow:true});delete n.p[k];const n1=X.html(r.tree,{pf:'web',narrow:true});n.p[k]=keep;if(n0!==n1)return;}const ss=deepStr(keep);if(ss.length&&ss.every(x=>h0.includes(K.esc(x))))return;const cat=kind(k,keep);if(cat!=='style'&&cat!=='behavior'&&known(s,k))return;add(cat,['<'+n.t+'> '+k+(keep===true?'':'='+sh(keep))]);});
     const kids=n.c.filter(x=>x!=null&&x!==false&&x!==true&&x!=='');if(!kids.length||n.p.open===false||hid.has(n)||(n.t==='Collapsible'&&!n.p.open&&!n.p.defaultOpen)||(n.t==='Tooltip'&&!n.p.open))return;
     const t=X.text(kids),w=t.split(/\s+/).filter(x=>x.length>2);if(!w.length)return;
     const hit=w.filter(x=>h0.includes(K.esc(x))).length/w.length;if(hit>=.5)return;
     if(kids.every(x=>typeof x==='string'||typeof x==='number'))add('label',[],'<'+n.t+'> "'+t.slice(0,60)+'" is not in the preview');
     else add('content',[],'<'+n.t+'> children "'+t.slice(0,64)+(t.length>64?'\u2026':'')+'"');});
    if(miss.size)add('missing',[],'<'+[...miss].join('>, <')+'>');}
   if(!iss.length)return;
   iss.sort((a,b)=>RANK[CAT[a.c][1]]-RANK[CAT[b.c][1]]);
   out.push({slug,name:c.name,room:c.room,vi,t:v.t,code:v.code,sev:CAT[iss[0].c][1],iss});});}
 return out;}
window.CVAudit={run,CAT,total:()=>{const D=window.CV_DOCS;return D.order.reduce((n,s)=>n+(D.c[s].variants||[]).filter(v=>v.code).length,0);}};
})();

/* Deep check: platform parity, visible text, leaked values, playground knobs */
(function(){const A=window.CVAudit;if(!A)return;
const VIS=/^(title|description|label|placeholder|message|trigger|helper|helperText|caption|body|eyebrow|badge|text|note|subtitle|emptyMessage|emptyLabel|menuLabel|pendingLabel|rateLabel|sparkUnit|confirmLabel|cancelLabel|submitLabel|actionLabel|brand|header|footer|prefix|suffix|error|status|referenceKey|referenceSource|month|filename|children|triggerLabel|sectionLabel|detail|meta|email|value)$/;
const OBJ=/^(label|title|name|term|detail|description|content|heading|time|actor|action|badge|caption|subtitle|message|text|note)$/;const VAL=new Set(['DescriptionList','Stats','MetricBreakdown']);
const NOVIS={QRCode:/^(value)$/,Avatar:/^(name|label)$/,MediaObject:/^(avatar)$/,Draggable:/^(label)$/,DragHandle:/^(label)$/,RowMenu:/^(triggerLabel)$/,Navbar:/^(avatar)$/,Image:/^(label)$/,Video:/^(label)$/,AvatarMenu:/^(email)$/,Input:/^(value)$/,Select:/^(value)$/,Autocomplete:/^(value)$/,Listbox:/^(value)$/,Tabs:/^(value)$/,ButtonGroup:/^(value)$/,RadioGroup:/^(value)$/,Radio:/^(value)$/,Accordion:/^(value)$/,Sidebar:/^(value)$/,TabBar:/^(value)$/,Swatch:/^(value)$/,Chat:/^(value)$/,Stepper:/^(value)$/,Slider:/^(value)$/,Progress:/^(value)$/,Steps:/^(value)$/,Pagination:/^(value)$/,Checkbox:/^(value)$/,Switch:/^(value)$/,Gauge:/^(value)$/,ProgressRing:/^(value)$/,Tooltip:/^(trigger)$/};
const txt=h=>h.replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<input\b[^>]*>/g,m=>{const v=(m.match(/ value="([^"]*)"/)||[])[1]||'',ph=(m.match(/ placeholder="([^"]*)"/)||[])[1]||'';return ' '+(v||ph)+' ';}).replace(/<textarea\b([^>]*)>([^<]*)<\/textarea>/g,(m,at,body)=>' '+(body||(at.match(/ placeholder="([^"]*)"/)||[])[1]||'')+' ').replace(/<\/?(b|i|em|strong|code|mark|a|kbd|span)\b[^>]*>/g,'').replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ');
const norm=s=>String(s).replace(/\*\*|`/g,'').replace(/\s+/g,' ').trim();
const shown=(s,T)=>{s=norm(s);if(!s||s.length<2)return true;if(T.includes(s))return true;const w=s.split(' ').filter(x=>x.length>3);return w.length>2&&w.filter(x=>T.includes(x)).length/w.length>=.8;};
const ROW=n=>n.p;
function strings(n){const o=[],t=n.t,nv=NOVIS[t];if(n.p.open===false||((t==='AvatarMenu'||t==='Dropdown')&&n.p.disabled))return o;
 for(const k in n.p){const v=n.p[k];if(nv&&nv.test(k))continue;
  if(typeof v==='string'&&VIS.test(k)&&!/^(on|aria|test)/.test(k))o.push([k,v]);
  else if(Array.isArray(v)&&!/^(default\w*|value|selected\w*|options|menu|countries|pageSizes|overlays|highlightLines|values|points|candles|periods|bids|asks|share|spark|data|series|labels|axes|segments|stages|slices|steps|order|initial|defaultSelectedKeys|attachments)$/.test(k)){
   if(t==='ButtonGroup'&&n.p.stepper&&k==='items')continue;let it=v;if(t==='DataTable'&&k==='rows'&&n.p.paginated)it=v.slice(0,n.p.pageSize||10);
   if(t==='Carousel'&&k==='items'){const i=n.p.index??n.p.defaultIndex??0;it=v.slice(i,i+1);}
   it.forEach(x=>{if(typeof x==='string')o.push([k,x]);else if(Array.isArray(x))x.forEach(y=>typeof y==='string'&&o.push([k,y]));else if(x&&typeof x==='object'&&x.$!==1)for(const kk in x){if(!(OBJ.test(kk)||(kk==='value'&&VAL.has(t))))continue;if(t==='Command'&&kk==='heading'&&(n.p.query||n.p.defaultQuery))continue;if(t==='Accordion'&&kk==='content'){const ov=n.p.value??n.p.defaultValue,open=Array.isArray(ov)?ov:[ov];if(!open.includes(x.key))continue;}if(typeof x[kk]==='string')o.push([k+'.'+kk,x[kk]]);}});}}
 return o;}
const hiddenOf=tree=>{const X=window.CVX,hid=new Set();X.walk(tree,n=>{const closed=n.p.open===false||(n.t==='Collapsible'&&!n.p.open&&!n.p.defaultOpen)||(n.t==='Tooltip'&&!n.p.open)||((n.t==='Select'||n.t==='Autocomplete')&&!n.p.open);if(closed)X.walk(n,m=>{if(m!==n)hid.add(m);});if(n.t==='Tooltip'&&!n.p.open)hid.add(n);});return hid;};
A.deep=function(opts){opts=opts||{};const D=window.CV_DOCS,K=window.CVK,X=window.CVX,out=[],PF=['web','ios','android'];
 const push=(slug,vi,t,code,c,props,d,sev)=>{let r=out.find(x=>x.slug===slug&&x.vi===vi);if(!r){r={slug,name:D.c[slug].name,room:D.c[slug].room,vi,t,code,sev:'low',iss:[]};out.push(r);}r.iss.push({c,props:props||[],d:d||''});const R={high:0,medium:1,low:2};if(R[sev]<R[r.sev])r.sev=sev;};
 for(const slug of D.order){const c=D.c[slug];(c.variants||[]).forEach((v,vi)=>{if(!v.code)return;const r=X.run(v.code);if(!r.ok)return;const hid=hiddenOf(r.tree);
  const H={};PF.forEach(pf=>{H[pf]=X.html(r.tree,{pf});});
  PF.forEach(pf=>{const m=txt(H[pf]).match(/\[object Object\]|\bundefined\b|\bNaN\b|\bnull\b/);if(m)push(slug,vi,v.t,v.code,'garbage',[],pf+': "'+m[0]+'" in the preview','high');});
  const nodes=[];X.walk(r.tree,n=>{if(!hid.has(n))nodes.push(n);});
  PF.forEach(pf=>{const T=txt(H[pf]),miss=[];nodes.forEach(n=>{strings(n).forEach(([k,s])=>{if(k==='children'&&n.c.length)return;if(k==='placeholder'&&(n.p.value!=null&&n.p.value!==''||n.p.defaultValue!=null&&n.p.defaultValue!==''||(pf==='android'&&n.p.label)))return;if(!shown(s,T))miss.push('<'+n.t+'> '+k+'="'+norm(s).slice(0,48)+'"');});
    const closedN=(n.t==='Collapsible'&&!n.p.open&&!n.p.defaultOpen)||n.p.open===false;const kids=n.c.filter(x=>typeof x==='string'||typeof x==='number');if(kids.length&&!closedN&&!shown(kids.join(''),T)&&!(n.t==='Text'&&false))miss.push('<'+n.t+'> "'+norm(kids.join('')).slice(0,48)+'"');});
   if(miss.length)push(slug,vi,v.t,v.code,'text',[...new Set(miss)],pf==='web'?'':pf,pf==='web'?'high':'high');});
  X.walk(r.tree,n=>{const s=X.tag(n.t);if(!s||!K.PFR[s]||hid.has(n))return;['ios','android'].forEach(pf=>{if(!K.PFR[s][pf])return;Object.keys(n.p).filter(k=>!/^(on[A-Z]|key|ref|testID|accessibility|aria-|id$|__|steadyPress|keyboardType|autoComplete|autoCapitalize|textContentType|secureTextEntry|maxLength|responsive)/.test(k)&&n.p[k]!==false&&n.p[k]!==undefined&&n.p[k]!=='').forEach(k=>{const keep=n.p[k];delete n.p[k];const w1=X.html(r.tree,{pf:'web'}),p1=X.html(r.tree,{pf});n.p[k]=keep;const BY={'checkbox:ios':/^(small|large)$/,'radio:ios':/^(row|horizontal)$/,'tabs:ios':/^(pills)$/,'toast:android':/^(success|destructive|warning|info)$/,'select:ios':/^(dense|eyebrow|soft|plainOptions)$/,'select:android':/^(dense|eyebrow|soft|plainOptions|options)$/,'chip:android':/^(outline|selectable)$/,'input:android':/^(prefix|placeholder)$/};if(BY[s+':'+pf]&&BY[s+':'+pf].test(k))return;if(Array.isArray(keep)&&txt(w1)===txt(H.web))return;if(w1!==H.web&&p1===H[pf])push(slug,vi,v.t,v.code,'platform',['<'+n.t+'> '+k],pf+' ignores what web draws','high');});});});
 });}
 if(opts.knobs!==false)for(const slug of D.order){const c=D.c[slug],sp=K.spec(slug),ks=K.knobs(sp.k),tags=sp.jsx||[c.name.replace(/[^A-Za-z]/g,'')];
  const render=(kv,pf)=>{const pp=K.props(ks,kv),jn=(sp.tag&&pp[sp.tag])||tags[0],cp={...pp};if(sp.tag)delete cp[sp.tag];if(sp.fp&&cp[sp.fp]&&cp[sp.fp].icon){const nm=cp[sp.fp].icon;delete cp[sp.fp];const o={};o[nm]=true;Object.assign(o,cp);Object.keys(cp).forEach(k=>delete cp[k]);Object.assign(cp,o);}const code=K.code(jn,cp),r=X.run(code);return r.ok?X.html(r.tree,{pf}):'ERR';};
  const kv0=K.init(ks),base={};PF.forEach(pf=>base[pf]=render(kv0,pf));
  ks.forEach(k=>{const key=k.ty==='flags'?'@'+k.l:k.n;let alts=[];
   if(k.ty==='bool')alts=[!kv0[key]];else if(k.ty==='flags'||k.ty==='enum')alts=k.o.filter(o=>o!==kv0[key]);else if(k.ty==='num'){const mid=Math.round((k.min+k.max)/2);alts=[mid!==k.v?mid:k.max];}else if(k.ty==='text')alts=kv0[key]?[]:['Probe text'];else if(k.ty==='icon')alts=[kv0[key]==='heart'?'star':'heart'];
   const LEG={'switch:Size':'ios android','checkbox:Size':'ios','avatar:hue':'web ios android','input:clearable':'web ios android','input-otp:alphanumeric':'web ios android','action-panels:checked':'web ios android','tabs:Look':'ios','dialog:Width':'ios','alert-dialog:Width':'ios','action-sheet:cancelLabel':'android','toast:Tone':'android','chip:Emphasis':'android','chip:selectable':'android','input:prefix':'android','input:suffix':'android','input:placeholder':'android'};const lk=LEG[slug+':'+(k.ty==='flags'?k.l:k.n)]||'';
   alts.forEach(alt=>{const kv={...kv0,[key]:alt},dead=PF.filter(pf=>!lk.includes(pf)&&render(kv,pf)===base[pf]);if(dead.length)push(slug,-1-ks.indexOf(k),'Playground · '+(k.ty==='flags'?k.l:k.n)+' = '+(alt===''?'(empty)':String(alt)),'', 'knob',[],'no change on '+dead.join(', '),dead.includes('web')?'high':'medium');});});}
 return out;};
A.CAT.garbage=['Leaked value','high','A raw value (undefined, NaN, [object Object]) is printed in the preview'];
A.CAT.text=['Text not shown','high','Copy the snippet passes does not appear in the preview'];
A.CAT.platform=['Platform skin ignores it','high','The iOS or Android skin ignores a prop the web skin draws'];
A.CAT.knob=['Playground control has no effect','medium','Changing this control in the playground does not change the preview'];
})();
/* Deep check, round 3: value sensitivity, sizes/states, anatomy markers, accessibility props, overflow, unknown identifiers */
(function(){const A=window.CVAudit;if(!A)return;
A.deep2=function(){const D=window.CV_DOCS,K=window.CVK,X=window.CVX,out=[],PF=['web','ios','android'];
 const push=(slug,vi,t,c,props,d,sev)=>{let r=out.find(x=>x.slug===slug&&x.vi===vi&&x.t===t);if(!r){r={slug,name:D.c[slug].name,room:D.c[slug].room,vi,t,sev:'low',iss:[]};out.push(r);}r.iss.push({c,props:props||[],d:d||''});const R={high:0,medium:1,low:2};if(R[sev]<R[r.sev])r.sev=sev;};
 const strsIn=v=>{const o=[];const go=(x,d)=>{if(d>3||x==null)return;if(typeof x==='string')o.push(x);else if(Array.isArray(x))x.forEach(y=>go(y,d+1));else if(typeof x==='object'&&x.$!==1){const k=['value','key','id','label','title','name'].find(k=>typeof x[k]==='string');if(k)o.push(x[k]);}};go(v,0);return o;};
 for(const slug of D.order){const c=D.c[slug];(c.variants||[]).forEach((v,vi)=>{if(!v.code)return;const r=X.run(v.code);if(!r.ok)return;const h0=X.html(r.tree,{pf:'web'}),hid=new Set();X.walk(r.tree,n=>{if(n.p.open===false)X.walk(n,m=>hid.add(m));});
  X.walk(r.tree,n=>{const s=X.tag(n.t);if(!s||hid.has(n))return;if(n.t==='Pagination'&&n.p.compact&&n.p.itemCount&&0)return;
   if(n.p.accessibilityLabel&&!h0.includes(K.esc(n.p.accessibilityLabel)))push(slug,vi,v.t,'a11y',['<'+n.t+'> accessibilityLabel="'+n.p.accessibilityLabel+'"'],'not exposed as an accessible name','high');
   Object.keys(n.p).forEach(k=>{const v0=n.p[k];if(/^(on[A-Z]|key|ref|testID|accessibility|aria-|id$|__|style$|render)/.test(k))return;let alt;
    if(typeof v0==='number'&&isFinite(v0)&&!/^(width|height|span|minTileWidth|menuWidth|maxHeight|panelWidth|startWeekday|daysInMonth|interval|hue|aspectRatio|collapsedLines|maxLength|bins|max|min|step|pageSize|groups|length|rows|columns|today|startLine)$/.test(k))alt=v0===0?1:Number.isInteger(v0)?v0+1:+(v0*1.5).toFixed(2);
    else if(typeof v0==='string'&&/^(value|active|selected|current|defaultValue|defaultActive|defaultSelected|country|defaultCountry)$/.test(k)){const pool=[];for(const kk in n.p)if(kk!==k&&Array.isArray(n.p[kk]))pool.push(...strsIn(n.p[kk]));n.c.filter(X.isNode).forEach(ch=>{if(ch.p.value!=null)pool.push(ch.p.value);});alt=pool.find(x=>x!==v0&&x!=='');}
    if(alt===undefined||(n.t==='Pagination'&&k==='total'&&n.p.compact&&n.p.itemCount))return;n.p[k]=alt;const h1=X.html(r.tree,{pf:'web'});n.p[k]=v0;if(h1===h0)push(slug,vi,v.t,'value',['<'+n.t+'> '+k+'='+JSON.stringify(v0)+' → '+JSON.stringify(alt)],'a different value draws the same preview','high');});});
  });}
 for(const slug of D.order){const sp=K.spec(slug),ks=K.knobs(sp.k),pp=K.props(ks,K.init(ks));
  if(sp.sz){const m=sp.sz.match(/^(\w+):(.+)$/);const vars=m?m[2].split('|').map(x=>({l:m[1]+' '+x,p:{...pp,[m[1]]:+x}})):sp.sz.split('|').map(fn=>{const q={...pp};sp.sz.split('|').forEach(x=>{if(x!=='-')delete q[x];});if(fn!=='-')q[fn]=true;return {l:fn==='-'?'default':fn,p:q};});
   const NATIVE={'switch:ios':1,'switch:android':1,'checkbox:ios':1};PF.forEach(pf=>{if(NATIVE[slug+':'+pf])return;const hs=vars.map(x=>K.render(slug,x.p,{pf}));for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++)if(hs[i]===hs[j])push(slug,-1,'Sizes','size',[vars[i].l+' = '+vars[j].l],pf,pf==='web'?'high':'medium');});}
  if(sp.st){const VIS=['hover','focus','pressed'],sts=sp.st.split('|').filter(Boolean);PF.forEach(pf=>{const hs=sts.map(st=>{const q={...pp};if(st!=='-'&&!VIS.includes(st))q[st]=true;return K.render(slug,q,{pf,st:VIS.includes(st)?st:null});});for(let i=0;i<hs.length;i++)for(let j=i+1;j<hs.length;j++)if(hs[i]===hs[j]&&!(({'switch:ios':1,'checkbox:ios':1,'slider:android':1})[slug+':'+pf]&&(sts[i]==='hover'||sts[j]==='hover')))push(slug,-2,'States','state',[(sts[i]==='-'?'default':sts[i])+' = '+(sts[j]==='-'?'default':sts[j])],pf,pf==='web'?'high':'medium');});}
  if((sp.an||[]).length){const h=K.render(slug,{...pp,...(sp.ap||{})},{pf:'web'}),miss=sp.an.map((t,i)=>i+1).filter(n=>!h.includes('data-a="'+n+'"'));if(miss.length)push(slug,-3,'Anatomy','anatomy',miss.map(n=>n+' '+sp.an[n-1]),'part has no marker in the anatomy preview','medium');}
  const hw=K.render(slug,pp,{pf:'web'}),m=hw.match(/^<\w+[^>]*?style="([^"]*)"/);if(m&&/(^|;)\s*width:\s*(\d{3,})px/.test(m[1])&&!/max-width/.test(m[1]))push(slug,-4,'Playground','overflow',[(m[1].match(/width:\s*\d+px/)||[''])[0]],'fixed width with no max-width overflows a narrow preview','medium');}
 return out;};
A.CAT.a11y=['Accessible name missing','high','The accessibilityLabel in the code is not exposed on the preview'];
A.CAT.value=['Value not applied','high','Changing the value in the code does not change the preview'];
A.CAT.size=['Sizes look identical','high','Two sizes render the same'];
A.CAT.state=['States look identical','high','Two states render the same'];
A.CAT.anatomy=['Anatomy marker missing','medium','A numbered anatomy part has no marker in the preview'];
A.CAT.overflow=['Overflows narrow panes','medium','A fixed width without max-width overflows a narrow preview'];
})();
