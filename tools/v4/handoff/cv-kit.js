/* Canvas v4.0.0 kit: renders any of the 107 components as v4.0.0-styled HTML for the detail pages.
   CVK.def(slug,{k,sz,st,an,kb,jsx,w,r}) registers a renderer; r(props,ctx) returns HTML. */
(function(){
var K=window.CVK=window.CVK||{};
K.R=K.R||{};
K.def=function(s,o){K.R[s]=o;};
var esc=K.esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
K.ic=function(n,s,st){return '<cv-icon n="'+n+'" style="font-size:'+(s||16)+'px;'+(st||'')+'"></cv-icon>';};
K.a=function(n){return n?' data-a="'+n+'"':'';};
K.PH=['ada-lovelace','grace-hopper','kira-tanaka','noor-park','marcus-allen','liang-bao'];
K.ph=function(i){return 'docs/public/'+K.PH[(i||0)%6]+'.jpg';};
K.PPL=['Ada Lovelace','Grace Hopper','Kira Tanaka','Noor Park','Marcus Allen','Liang Bao'];
K.PF={
 web:'--r-c:10px;--h-c:40px;--r-f:10px;--h-f:40px;--r-cd:16px;--f-ui:var(--ft);--f-dp:var(--fd);--tw:600;--fs:14px;--bw:500;--bls:0px',
 ios:'--r-c:999px;--h-c:50px;--r-f:8px;--h-f:44px;--r-cd:12px;--f-ui:-apple-system,\'SF Pro Text\',system-ui,sans-serif;--f-dp:-apple-system,\'SF Pro Display\',system-ui,sans-serif;--tw:700;--fs:17px;--bw:600;--bls:-.2px',
 android:'--r-c:999px;--h-c:40px;--r-f:4px;--h-f:56px;--r-cd:12px;--f-ui:Roboto,system-ui,sans-serif;--f-dp:Roboto,system-ui,sans-serif;--tw:500;--fs:14px;--bw:500;--bls:.1px'};
K.T={ok:['var(--ok-soft)','var(--ok)'],warn:['var(--warn-soft)','var(--warn)'],bad:['var(--bad-soft)','var(--bad)'],info:['var(--ion-soft)','var(--ion-tx)'],mute:['var(--sf3)','var(--tx2)']};
K.tone=function(p){return p.success?'ok':p.warning||p.rateWarning?'warn':p.destructive||p.error||p.danger||p.rateDestructive?'bad':p.info?'info':p.neutral||p.muted?'mute':null;};
K.f='var(--f-ui,var(--ft))';
K.lab=function(t,a){return t?'<div'+K.a(a)+' style="font:500 13px/1.3 '+K.f+';color:var(--tx2)">'+esc(t)+'</div>':'';};
K.sub=function(t,a){return t?'<div'+K.a(a)+' style="font:400 12px/1.45 '+K.f+';color:var(--tx3)">'+esc(t)+'</div>':'';};
K.panel=function(inner,o,a){return '<div'+K.a(a)+' style="background:var(--sf);border:1px solid var(--ln);border-radius:var(--r-cd,16px);box-shadow:var(--sh-md);'+(o||'')+'">'+inner+'</div>';};
K.av=function(i,sz,ring){sz=sz||32;return '<img src="'+K.ph(i)+'" alt="" style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;object-fit:cover;flex:none;'+(ring?'box-shadow:0 0 0 2px var(--sf)':'')+'">';};
K.init_=function(n,sz,h){sz=sz||32;return '<span style="width:'+sz+'px;height:'+sz+'px;border-radius:50%;flex:none;display:grid;place-items:center;background:oklch(.72 .14 '+(h==null?285:h)+' / .22);color:oklch(.82 .12 '+(h==null?285:h)+');font:600 '+Math.round(sz*.38)+'px/1 var(--f-ui,var(--ft))">'+esc(n)+'</span>';};
K.dot=function(c,s){return '<span style="width:'+(s||8)+'px;height:'+(s||8)+'px;border-radius:50%;background:'+c+';flex:none"></span>';};
K.btn=function(p,c,a){c=c||{};var t=p.primary&&!(p.link||p.inlineLink)?'p':p.destructive?'d':p.secondary?'s':p.outline?'o':p.ghost?'g':(p.link||p.inlineLink)?'l':p.inverse?'i':p.quiet?'q':'p';
 var sm=p.small,lg=p.large,ico=p.icon||p.compactIcon||p.mediumIcon||p.largeIcon;
 var h=p.compactIcon?'28px':p.mediumIcon?'32px':p.largeIcon?'34px':sm?'32px':lg?'48px':'var(--h-c,40px)';
 var fs=sm?'13px':lg?'16px':'var(--fs,14px)';
 var bg={p:'var(--ion)',s:'var(--sf3)',o:'transparent',g:p.inset?'var(--sf3)':'transparent',l:'transparent',d:'var(--bad)',i:'transparent',q:'transparent'}[t];
 var fg={p:'var(--ion-fg)',s:'var(--tx)',o:'var(--tx)',g:'var(--tx)',l:'var(--ion-tx)',d:'var(--bad-fg)',i:'#fff',q:'var(--tx2)'}[t];
 var bd={p:'transparent',s:'var(--ln2)',o:'var(--ln2)',g:'transparent',l:'transparent',d:'transparent',i:'rgba(255,255,255,.5)',q:'var(--ln)'}[t];
 var sh=[];if(t==='p'||t==='d')sh.push('inset 0 1px 0 rgba(255,255,255,.28)');if(t==='s')sh.push('inset 0 1px 0 var(--hl)');
 if(p.raised&&t==='p')sh.push('0 10px 26px -8px var(--ion-glow)');
 if(p.attention)sh.push('0 0 0 4px var(--bad-soft)','0 0 22px var(--bad-soft)');
 var ex='',st=c.st;
 if(st==='hover'||p.selected)ex+=(t==='p'||t==='d')?'filter:brightness(1.07);transform:translateY(-1px);':'background:'+(t==='s'?'var(--sf4)':'var(--sf3)')+';';
 if(st==='pressed')ex+='transform:scale(.96);filter:brightness(.92);';
 if(st==='focus')sh.push('0 0 0 2px var(--bg)','0 0 0 4px var(--ion-ring)');
 if(p.disabled)ex+='opacity:.4;cursor:not-allowed;';
 if(p.block)ex+='width:100%;justify-content:center;';
 var pad=ico?'0':p.inlineLink?'0':t==='l'?'0 2px':sm?'0 12px':lg?'0 22px':'0 16px';
 var r=p.circle?'999px':'var(--r-c,10px)';
 var sp=p.loading?'<span style="width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .8s linear infinite;flex:none"></span>':'';
 var il=p.iconLeft&&(p.iconLeft.icon||p.iconLeft.html)?'<span'+K.a(a&&3)+' style="display:inline-flex">'+K.icn(p.iconLeft,sm?14:16)+'</span>':'';
 var ir=p.iconRight&&(p.iconRight.icon||p.iconRight.html)?'<span'+K.a(a&&4)+' style="display:inline-flex">'+K.icn(p.iconRight,sm?14:16)+'</span>':'';
 if(ico&&!il)il=K.ic('plus',16);
 var lab=ico?'':p.__kids!=null?'<span'+K.a(a&&2)+' style="display:inline-flex;align-items:center;gap:6px">'+p.__kids+'</span>':(p.children==null&&(il||ir))?'':'<span'+K.a(a&&2)+'>'+esc(p.children==null?'Button':p.children)+'</span>';
 var cnt=p.count!=null&&p.count!==''?'<span'+K.a(a&&5)+' style="position:absolute;top:-5px;right:-5px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:var(--bad);color:var(--bad-fg);font:600 11px/18px var(--f-ui,var(--ft));text-align:center">'+esc(p.count)+'</span>':'';
 return '<span'+K.a(a&&1)+' style="position:relative;box-sizing:border-box;'+(p.block?'':'width:fit-content;max-width:100%;')+'height:'+(t==='l'?'auto':h)+';'+(ico?'width:'+h+';justify-content:center;':'')+'padding:'+pad+';border-radius:'+r+';font:'+(p.extraBold?800:p.bold?700:'var(--bw,500)')+' '+fs+'/1 '+K.f+';letter-spacing:var(--bls,0px);display:inline-flex;align-items:center;gap:8px;white-space:nowrap;background:'+bg+';color:'+fg+';border:1px solid '+bd+';box-shadow:'+(sh.join(',')||'none')+';'+(t==='l'?'text-decoration:underline;text-underline-offset:3px;':'')+ex+'">'+sp+il+lab+ir+cnt+'</span>';};
K.icn=function(x,sz,st){if(!x)return '';if(typeof x==='string')return K.ic(x,sz||16,st);var h=x.node&&window.CVX?window.CVX.html(x.node):x.html!=null&&!x.icon?x.html:null;if(h!=null)return st?'<span style="display:inline-flex;'+st+'">'+h+'</span>':h;return K.ic(x.icon,x.size||sz||16,st);};
K.H=function(v){if(v==null||v===false||v===true)return '';if(typeof v==='string'||typeof v==='number')return esc(v);if(Array.isArray(v))return v.map(K.H).join('');if(v.html!=null)return v.html;if(v.icon)return K.ic(v.icon,v.size||16);return '';};
K.T_=function(v){if(v==null||v===false||v===true)return '';if(typeof v==='string'||typeof v==='number')return String(v);if(Array.isArray(v))return v.map(K.T_).join(' ');return v.text||'';};
K.focus=function(c){return c&&c.st==='focus'?'box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ion-ring);':'';};
/* JSX snippet parsing (docs .md examples) */
K.val=function(ex){if(/^-?\d+(\.\d+)?$/.test(ex))return +ex;if(ex==='true')return true;if(ex==='false')return false;
 var m=ex.match(/^["'`]([^"'`]*)["'`]$/);if(m)return m[1];
 m=ex.match(/^<Icon\s+([a-zA-Z]+)/);if(m)return{icon:m[1]};
 m=ex.match(/^<(\w+)/);if(m)return{el:m[1],raw:ex};
 return{raw:ex};};
K.attrs=function(s){var p={},i=0,n=s.length,m;
 while(i<n){while(i<n&&/\s/.test(s[i]))i++;if(i>=n)break;
  m=/^[A-Za-z_$][\w$:-]*/.exec(s.slice(i));if(!m){i++;continue;}
  var k=m[0];i+=k.length;
  if(s[i]==='='){i++;var v;
   if(s[i]==='"'||s[i]==="'"){var q=s[i],e=s.indexOf(q,i+1);v=s.slice(i+1,e<0?n:e);i=e<0?n:e+1;}
   else if(s[i]==='{'){var d=0,j=i;for(;j<n;j++){if(s[j]==='{')d++;else if(s[j]==='}'){d--;if(!d)break;}}v=K.val(s.slice(i+1,j).trim());i=j+1;}
   p[k]=v;}else p[k]=true;}
 return p;};
K.parse=function(code,names){var out=[];if(!code||!names||!names.length)return out;
 var re=new RegExp('<('+names.join('|')+')(?=[\\s/>])','g'),m;
 while((m=re.exec(code))){var i=m.index+m[0].length,d=0,q=null,start=i;
  for(;i<code.length;i++){var ch=code[i];if(q){if(ch===q)q=null;continue;}
   if(ch==='"'||ch==="'"){q=ch;continue;}if(ch==='{')d++;else if(ch==='}')d--;else if(ch==='>'&&d===0)break;}
  var raw=code.slice(start,i),self=/\/\s*$/.test(raw),p=K.attrs(self?raw.replace(/\/\s*$/,''):raw);p.__tag=m[1];
  if(!self){var e=code.indexOf('</'+m[1]+'>',i),inner=e>0?code.slice(i+1,e):'';
   var txt=inner.replace(/<[^>]*>/g,' ').replace(/\{[^}]*\}/g,' ').replace(/\s+/g,' ').trim();
   if(txt&&p.children==null&&!/</.test(inner))p.children=txt;else if(txt&&p.children==null)p.__text=txt;
   var it=[];inner.replace(/(?:label|title|name)=["']([^"']+)["']/g,function(_,x){it.push(x);});if(it.length)p.__items=it;}
  out.push(p);re.lastIndex=i;}
 return out;};
/* Knob DSL: @Group:a|-|b  flag?  flag?1  text=Value  num#0..100=40  enum:a|b=a  icon^=plus */
K.knobs=function(k){return(k||'').split(';').map(function(t){t=t.trim();var m;if(!t)return null;
 if((m=t.match(/^@([^:]+):(.+)$/)))return{ty:'flags',l:m[1],o:m[2].split('|')};
 if((m=t.match(/^(\w+)\?(1?)$/)))return{ty:'bool',n:m[1],v:!!m[2]};
 if((m=t.match(/^(\w+)\^=?(.*)$/)))return{ty:'icon',n:m[1],v:m[2]||''};
 if((m=t.match(/^(\w+)#(-?[\d.]+)\.\.(-?[\d.]+)=(-?[\d.]+)$/)))return{ty:'num',n:m[1],min:+m[2],max:+m[3],v:+m[4]};
 if((m=t.match(/^(\w+):([^=]+)=(.*)$/)))return{ty:'enum',n:m[1],o:m[2].split('|'),v:m[3]};
 if((m=t.match(/^(\w+)=(.*)$/)))return{ty:'text',n:m[1],v:m[2]};
 return null;}).filter(Boolean);};
K.init=function(ks){var v={};ks.forEach(function(k){v[k.ty==='flags'?'@'+k.l:k.n]=k.ty==='flags'?k.o[0]:k.v;});return v;};
K.props=function(ks,v){var p={};ks.forEach(function(k){if(k.ty==='flags'){var x=v['@'+k.l];if(x&&x!=='-')p[x]=true;return;}
 var y=v[k.n];if(k.ty==='bool'){if(y)p[k.n]=true;else if(k.v)p[k.n]=false;}else if(k.ty==='icon'){if(y)p[k.n]={icon:y};}else if(y!==''&&y!=null)p[k.n]=y;});return p;};
K.code=function(name,p){var at=[],ch='';Object.keys(p).forEach(function(k){var v=p[k];if(k.slice(0,2)==='__')return;if(k==='children'){ch=v;return;}
  if(v===true)at.push(k);else if(v===false)at.push(k+'={false}');else if(typeof v==='number')at.push(k+'={'+v+'}');else if(v&&v.icon)at.push(k+'={<Icon '+v.icon+' size={16} />}');else if(typeof v==='string')at.push(k+'="'+v+'"');});
 var open='<'+name+(at.length?' '+at.join(' '):''),one=(open.length+(ch?String(ch).length+name.length+3:3))<80;
 if(one)return ch!==''&&ch!=null?open+'>'+ch+'</'+name+'>':open+' />';
 var head='<'+name+'\n'+at.map(function(a){return '  '+a;}).join('\n')+'\n';
 return ch!==''&&ch!=null?head+'>\n  '+ch+'\n</'+name+'>':head+'/>';};
K.KB={
 button:[['Enter','Activates'],['Space','Activates'],['Tab','Moves focus on']],
 toggle:[['Space','Toggles'],['Tab','Moves focus on']],
 radio:[['Tab','Enters the group on the checked option'],['ArrowDown · ArrowRight','Checks the next option'],['ArrowUp · ArrowLeft','Checks the previous option'],['Space','Checks the focused option']],
 slider:[['ArrowRight · ArrowUp','One step up'],['ArrowLeft · ArrowDown','One step down'],['PageUp · PageDown','A larger step'],['Home · End','Minimum · maximum']],
 spin:[['ArrowUp','Increments'],['ArrowDown','Decrements'],['Home · End','Minimum · maximum']],
 tabs:[['ArrowLeft · ArrowRight','Moves between tabs'],['Home · End','First · last tab'],['Enter · Space','Activates the focused tab'],['Tab','Leaves for the panel']],
 menu:[['Enter · Space · ArrowDown','Opens the menu'],['ArrowUp · ArrowDown','Moves between items'],['Home · End','First · last item'],['Enter','Chooses the item'],['Escape','Closes, focus returns to the trigger']],
 listbox:[['ArrowUp · ArrowDown','Moves the active option'],['Space','Selects, toggles when multi'],['Home · End','First · last option'],['A letter','Jumps to the next match']],
 combobox:[['ArrowDown','Opens the list'],['ArrowUp · ArrowDown','Moves through options'],['Enter','Commits the active option'],['Escape','Closes the list, keeps the text']],
 dialog:[['Tab · Shift+Tab','Cycles focus inside the panel'],['Escape','Closes when dismissible'],['Enter','Confirms in forms']],
 disclosure:[['Enter · Space','Expands or collapses'],['ArrowUp · ArrowDown','Moves between headers'],['Home · End','First · last header']],
 grid:[['Arrow keys','Moves between cells'],['Home · End','Row start · end'],['PageUp · PageDown','Previous · next page'],['Enter · Space','Activates or selects']],
 text:[['Type','Edits the value'],['Tab','Next field'],['Escape','Clears when clearable']],
 otp:[['Type','Fills the cell and advances'],['Backspace','Clears and steps back'],['ArrowLeft · ArrowRight','Moves between cells'],['Paste','Fills every cell']],
 link:[['Tab','Moves between links'],['Enter','Follows the link']],
 carousel:[['ArrowLeft · ArrowRight','Previous · next slide'],['Tab','Reaches arrows and dots']],
 board:[['Space','Lifts or drops the focused card'],['Arrow keys','Moves a lifted card'],['Escape','Cancels the move']],
 chart:[['Tab','Focuses the plot'],['ArrowLeft · ArrowRight','Steps through points when inspectable'],['Escape','Clears the inspected point']],
 none:[]};
K.SPX=K.SPX||{};
K.spec0=function(s){return K.R[s]||(K.SUBS&&K.SUBS[s])||{r:function(p){return '<div style="padding:24px;border:1px dashed var(--ln2);border-radius:12px;font:500 13px var(--fm);color:var(--tx3)">'+esc(s)+'</div>';}};};
/* spec extras (anatomy names, anatomy props) live apart from the specs so a kit file that loads again never drops them */
K.spec=function(s){var o=K.spec0(s),x=K.SPX[s];return x?Object.assign({},o,x,x.ap&&o.ap?{ap:Object.assign({},o.ap,x.ap)}:{}):o;};
K.PFR=K.PFR||{};
K.AD=K.AD||{};
K.OV=K.OV||{};
/* Code-driven overrides are kept apart from the specs and chained at render time, so a kit file that (re)defines a spec later never drops them. */
/* K.OV[slug] / K.PW[slug][pf] hold {rank,i,fn}: re-registering replaces, and chains always run in rank order, however often or in whatever order the scripts load. */
K.reg=function(list,rank,i,fn){var x=list.find(function(o){return o.rank===rank&&o.i===i;});if(x)x.fn=fn;else list.push({rank:rank,i:i,fn:fn});list.sort(function(a,b){return a.rank-b.rank||a.i-b.i;});};
K.chain=function(s){var r=K.spec(s).r;(K.OV[s]||[]).forEach(function(o){var fn=o.fn||o,b=r;r=function(p,c){return fn(p||{},c||{},b);};});return r;};
K.render0=function(s,p,c){if(K.AD[s])p=K.AD[s](p);var r=K.chain(s),v=K.PFR[s]&&K.PFR[s][c.pf];if(v&&K.PW&&K.PW[s]&&K.PW[s][c.pf])K.PW[s][c.pf].forEach(function(e){var fn=e.fn||e,o=v;v=function(p,cc,b){return fn(p||{},cc||{},b,o);};});return v?v(p,c,r):r(p,c);};
/* a fixed root width never overflows a narrow pane */
K.render=function(s,p,c){p=p||{};c=c||{};try{var out=K.render0(s,p,c),m=out.match(/^<(\w+)([^>]*?)style="([^"]*)"/);if(m&&/(^|;)\s*width:\s*\d{3,}px/.test(m[3])&&!/max-width/.test(m[3]))out=out.replace(m[0],'<'+m[1]+m[2]+'style="'+m[3]+';max-width:100%"');return out;}catch(e){return '<div style="font:12px var(--fm);color:var(--bad)">render error: '+esc(e.message)+'</div>';}};
})();
