/* Canvas v4.0.0 kit · code-driven rendering, part 7: behaviour props. Fields become real <input>/<textarea>
   elements carrying React Native Web's mapping of keyboardType, autoComplete, autoCapitalize, textContentType,
   secureTextEntry, maxLength and name; presses give feedback unless steadyPress; responsive components collapse
   at narrow widths; a Ticker replays its child; names become accessible labels. */
(function run(){const K=window.CVK;if(!K||!K.OV||!K.reg||!K.codev6||!window.CVX){setTimeout(run,20);return;}
const X=window.CVX,e=K.esc,a=K.a,f=K.f,ic=K.ic,T_=K.T_;
const RANK=7,SEEN={};const O=(s,fn)=>{const i=SEEN[s]=(SEEN[s]||0)+1;K.reg(K.OV[s]=K.OV[s]||[],RANK,i,fn);};
K.PW=K.PW||{};const WS={};const W=(s,pf,fn)=>{const m=K.PW[s]=K.PW[s]||{},key=s+':'+pf,i=WS[key]=(WS[key]||0)+1;K.reg(m[pf]=m[pf]||[],RANK,i,fn);};
const both=(s,fn)=>{W(s,'ios',fn);W(s,'android',fn);};
const lbl=x=>typeof x==='string'||typeof x==='number'?String(x):x&&(x.label||x.title||x.name)||'';
/* press feedback (Pressable's opacity/scale), withheld by steadyPress */
K.press=p=>p.steadyPress||p.disabled?'':` onpointerdown="this.style.transform='scale(.97)'" onpointerup="this.style.transform=''" onpointerleave="this.style.transform=''"`;
const pressRoot=(h,p)=>{if(/^<\w+[^>]*onpointerdown=/.test(h))return h;const add=K.press(p);return add?h.replace(/^<(\w+)/,'<$1'+add):h;};
const unpress=h=>h.replace(/ onpointerdown="[^"]*" onpointerup="[^"]*" onpointerleave="[^"]*"/,'');
/* React Native Web's TextInput attribute mapping */
const KB={'email-address':['email','email'],'number-pad':['numeric','text'],'numeric':['numeric','text'],'decimal-pad':['decimal','text'],'phone-pad':['tel','tel'],'url':['url','url'],'numbers-and-punctuation':['text','text'],'web-search':['search','search'],'default':['text','text']};
const AC={'birthdate-full':'bday','password':'current-password','new-password':'new-password','username':'username','email':'email','cc-number':'cc-number','cc-exp':'cc-exp','cc-csc':'cc-csc','cc-name':'cc-name','street-address':'street-address','postal-code':'postal-code','tel':'tel','name':'name','off':'off'};
const TCT={emailAddress:'email',password:'current-password',newPassword:'new-password',username:'username',creditCardNumber:'cc-number',creditCardExpiration:'cc-exp',creditCardSecurityCode:'cc-csc',creditCardName:'cc-name',streetAddressLine1:'address-line1',streetAddressLine2:'address-line2',addressCity:'address-level2',postalCode:'postal-code',telephoneNumber:'tel',name:'name',birthdate:'bday'};
const attrs=p=>{const kb=KB[p.keyboardType]||KB.default,sec=p.secureTextEntry||(p.passwordToggle&&!p.showPassword);let o=` type="${sec?'password':kb[1]}" inputmode="${kb[0]}"`;
 const ac=p.autoComplete?(AC[p.autoComplete]||p.autoComplete):p.textContentType?TCT[p.textContentType]||'':'';if(ac)o+=` autocomplete="${e(ac)}"`;
 if(p.autoCapitalize)o+=` autocapitalize="${e(p.autoCapitalize==='none'?'off':p.autoCapitalize)}"`;if(p.textContentType)o+=` data-text-content-type="${e(p.textContentType)}"`;if(p.keyboardType)o+=` data-keyboard-type="${e(p.keyboardType)}"`;if(p.secureTextEntry)o+=' data-secure-text-entry';
 if(p.maxLength)o+=` maxlength="${+p.maxLength}"`;if(p.name&&typeof p.name==='string')o+=` name="${e(p.name)}"`;if(p.readOnly)o+=' readonly';if(p.disabled)o+=' disabled';
 o+=p.systemFocus?` onfocus="this.style.outline='auto'" onblur="this.style.outline=''"`:` onfocus="var f=this.closest('[data-a=&quot;2&quot;]');if(f){f.dataset.ring=f.style.boxShadow;f.style.boxShadow='0 0 0 4px var(--ion-ring)'}" onblur="var f=this.closest('[data-a=&quot;2&quot;]');if(f)f.style.boxShadow=f.dataset.ring||''"`;return o;};
const FIELD='background:none;border:0;outline:0;font:inherit;letter-spacing:inherit;padding:0;margin:0;color:var(--tx);width:100%;min-width:0';
const toInput=(h,n,p)=>{const re=new RegExp('<span data-a="'+n+'" style="([^"]*)">([^<]*)</span>');const m=h.match(re);if(!m)return h;const v=p.value!=null&&p.value!==''?String(p.value):'';
 return h.replace(m[0],`<input data-a="${n}"${attrs(p)} value="${e(v)}" placeholder="${e(p.placeholder||'')}" aria-label="${e(T_(p.label)||p.placeholder||'')}" style="${m[1].replace(/color:[^;]+;?/,'')};${FIELD}">`);};
const toArea=(h,n,p)=>{const re=new RegExp('<span data-a="'+n+'" style="([^"]*)">([^<]*)</span>');const m=h.match(re);if(!m)return h;
 return h.replace(m[0],`<textarea data-a="${n}"${attrs(p).replace(/ type="[^"]*" inputmode="[^"]*"/,'')} rows="${p.rows||4}" placeholder="${e(p.placeholder||'')}" aria-label="${e(T_(p.label)||p.placeholder||'')}" style="${FIELD};display:block;resize:none;height:100%;min-height:${(p.rows||4)*20}px;line-height:inherit">${e(p.value||'')}</textarea>`);};
O('input',(p,c,b)=>toInput(b(p,c),4,p));both('input',(p,c,b,o)=>toInput(o(p,c,b),4,p));
const cnt=(h,p)=>p.maxLength?h.replace(/(\d+) \/ 280</,'$1 / '+(+p.maxLength)+'<').replace(/(\d+)\/280</,'$1/'+(+p.maxLength)+'<'):h;
O('textarea',(p,c,b)=>toArea(cnt(b(p,c),p),3,p));both('textarea',(p,c,b,o)=>toArea(cnt(o(p,c,b),p),3,p));
/* Button, Select and Dropdown: press feedback unless steadyPress */
O('button',(p,c,b)=>pressRoot(b(p,c),p));
O('select',(p,c,b)=>{const h=b(p,c),add=K.press(p);return add?h.replace(/(<div data-a="2")/,'$1'+add):h;});
both('select',(p,c,b,o)=>{const h=o(p,c,b),add=K.press(p);return add?h.replace(/(<div data-a="2")/,'$1'+add):h;});
O('dropdown',(p,c,b)=>{const h=b(p,c),add=K.press(p);return add?h.replace(/(<span data-a="1">)<(\w+)/,'$1<$2'+add):unpress(h);});
/* Tabs and FilterPanel: the responsive collapse at narrow widths */
const tabsNarrow=(p,c)=>{const T=Array.isArray(p.tabs)?p.tabs:Array.isArray(p.items)?p.items:null,L=p.__items||(T?T.map(lbl):['Overview','Components','Tokens','Changelog']),act=p.active??0;
 return `<div${a(1)} style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;max-width:320px;height:40px;padding:0 12px;border-radius:var(--r-f,10px);background:var(--bg2);border:1px solid var(--ln2);box-sizing:border-box;font:500 14px ${f}"><span${a(3)}>${e(L[act]||L[0]||'')}</span>${ic('chevronsUpDown',15,'color:var(--tx3)')}</div>`;};
O('tabs',(p,c,b)=>p.responsive&&c.narrow?tabsNarrow(p,c):b(p,c));both('tabs',(p,c,b,o)=>p.responsive&&c.narrow?tabsNarrow(p,c):o(p,c,b));
O('filter-panel',(p,c,b)=>{if(!(p.responsive&&c.narrow))return b(p,c);const n=Array.isArray(p.groups)?p.groups.reduce((s,g)=>s+(g.options||[]).filter(o=>o.checked).length,0):p.activeCount||0;
 return `<span${a(1)}>${K.btn({secondary:1,small:1,children:'Filters',iconLeft:{icon:'filter'},count:n||null},c)}</span>`;});
/* Reveal under a Ticker replays every interval */
O('reveal',(p,c,b)=>{const h=b(p,c);return c.tick?h.replace(/animation:cvRev ([.\d]+s) cubic-bezier\(([^)]*)\) ([.\d]+s) both/,`animation:cvRevLoop ${c.tick}ms cubic-bezier($2) $3 infinite`):h;});
/* Avatar: the name is its accessible label */
O('avatar',(p,c,b)=>{const h=b(p,c),n=T_(p.name)||p.accessibilityLabel;return n?h.replace(/^<(\w+)/,`<$1 role="img" aria-label="${e(n)}" title="${e(n)}"`):h;});
K.codev7=1;
})();
