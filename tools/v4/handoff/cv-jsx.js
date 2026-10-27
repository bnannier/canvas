/* Canvas v4.0.0 · JSX runtime for the docs snippets. The code a page displays is the code it renders:
   CVX.run(code) compiles a snippet (JSX + plain JS) into a tree of {$,t,p,c} nodes, CVX.html(tree,ctx)
   renders that tree with the kit's renderers (K.R, by tag) and draws the React Native primitives itself. */
(function(){
const X=window.CVX=window.CVX||{};
/* ---------- compiler: JSX → h() calls ---------- */
function compile(src){src=src.replace(/\s+as\s+\{[^{}]*\}(?:\[\])?(?=\s*[),\]};\n])/g,'').replace(/\s+as\s+(?:const|[A-Z][\w.]*(?:<[^<>]*>)?(?:\[\])?)(?=\s*[),\]};\n])/g,'');let i=0;const n=src.length;
 const ws=()=>{for(;;){while(i<n&&/\s/.test(src[i]))i++;if(src[i]==='/'&&src[i+1]==='/'){while(i<n&&src[i]!=='\n')i++;continue;}if(src[i]==='/'&&src[i+1]==='*'){const e=src.indexOf('*/',i+2);i=e<0?n:e+2;continue;}break;}};
 const str=q=>{let o=src[i++];while(i<n){const c=src[i++];o+=c;if(c==='\\'){o+=src[i++]||'';continue;}if(c===q)break;}return o;};
 const tpl=()=>{let o='`';i++;while(i<n){const c=src[i];if(c==='\\'){o+=c+(src[i+1]||'');i+=2;continue;}if(c==='`'){i++;return o+'`';}if(c==='$'&&src[i+1]==='{'){i+=2;o+='${'+js('}')+'}';i++;continue;}o+=c;i++;}return o+'`';};
 const jsxAt=out=>{if(!/[A-Za-z>]/.test(src[i+1]||''))return false;const t=out.replace(/\s+$/,'');if(!t)return true;if(/(^|[^\w$])return$/.test(t))return true;return /[(,=[{?:&|!;>]$/.test(t);};
 function js(end){let o='',d=0;while(i<n){const c=src[i];
   if(c===end&&d===0)return o;
   if(c==='"'||c==="'"){o+=str(c);continue;}
   if(c==='`'){o+=tpl();continue;}
   if(c==='/'&&src[i+1]==='/'){while(i<n&&src[i]!=='\n')i++;continue;}
   if(c==='/'&&src[i+1]==='*'){const e=src.indexOf('*/',i+2);i=e<0?n:e+2;continue;}
   if(c==='<'&&jsxAt(o)){o+=el();continue;}
   if('([{'.includes(c))d++;else if(')]}'.includes(c))d--;
   o+=c;i++;}
  return o;}
 const ENT={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0',mdash:'\u2014',ndash:'\u2013',hellip:'\u2026',middot:'\u00b7',rarr:'\u2192',larr:'\u2190',times:'\u00d7',copy:'\u00a9',bull:'\u2022'};
 const dec=s=>s.replace(/&(#x?[0-9a-f]+|\w+);/gi,(m,k)=>k[0]==='#'?String.fromCodePoint(k[1]==='x'||k[1]==='X'?parseInt(k.slice(2),16):+k.slice(1)):ENT[k]!=null?ENT[k]:m);
 const text=s=>{const L=s.split(/\r\n|\n|\r/);let o='';L.forEach((l,k)=>{let t=l.replace(/\t/g,' ');if(k)t=t.replace(/^ +/,'');if(k<L.length-1)t=t.replace(/ +$/,'');if(t){if(o&&k)o+=' ';o+=t;}});return dec(o);};
 function kids(){const parts=[];let t='';const flush=()=>{const x=text(t);if(x)parts.push(JSON.stringify(x));t='';};
  while(i<n){const c=src[i];
   if(c==='<'&&src[i+1]==='/'){flush();const e=src.indexOf('>',i);i=e<0?n:e+1;break;}
   if(c==='<'){flush();parts.push(el());continue;}
   if(c==='{'){flush();i++;const e=js('}').trim();i++;if(e)parts.push('('+e+')');continue;}
   t+=c;i++;}
  return parts.length?','+parts.join(','):'';}
 function el(){i++;if(src[i]==='>'){i++;return 'h("",null'+kids()+')';}
  let tag='';while(i<n&&/[\w$.:-]/.test(src[i]))tag+=src[i++];
  const props=[];
  while(i<n){ws();
   if(src[i]==='/'&&src[i+1]==='>'){i+=2;return 'h('+JSON.stringify(tag)+',{'+props.join(',')+'})';}
   if(src[i]==='>'){i++;return 'h('+JSON.stringify(tag)+',{'+props.join(',')+'}'+kids()+')';}
   if(src[i]==='{'){i++;const e=js('}').trim();i++;if(e)props.push(e.startsWith('...')?e:'...('+e+')');continue;}
   let k='';while(i<n&&/[\w$:-]/.test(src[i]))k+=src[i++];
   if(!k){i++;continue;}
   ws();
   if(src[i]==='='){i++;ws();
    if(src[i]==='"'||src[i]==="'"){const q=src[i],e=src.indexOf(q,i+1);props.push(JSON.stringify(k)+':'+JSON.stringify(dec(src.slice(i+1,e<0?n:e))));i=e<0?n:e+1;}
    else if(src[i]==='{'){i++;const e=js('}').trim();i++;props.push(JSON.stringify(k)+':('+(e||'undefined')+')');}
    else if(src[i]==='<')props.push(JSON.stringify(k)+':'+el());
   }else props.push(JSON.stringify(k)+':true');}
  return 'h('+JSON.stringify(tag)+',{'+props.join(',')+'})';}
 ws();
 if(src[i]!=='<')return '('+js('\u0000')+')';
 const roots=[];
 while(i<n){ws();if(i>=n)break;
  if(src[i]==='<'){roots.push(el());continue;}
  if(src[i]==='{'){i++;const e=js('}').trim();i++;if(e)roots.push('('+e+')');continue;}
  i++;}
 return roots.length===1?roots[0]:'['+roots.join(',')+']';}
X.compile=compile;
/* ---------- evaluation ---------- */
const TK={primary:'var(--ion)','primary-foreground':'var(--ion-fg)',foreground:'var(--tx)',background:'var(--bg)',card:'var(--sf)','card-foreground':'var(--tx)',popover:'var(--sf2)','popover-foreground':'var(--tx)',muted:'var(--sf3)','muted-foreground':'var(--tx2)',secondary:'var(--sf3)','secondary-foreground':'var(--tx)',accent:'var(--sf3)','accent-foreground':'var(--tx)',border:'var(--ln2)',input:'var(--ln2)',ring:'var(--ion-ring)',destructive:'var(--bad)','destructive-foreground':'var(--bad-fg)',success:'var(--ok)',warning:'var(--warn)',info:'var(--ion-tx)',action:'var(--ion)','field-border':'var(--ln2)'};
const tokens=new Proxy(TK,{get:(t,k)=>typeof k==='string'?(t[k]||'var(--tx2)'):undefined});
const alpha=(c,a)=>'color-mix(in oklch,'+c+' '+Math.round((+a||0)*100)+'%,transparent)';
const STUB=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='length'?0:STUB,apply:()=>undefined});
const SCOPE={tokens,alpha,theme:{tokens,scheme:'dark'},useTheme:()=>({tokens,scheme:'dark'}),useState:v=>[typeof v==='function'?v():v,()=>{}],useRef:v=>({current:v}),useMemo:f=>f(),useCallback:f=>f,useEffect:()=>{},Platform:{OS:'web',select:o=>o.web??o.default},StyleSheet:{create:o=>o,hairlineWidth:1}};
const SP=new Proxy(SCOPE,{has:(t,k)=>typeof k==='string'&&k!=='h'&&(k in t||!(k in window)),get:(t,k)=>k===Symbol.unscopables?undefined:k in t?t[k]:STUB});
function h(t,p,...c){p=p||{};const k=c.flat(Infinity);
 if(t==='Stateful'){const f=k.find(x=>typeof x==='function');if(f){const v=p.initial;return f(typeof v==='function'?v():v,()=>{});}return k;}
 return {$:1,t,p,c:k};}
const cache=new Map();
X.run=function(src){if(cache.has(src))return cache.get(src);let r;
 try{const code=compile(src);const fn=new Function('h','__s','with(__s){return ('+code+');}');r={ok:true,tree:fn(h,SP)};}catch(e){r={ok:false,err:e.message};}
 cache.set(src,r);return r;};
/* ---------- rendering ---------- */
X.isNode=v=>!!(v&&v.$===1);
X.text=function tx(v){if(v==null||v===false||v===true)return '';if(Array.isArray(v))return v.map(tx).filter(Boolean).join(' ');if(typeof v==='string'||typeof v==='number')return String(v);if(v.$===1)return tx(v.c);return '';};
const iconName=p=>p.name||Object.keys(p).find(k=>p[k]===true&&!/^(decorative|filled|heavyStroke|disclosure|expanded|accessible)$/.test(k))||'circle';
const UNIT=/^(flex|flexGrow|flexShrink|opacity|zIndex|fontWeight|aspectRatio|order|scale)$/;
const SKIP=/^(borderCurve|elevation|shadow\w*|resizeMode|tintColor|includeFontPadding|textAlignVertical|overlayColor|userSelect)$/;
const px=v=>typeof v==='number'?v+'px':v;
X.css=function css(s){if(!s)return '';if(Array.isArray(s))return s.map(css).join('');if(typeof s==='function'){try{return css(s({pressed:false,hovered:false,focused:false}));}catch(e){return '';}}if(typeof s!=='object')return '';let o='';
 for(const k in s){const v=s[k];if(v==null||typeof v==='object'||typeof v==='function'||SKIP.test(k))continue;
  if(k==='paddingHorizontal'||k==='marginHorizontal'){const b=k.slice(0,-10);o+=b+'-left:'+px(v)+';'+b+'-right:'+px(v)+';';continue;}
  if(k==='paddingVertical'||k==='marginVertical'){const b=k.slice(0,-8);o+=b+'-top:'+px(v)+';'+b+'-bottom:'+px(v)+';';continue;}
  if(k==='flex'&&typeof v==='number'){o+='flex:'+v+' 1 0%;';continue;}
  const m=k.match(/^(padding|margin|border)(Start|End)(Width|Color)?$/);if(m){o+=m[1]+'-inline-'+m[2].toLowerCase()+(m[3]?'-'+m[3].toLowerCase():'')+':'+px(v)+';';continue;}
  o+=k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())+':'+(typeof v==='number'&&!UNIT.test(k)?v+'px':v)+';';}
 return o;};
const box=(dir,p,kids,tag)=>'<'+(tag||'div')+' style="display:flex;flex-direction:'+dir+';min-width:0;'+(p.flex!=null?'flex:'+p.flex+' 1 0%;':'')+(p.disabled?'opacity:.45;':'')+X.css(p.style)+'">'+kids+'</'+(tag||'div')+'>';
const demo=(slug,n,c)=>!n.c.length&&!(c.depth>0)?window.CVK.render(slug,X.props(n,c,slug),c):null;
const PRIM={
 View:(n,c)=>demo('view',n,c)||box('column',n.p,X.html(n.c,X.deeper(c))),
 Pressable:(n,c)=>demo('pressable',n,c)||box('column',n.p,X.html(n.c,X.deeper(c))),
 TouchableOpacity:(n,c)=>box('column',n.p,X.html(n.c,X.deeper(c))),
 SafeAreaView:(n,c)=>box('column',n.p,X.html(n.c,X.deeper(c))),
 Text:(n,c)=>{const p=n.p,cl=p.numberOfLines?(p.numberOfLines===1?'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;':'display:-webkit-box;-webkit-line-clamp:'+p.numberOfLines+';-webkit-box-orient:vertical;overflow:hidden;'):'';const k=X.html(n.c,{...X.deeper(c),inText:1});return c.inText?'<span style="'+X.css(p.style)+'">'+k+'</span>':'<div style="font:400 15px/1.5 var(--f-ui,var(--ft));color:var(--tx);min-width:0;'+cl+X.css(p.style)+'">'+k+'</div>';},
 ScrollView:(n,c)=>{const d=demo('scroll-view',n,c);if(d)return d;const hz=!!n.p.horizontal;return '<div style="display:flex;flex-direction:'+(hz?'row':'column')+';overflow:auto;min-width:0;max-width:100%;'+X.css(n.p.style)+'"><div style="display:flex;flex-direction:'+(hz?'row':'column')+';flex:none;'+X.css(n.p.contentContainerStyle)+'">'+X.html(n.c,X.deeper(c))+'</div></div>';},
 Icon:n=>{const p=n.p,s=typeof p.size==='number'?p.size:p.small?14:p.large?24:18,w=p.heavyStroke?2.5:p.boldStroke?2.2:p.mediumStroke?2:p.regularStroke?1.75:null;
  const col=p.color||(p.primary?'var(--ion-tx)':p.primaryForeground?'var(--ion-fg)':p.destructive?'var(--bad)':p.success?'var(--ok)':p.warning?'var(--warn)':p.muted?'var(--tx3)':'');
  const nm=p.disclosure&&!p.name&&iconName(p)==='circle'?'chevronDown':iconName(p),rot=p.disclosure?(p.expanded?'':'transform:rotate(-90deg);'):'';
  return '<cv-icon n="'+nm+'"'+(w?' w="'+w+'"':'')+(p.decorative?' aria-hidden="true"':'')+' style="font-size:'+s+'px;'+(col?'color:'+col+';':'')+rot+'transition:transform .2s"></cv-icon>';},
 Ticker:(n,c)=>{const f=n.c.find(x=>typeof x==='function'),v=Array.isArray(n.p.values)?n.p.values[0]:0,cc={...c,tick:n.p.interval||2400};return f?X.html(f(v),cc):X.html(n.c,cc);},
 Page:(n,c)=>{const p=n.p,w=X.step(p);return '<div data-overlay-host="'+(p.inheritOverlays?'inherit':'own')+'" style="display:flex;flex-direction:column;gap:16px;width:100%;min-width:0;'+(w?'max-width:'+w+'px;':'')+(p.start?'margin-right:auto;':'margin:0 auto;')+X.css(p.style)+'">'+X.html(n.c,X.deeper(c))+'</div>';},
 GridItem:(n,c)=>{const p=n.p,sp=p.full?'1 / -1':'span '+(p.span||(p.wide?2:p.tall?1:1));return '<div style="grid-column:'+sp+';'+(p.tall?'grid-row:span 2;':'')+'display:flex;flex-direction:column;min-width:0">'+X.html(n.c,X.deeper(c))+'</div>';}};
X.PRIM=PRIM;
X.PASS=X.PASS||new Set(['RevealGroup','OverlayProvider','ViewportOverlay','Fragment','React.Fragment','SafeAreaProvider','ThemeProvider','CanvasProvider','Portal']);
X.STEP={xxxs:192,xxs:256,xs:320,sm:384,md:448,lg:512,xl:576,xxl:672,xxxl:768,wide:896,wider:1024,widest:1152,page:1280};
X.step=p=>{for(const k in X.STEP)if(p[k]===true)return X.STEP[k];return null;};
X.deeper=c=>({...c,depth:(c.depth||0)+1});
X.mw=function(html,w,start){const m=html.match(/^<(\w+)([^>]*?)style="([^"]*)"/);if(!m)return html;const fixed=html.replace(m[0],'<'+m[1]+m[2]+'style="'+m[3]+';width:100%;max-width:100%;justify-content:center"');return '<div style="width:min(100%,'+w+'px);'+(start?'margin-right:auto;':'margin-left:auto;margin-right:auto;')+'display:flex;flex-direction:column;min-width:0">'+fixed+'</div>';};
let MEAS=null;const measured=s=>{if(!MEAS){MEAS=new Set();const D=window.CV_DOCS;D.order.forEach(k=>{const m=D.c[k].main;if(m&&(m.ext||[]).includes('MeasureProps'))MEAS.add(k);});['container','app-frame','row-column','grid','page'].forEach(k=>MEAS.delete(k));}return MEAS.has(s);};
let TAGS=null;
X.tag=function(t){if(!TAGS){TAGS={};const D=window.CV_DOCS,K=window.CVK;D.order.forEach(s=>{const c=D.c[s],sp=K.spec(s);TAGS[c.name.replace(/[^A-Za-z]/g,'')]=s;(sp.jsx||[]).forEach(j=>{TAGS[j]=TAGS[j]||s;});});}const K=window.CVK;return (K&&K.TAG&&K.TAG[t])||X.ALIAS[t]||TAGS[t];};
X.ALIAS=Object.assign(X.ALIAS||{},{Row:'row-column',Column:'row-column',Typography:'typography',Navbar:'navbars',StackedList:'stacked-lists',GridList:'grid-lists',MediaObject:'media-objects',Feed:'feeds',DescriptionList:'description-lists',ActionPanel:'action-panels',RadioGroup:'radio',DragDropProvider:'drag-drop',Draggable:'drag-drop',Droppable:'drag-drop'});
X.norm=function nm(v,c,d){d=d||0;if(d>6||v==null||typeof v!=='object')return v;
 if(v.$===1)return v.t==='Icon'?{...v.p,icon:iconName(v.p),el:'Icon',node:v,html:PRIM.Icon(v)}:{el:v.t,node:v,html:X.html(v,X.deeper(c)),text:X.text(v)};
 if(Array.isArray(v))return v.map(x=>nm(x,c,d+1));
 if(Object.getPrototypeOf(v)!==Object.prototype)return v;
 const o={};for(const k in v)o[k]=nm(v[k],c,d+1);return o;};
X.props=function(n,c,slug){const K=window.CVK,sp=K.spec(slug),p={},c0=c;c=X.deeper(c);
 for(const k in n.p)p[k]=X.norm(n.p[k],c);
 const kids=n.c.filter(x=>x!=null&&x!==false&&x!==true&&x!=='');
 if(kids.length){if(kids.every(x=>typeof x==='string'||typeof x==='number')){if(p.children==null)p.children=kids.join('');}
  else{p.__kids=X.html(kids,c);p.__nodes=kids;const t=X.text(kids);if(t)p.__text=t;
   const it=kids.filter(X.isNode).map(x=>x.p.label||x.p.title||x.p.name||X.text(x.c)).filter(x=>typeof x==='string'&&x);if(it.length&&!p.__items)p.__items=it;}}
 p.__tag=n.t;p.__deep=(c0.depth||0)>0;if(sp.tag&&p[sp.tag]==null)p[sp.tag]=n.t;
 for(const k in n.p){const m=k.match(/^default([A-Z]\w*)$/);if(m){const b=m[1][0].toLowerCase()+m[1].slice(1);if(p[b]==null)p[b]=p[k];}}
 return p;};
X.html=function html(v,c){c=c||{};
 if(v==null||v===false||v===true)return '';
 if(Array.isArray(v))return v.map(x=>html(x,c)).join('');
 if(typeof v==='string'||typeof v==='number')return window.CVK.esc(v);
 if(typeof v==='function'){try{return html(v({}),c);}catch(e){return '';}}
 if(v.$!==1)return v.html||'';
 if(v.t===''||X.PASS.has(v.t))return html(v.c,c);
 if(PRIM[v.t])return X.a11y(PRIM[v.t](v,c),v.p);
 const s=X.tag(v.t);if(!s)return html(v.c,c);
 const p=X.props(v,c,s);let o=window.CVK.render(s,p,c);const w=X.step(v.p);if(w&&measured(s))o=X.mw(o,w,!!v.p.start);return X.a11y(o,v.p);};
X.a11y=function(o,p){const K=window.CVK,add=[];if(p.accessibilityLabel&&!/^<\w+[^>]*\saria-label=/.test(o))add.push('aria-label="'+K.esc(p.accessibilityLabel)+'"');if(p.accessibilityHint)add.push('aria-description="'+K.esc(p.accessibilityHint)+'"');if(p.accessibilityRole&&!/^<\w+[^>]*\srole=/.test(o))add.push('role="'+K.esc(p.accessibilityRole)+'"');if(p.testID)add.push('data-testid="'+K.esc(p.testID)+'"');return add.length?o.replace(/^<(\w+)/,'<$1 '+add.join(' ')):o;};
X.roots=t=>(Array.isArray(t)?t:[t]).filter(x=>x!=null&&x!==false&&x!=='');
X.walk=function(t,f){const go=v=>{if(Array.isArray(v))v.forEach(go);else if(X.isNode(v)){f(v);for(const k in v.p){const x=v.p[k];if(X.isNode(x)||Array.isArray(x))go(x);}go(v.c);}};go(t);};
})();
