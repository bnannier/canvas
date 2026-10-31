import { useEffect, useId, useState, type ComponentType, type ReactNode } from "react";
import { AppState, Platform, TextInput, type TextStyle, type ViewStyle } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Polyline, Polygon, Ellipse, Filter, FeDropShadow, Rect, Stop, Text as SvgText } from "react-native-svg";
import Animated, { interpolateColor, createAnimatedPropAdapter, processColor, useAnimatedProps, useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from "react-native-reanimated";
import { GlassSurface, View, alpha, useTheme } from "@nannier/canvas";
import { useReducedMotion } from "../../../../src/style/motion";
import { ICONS } from "../../../../src/atoms/icon/icon.glyphs";
import { resolveFontFace } from "../../../../src/style/fonts";
import { PLATFORMS_SHOWN, PLATFORM_LABELS } from "../../core/platforms-shown";
import { PLATFORM_COPY } from "../../data/platform-copy";
import { dataPlaneStyle } from "./section-vignette-geometry";
import { VignetteStage } from "./hero";

/**
 * The vendored canvas-hero.js illustrations, expressed in RN/SVG rather than its DOM
 * custom element. These are decorative, noninteractive reference illustrations, not
 * replacement controls. One UI-thread clock drives every scene; React only renders
 * when the stage measures or the theme changes. Timings and dimensions below are the
 * reference's keyframes, including its independent periods and positive delays.
 */
export type VignetteKind = "foundations" | "layout" | "controls" | "inputs" | "navigation" | "data" | "charts" | "overlays" | "skins";
type Draw = (time: number) => Record<string, unknown>;
const AR = Animated.createAnimatedComponent(Rect);
const AC = Animated.createAnimatedComponent(Circle);
const AP = Animated.createAnimatedComponent(Path);
const AG = Animated.createAnimatedComponent(G);
const AT = Animated.createAnimatedComponent(SvgText);
const AI = Animated.createAnimatedComponent(TextInput);

/** CSS cubic-bezier inversion, shared by every timeline on the UI thread. */
export function bezier(x: number, x1: number, y1: number, x2: number, y2: number): number {
  "worklet";
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0, hi = 1;
  for (let i = 0; i < 15; i++) {
    const t = (lo + hi) / 2, u = 1 - t;
    const at = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
    if (at < x) lo = t; else hi = t;
  }
  const t = (lo + hi) / 2, u = 1 - t;
  return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
}
const SPRING = [0.34, 1.56, 0.64, 1] as const;
const SMOOTH = [0.65, 0, 0.35, 1] as const;
const EASE = [0.25, 0.1, 0.25, 1] as const;

/** Evaluate CSS keyframes, applying easing to each interval, not the entire cycle. */
export function timeline(time: number, period: number, keys: readonly number[], values: readonly number[], curve: readonly number[] = EASE, delay = 0): number {
  "worklet";
  if (time < delay) return values[0]!;
  const p = ((time - delay) % period) / period;
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i]!) {
      const u = (p - keys[i - 1]!) / (keys[i]! - keys[i - 1]!);
      const e = bezier(u, curve[0]!, curve[1]!, curve[2]!, curve[3]!);
      return values[i - 1]! + (values[i]! - values[i - 1]!) * e;
    }
  }
  return values[values.length - 1]!;
}

// SVG exposes native brush objects rather than ordinary RN style colors. Its web
// setNativeProps follows that contract too, so convert animated fills on both hosts.
const svgAdapter = createAnimatedPropAdapter((props) => {
  "worklet";
  for (const name of ["fill", "stroke"]) {
    if (typeof props[name] === "string") props[name] = { type: 0, payload: processColor(props[name] as string) };
  }
  if (Platform.OS !== "web" && typeof props.transform === "string") {
    const operations = props.transform.match(/(translate|scale)\([^)]*\)/g) ?? [];
    let a = 1, d = 1, x = 0, y = 0;
    for (const operation of operations) {
      const scale = operation.startsWith("scale");
      const args = operation.slice(operation.indexOf("(") + 1, -1).trim().split(/[ ,]+/).map(Number);
      if (scale) { a *= args[0]!; d *= args[1] ?? args[0]!; }
      else { x += a * args[0]!; y += d * (args[1] ?? 0); }
    }
    props.matrix = [a, 0, 0, d, x, y];
    delete props.transform;
  }
}, ["fill", "stroke", "matrix"]);

function Motion({ as: Tag, clock, draw, rest, ...props }: { as: ComponentType<any>; clock: SharedValue<number>; draw: Draw; rest?: Record<string, unknown>; [key: string]: any }) {
  const reduced = useReducedMotion();
  const animatedProps = useAnimatedProps(() => draw(clock.value), undefined, svgAdapter);
  if (reduced) return <Tag key="still" {...props} {...(rest ?? draw(2800))} />;
  return <Tag key="moving" {...props} animatedProps={animatedProps} />;
}

interface Scene {
  kind: VignetteKind;
  clock: SharedValue<number>;
  w: number;
  h: number;
  id: string;
  t: ReturnType<typeof useTheme>["tokens"];
  dark: boolean;
  fonts: { sans: string; display: string; mono: string };
  panel: string;
  line: string;
  ring: string;
}
function Label({ s, x, y, children, size = 14, weight = 400, fill, mono = false, display = false, center = false, tracking = 0 }: { s: Scene; x: number; y: number; children: ReactNode; size?: number; weight?: number; fill?: string; mono?: boolean; display?: boolean; center?: boolean; tracking?: number }) {
  return <SvgText x={x} y={y} fill={fill ?? s.t.foreground} fontSize={size} fontWeight={weight} fontFamily={s.fonts[mono ? "mono" : display ? "display" : "sans"]} textAnchor={center ? "middle" : "start"} letterSpacing={tracking}>{children}</SvgText>;
}
function Meta({ s, x, y, children, center = false }: { s: Scene; x: number; y: number; children: ReactNode; center?: boolean }) {
  return <Label s={s} x={x} y={y} size={11} weight={500} fill={s.t["subtle-foreground"]} mono tracking={0.66} center={center}>{children}</Label>;
}
function Pane({ s, x, y, width, height, radius = 20 }: { s: Scene; x: number; y: number; width: number; height: number; radius?: number }) {
  const material = ["controls", "inputs", "navigation", "charts", "layout", "data", "overlays"].includes(s.kind);
  return <Rect x={x} y={y} width={width} height={height} rx={radius} fill={material ? "transparent" : s.panel} stroke={material ? "transparent" : s.line} />;
}
function Glyph({ name, x, y, size = 20, ink }: { name: string; x: number; y: number; size?: number; ink: string }) {
  return <G transform={`translate(${x} ${y}) scale(${size / 24})`} stroke={ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none">{(ICONS[name]??ICONS.check!).map((shape,i)=>{
    switch(shape.t){
      case "path":return <Path key={i} d={shape.d}/>;
      case "circle":return <Circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r}/>;
      case "line":return <Line key={i} x1={shape.x1} x2={shape.x2} y1={shape.y1} y2={shape.y2}/>;
      case "polyline":return <Polyline key={i} points={shape.points}/>;
      case "polygon":return <Polygon key={i} points={shape.points}/>;
      case "rect":return <Rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx}/>;
      case "ellipse":return <Ellipse key={i} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry}/>;
    }
  })}</G>;
}

/** The reference's .gl panels use the real shared material behind the SVG marks. */
function MaterialPanel({ s, x, y, width, height, radius = 20 }: { s: Scene; x: number; y: number; width: number; height: number; radius?: number }) {
  return <GlassSurface floating static tint={s.panel} pointerEvents="none" style={{position:"absolute",left:x,top:y,width,height,borderRadius:radius,borderWidth:1,borderColor:s.line,backgroundColor:s.t.popover,boxShadow:s.dark?"inset 0 1px 0 rgba(255,255,255,.1),0 30px 80px -16px rgba(0,0,0,.8)":"inset 0 1px 0 rgba(255,255,255,.8),0 30px 80px -16px rgba(30,30,60,.2)"}} />;
}
function MovingPanel({ s, draw, radius = 20, veil = false }: { s: Scene; draw: (time: number) => ViewStyle; radius?: number; veil?: boolean }) {
  const motion = useAnimatedStyle(() => draw(s.clock.value));
  return <Animated.View pointerEvents="none" style={[{position:"absolute"},motion]}><GlassSurface floating static veil={veil} tint={veil?undefined:s.panel} style={{width:"100%",height:"100%",borderRadius:radius,borderWidth:veil?0:1,borderColor:s.line,backgroundColor:veil?(s.dark?"rgba(5,5,10,.55)":"rgba(10,10,20,.35)"):s.t.popover,boxShadow:veil?undefined:s.dark?"inset 0 1px 0 rgba(255,255,255,.1),0 30px 80px -16px rgba(0,0,0,.8)":"inset 0 1px 0 rgba(255,255,255,.8),0 30px 80px -16px rgba(30,30,60,.2)"}}/></Animated.View>;
}
function ControlBlooms({ s }: { s: Scene }) {
  const width=Math.min(360,s.w*.88),left=(s.w-width)/2+19,right=(s.w+width)/2-19,y=(s.h-217.171875)/2;
  const glow=alpha(s.t.primary,s.dark?.5:.4);
  const switchGlow=useAnimatedStyle(()=>{
    const p=Math.max(0,timeline(s.clock.value,4000,[0,.15,.25,.75,.85,1],[0,0,1,1,0,0]));
    return {left:right-44,top:y+25.5,width:44,height:26,borderRadius:13,boxShadow:[{offsetX:0,offsetY:0,blurRadius:18*p,spreadDistance:0,color:interpolateColor(p,[0,1],["transparent",glow])}]};
  });
  const sliderGlow=useAnimatedStyle(()=>({left,top:y+120.171875,width:(width-38)*timeline(s.clock.value,5000,[0,.1,.4,.55,1],[.24,.24,.82,.82,.24],SPRING),height:6,borderRadius:3,boxShadow:[{offsetX:0,offsetY:0,blurRadius:14,spreadDistance:0,color:glow}]}));
  return <><Animated.View pointerEvents="none" style={[{position:"absolute"},switchGlow]}/><Animated.View pointerEvents="none" style={[{position:"absolute"},sliderGlow]}/></>;
}
function SaveMaterial({ s }: { s: Scene }) {
  const width=Math.min(360,s.w*.88),right=(s.w+width)/2-19,y=(s.h-217.171875)/2;
  const glow=alpha(s.t.primary,s.dark?.5:.4);
  const motion=useAnimatedStyle(()=>{
    const time=s.clock.value;
    const pulse=timeline(time,3000,[0,.6,.66,.74,1],[0,0,0,1,0],SPRING);
    const scale=timeline(time,3000,[0,.6,.66,.74,1],[1,1,.93,1,1],SPRING);
    const dy=timeline(time,3000,[0,.66,.74,1],[0,0,-1,0],SPRING);
    return {left:right-56.9375,top:y+162.171875+dy,width:56.9375,height:34,borderRadius:10,backgroundColor:s.t.primary,transform:[{scale}],boxShadow:[{offsetX:0,offsetY:1,blurRadius:0,spreadDistance:0,color:"rgba(255,255,255,.3)",inset:true},{offsetX:0,offsetY:0,blurRadius:0,spreadDistance:Math.max(0,8*pulse),color:s.t["primary-soft"]??"transparent"},{offsetX:0,offsetY:8+6*pulse,blurRadius:20+10*pulse,spreadDistance:-8,color:glow}]};
  });
  return <Animated.View pointerEvents="none" style={[{position:"absolute"},motion]}/>;
}
function Materials({ s }: { s: Scene }) {
  if(s.kind==="controls"||s.kind==="inputs") {
    const width=Math.min(360,s.w*.88),height=s.kind==="controls"?217.171875:178;
    return <><MaterialPanel s={s} x={(s.w-width)/2} y={(s.h-height)/2} width={width} height={height}/>{s.kind==="controls"&&<><ControlBlooms s={s}/><SaveMaterial s={s}/></>}</>;
  }
  if(s.kind==="navigation") {
    const width=Math.min(380,s.w*.9);
    return <MaterialPanel s={s} x={(s.w-width)/2} y={(s.h-131)/2+70} width={width} height={60} radius={30}/>;
  }
  if(s.kind==="charts") {
    const side=s.w>440,inner=s.w-44,main=side?(inner-14-32)*1.6/2.6+32:inner,sw=inner-main-14,height=s.h-44;
    return <><MaterialPanel s={s} x={22} y={22} width={main} height={height} radius={18}/>{side&&<><MaterialPanel s={s} x={36+main} y={22} width={sw} height={(height-14+28)/2} radius={16}/><MaterialPanel s={s} x={36+main} y={22+(height+14+28)/2} width={sw} height={(height-14-28)/2} radius={16}/></>}</>;
  }
  if(s.kind==="layout") {
    const width=Math.min(540,s.w-48);
    return <MovingPanel s={s} radius={16} draw={(time)=>{ "worklet";const k=timeline(time,9000,[0,.26,.33,.59,.66,.92,1],[1,1,.64,.64,.36,.36,1],SPRING);return {left:s.w/2-width*k/2,top:69,width:width*k,height:190};}}/>;
  }
  if(s.kind==="overlays") {
    const width=Math.min(320,s.w*.82),x=(s.w-width)/2,y=(s.h-220.03125)/2;
    return <>
      <Svg width="100%" height={s.h} style={{position:"absolute"}}>{[.38,.86,.72,.9,.54,.8,.64].map((v,i)=><Rect key={i} x={22} y={22+i*20+(i?4:0)} width={(s.w-44)*v} height={i?10:14} rx={6} fill={s.t.secondary}/>)}</Svg>
      <MovingPanel s={s} veil radius={0} draw={(time)=>{ "worklet";return {left:0,top:0,width:s.w,height:s.h,opacity:timeline(time,8000,[0,.1,.18,.62,.7,1],[0,0,1,1,0,0])};}}/>
      <MovingPanel s={s} draw={(time)=>{ "worklet";const opacity=timeline(time,8000,[0,.12,.22,.6,.68,1],[0,0,1,1,0,0],SPRING),scale=timeline(time,8000,[0,.12,.22,.6,.68,1],[.97,.97,1,1,.98,.98],SPRING),dy=timeline(time,8000,[0,.12,.22,.6,.68,1],[.08,.08,0,0,.03,.03],SPRING)*220.03125;return {left:x,top:y+dy,width,height:220.03125,opacity,transform:[{scale}]};}}/>
      <MovingPanel s={s} radius={14} draw={(time)=>{ "worklet";return {left:s.w-245,top:s.h-62+timeline(time,8000,[0,.64,.72,.92,.98,1],[24,24,0,0,8,8],SPRING),width:227,height:44,opacity:timeline(time,8000,[0,.64,.72,.92,.98,1],[0,0,1,1,0,0],SPRING)};}}/>
    </>;
  }
  return null;
}

// CSS offset-path advances by arc length, rather than by a cubic's parameter.
// Sample the exact two cubics once and invert their cumulative distance on the UI thread.
const SPRING_PATH = (() => {
  const points: {x:number;y:number;distance:number}[]=[];
  let distance=0;
  for(let i=0;i<=240;i++) {
    const segment=i>120?1:0,t=segment?(i-120)/120:i/120,u=1-t;
    const c=segment?[[128,10],[186,34],[196,14],[216,12]]:[[4,84],[60,84],[70,-14],[128,10]];
    const x=u*u*u*c[0]![0]!+3*u*u*t*c[1]![0]!+3*u*t*t*c[2]![0]!+t*t*t*c[3]![0]!;
    const y=u*u*u*c[0]![1]!+3*u*u*t*c[1]![1]!+3*u*t*t*c[2]![1]!+t*t*t*c[3]![1]!;
    const previous=points[points.length-1];
    if(previous)distance+=Math.hypot(x-previous.x,y-previous.y);
    points.push({x,y,distance});
  }
  return points.map(p=>({...p,distance:p.distance/distance}));
})();

function Foundations({ s }: { s: Scene }) {
  const narrow = s.w <= 420, fontSize = narrow ? 84 : 120;
  const x = narrow ? s.w / 2 : (s.w - 412) / 2;
  const hues = [s.t.primary, s.t["chart-2"], s.t["chart-3"], s.t["chart-4"], s.t["chart-5"]];
  const wheels = hues.map(color => {
    const hex = color ?? "#a795ef", r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return Array.from({length:25},(_,j)=>{
      const angle=j*Math.PI/12,c=Math.cos(angle),q=Math.sin(angle);
      const rr=(.213+.787*c-.213*q)*r+(.715-.715*c-.715*q)*g+(.072-.072*c+.928*q)*b;
      const gg=(.213-.213*c+.143*q)*r+(.715+.285*c+.140*q)*g+(.072-.072*c-.283*q)*b;
      const bb=(.213-.213*c-.787*q)*r+(.715-.715*c+.715*q)*g+(.072+.928*c+.072*q)*b;
      return `rgb(${Math.round(Math.max(0,Math.min(255,rr)))},${Math.round(Math.max(0,Math.min(255,gg)))},${Math.round(Math.max(0,Math.min(255,bb)))})`;
    });
  });
  return <>
    <Defs><LinearGradient id={`${s.id}type`} x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="30%" stopColor={s.t.foreground} /><Stop offset="100%" stopColor={s.t.primary} /></LinearGradient></Defs>
    <Motion as={AT} clock={s.clock} x={x} y={s.h / 2 + fontSize * .34} textAnchor={narrow ? "middle" : "start"} fontSize={fontSize} fontFamily={s.fonts.display} fill={`url(#${s.id}type)`} draw={(time) => { "worklet"; const half = Math.floor(time / 4800) % 2, p = (time % 4800) / 4800, e = bezier(half ? 1 - p : p, .65, 0, .35, 1); return { fontWeight: String(Math.round(300 + 500 * e)), letterSpacing: fontSize * (-.02 - .04 * e) }; }}>Aa</Motion>
    {!narrow && <G transform={`translate(${x + 192} 46)`}>
      {hues.map((color, i) => <Motion key={i} as={AC} clock={s.clock} cx={14 + i * 36} r={14} fill={color} filter={`url(#${s.id}glow)`} draw={(time) => { "worklet"; return { cy: 14 + timeline(time, 2400, [0,.35,1], [0,-9,0], SPRING, i * 120), fill: interpolateColor((time % 12000) / 12000, wheels[i]!.map((_, j) => j / 24), wheels[i]!) }; }} />)}
      <G transform="translate(0 46)">
        <Path d="M4 12H216" fill="none" stroke={s.line} strokeDasharray="3 5" />
        <Motion as={AP} clock={s.clock} d="M4 84 C60 84 70 -14 128 10 S196 14 216 12" fill="none" stroke={s.t.primary} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="330" draw={(time) => { "worklet"; return { strokeDashoffset: timeline(time, 3400, [0,.6,1], [330,0,0], SMOOTH) }; }} />
        <Motion as={AC} clock={s.clock} r={6} fill="#fff" stroke={s.ring} strokeWidth={4} draw={(time) => { "worklet"; const p = timeline(time, 3400, [0,.6,1], [0,1,1], SMOOTH); let i=1;while(i<SPRING_PATH.length-1&&SPRING_PATH[i]!.distance<p)i++;const start=SPRING_PATH[i-1]!,end=SPRING_PATH[i]!,q=(p-start.distance)/(end.distance-start.distance);return {cx:start.x+(end.x-start.x)*q,cy:start.y+(end.y-start.y)*q }; }} />
      </G>
      <Meta s={s} x={0} y={169}>WGHT 300 → 800 · ONE HUE · ONE SPRING</Meta>
    </G>}
  </>;
}

function Layout({ s }: { s: Scene }) {
  const width = Math.min(540, s.w - 48);
  return <>
    {["DESKTOP · 12 COLUMNS", "TABLET · 8 COLUMNS", "PHONE · 4 COLUMNS"].map((text, i) => <Motion key={text} as={AT} clock={s.clock} x={s.w / 2} y={50} textAnchor="middle" fontFamily={s.fonts.mono} fontSize={11} fontWeight={500} letterSpacing={.66} fill={s.t["primary-text"]} draw={(time) => { "worklet"; return { opacity: time < i * 3000 ? 0 : timeline(time, 9000, [0,.30,.33,1], [1,1,0,0], EASE, i * 3000) }; }}>{text}</Motion>)}
    <Motion as={AR} clock={s.clock} y={69} height={190} rx={16} fill="transparent" stroke="transparent" draw={(time) => { "worklet"; const k = timeline(time, 9000, [0,.26,.33,.59,.66,.92,1], [1,1,.64,.64,.36,.36,1], SPRING); return { x: s.w / 2 - width * k / 2, width: width * k }; }} />
    <Motion as={AR} clock={s.clock} y={82} height={16} rx={6} fill={s.t.secondary} draw={(time) => { "worklet"; const k = timeline(time, 9000, [0,.26,.33,.59,.66,.92,1], [1,1,.64,.64,.36,.36,1], SPRING); return { x: s.w / 2 - width * k / 2 + 13, width: Math.max(0, width * k - 26) }; }} />
    {[0,1,2].map(i => <Motion key={`dot${i}`} as={AC} clock={s.clock} cy={90} r={3} fill={s.line} draw={(time) => { "worklet"; const k = timeline(time, 9000, [0,.26,.33,.59,.66,.92,1], [1,1,.64,.64,.36,.36,1], SPRING); return { cx: s.w / 2 - width * k / 2 + 22 + i * 12 }; }} />)}
    <Defs><ClipPath id={`${s.id}gridClip`}><Rect x={0} y={108} width={s.w} height={138}/></ClipPath></Defs>
    <G clipPath={`url(#${s.id}gridClip)`}>
    {Array.from({ length: 12 }, (_, i) => <Motion key={i} as={AR} clock={s.clock} rx={8.5} height={41} fill={i % 3 === 1 ? s.t["chart-2"] : s.t["primary-soft"]} fillOpacity={i % 3 === 1 ? .16 : 1} stroke={i % 3 === 1 ? s.t["chart-2"] : s.ring} strokeOpacity={i % 3 === 1 ? .35 : 1} draw={(time) => { "worklet"; const k = timeline(time, 9000, [0,.26,.33,.59,.66,.92,1], [1,1,.64,.64,.36,.36,1], SPRING); const inner = width * k - 26, cols = Math.max(1, Math.floor((inner + 8) / 68)), cell = (inner - (cols - 1) * 8) / cols, row = Math.floor(i / cols); return { x: s.w / 2 - width * k / 2 + 13.5 + (i % cols) * (cell + 8), y: 108.5 + row * 50, width: cell - 1, opacity: 1 }; }} />)}
    </G>
  </>;
}

function Controls({ s }: { s: Scene }) {
  const width = Math.min(360, s.w * .88), x = (s.w - width) / 2, y = (s.h - 217.171875) / 2, left = x + 19, right = x + width - 19;
  return <>
    <Pane s={s} x={x} y={y} width={width} height={217.171875} />
    <Label s={s} x={left} y={y + 33} weight={500}>Glass surfaces</Label>
    <Label s={s} x={left} y={y + 50} size={12} fill={s.t["subtle-foreground"]}>Frost on every pane</Label>
    <Line x1={left} x2={right} y1={y + 70.484375} y2={y + 70.484375} stroke={s.t.border} />
    <Motion as={AR} clock={s.clock} x={right - 44} y={y + 25.5} width={44} height={26} rx={13} stroke={s.line} draw={(time) => { "worklet"; const p = timeline(time, 4000, [0,.15,.25,.75,.85,1], [0,0,1,1,0,0]); return { fill: interpolateColor(p, [0,1], [s.t["surface-raised"] ?? s.t.secondary,s.t.primary]), stroke: interpolateColor(p, [0,1], [s.line,s.t.primary]) }; }} />
    <Motion as={AC} clock={s.clock} cy={y + 38.5} r={11} fill="#fff" filter={`url(#${s.id}thumb)`} draw={(time) => { "worklet"; return { cx: right - 31 + timeline(time, 4000, [0,.15,.25,.75,.85,1], [0,0,18,18,0,0], SPRING) }; }} />
    <Label s={s} x={left} y={y + 97.984375} weight={500}>Glass intensity</Label>
    <Rect x={left} y={y + 120.171875} width={width - 38} height={6} rx={3} fill={s.t["surface-raised"]} />
    <Motion as={AR} clock={s.clock} x={left} y={y + 120.171875} height={6} rx={3} fill={s.t.primary} draw={(time) => { "worklet"; return { width: (width - 38) * timeline(time, 5000, [0,.1,.4,.55,1], [.24,.24,.82,.82,.24], SPRING) }; }} />
    <Motion as={AC} clock={s.clock} cy={y + 123.171875} r={10} fill="#fff" filter={`url(#${s.id}thumb)`} draw={(time) => { "worklet"; return { cx: left + (width - 38) * timeline(time, 5000, [0,.1,.4,.55,1], [.24,.24,.82,.82,.24], SPRING) }; }} />
    <Line x1={left} x2={right} y1={y + 147.671875} y2={y + 147.671875} stroke={s.t.border} />
    <Motion as={AR} clock={s.clock} x={left} y={y + 170.171875} width={18} height={18} rx={5} strokeWidth={1.5} draw={(time) => { "worklet"; const p = timeline(time, 4000, [0,.3,.38,.82,.9,1], [0,0,1,1,0,0]); return { fill: interpolateColor(p, [0,1], ["transparent",s.t.primary]), stroke: interpolateColor(p, [0,1], [s.line,s.t.primary]) }; }} />
    <Motion as={AP} clock={s.clock} d={`M${left + 4} ${y + 180.171875}l3 3 6-7`} stroke={s.t["primary-foreground"]} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="16" draw={(time) => { "worklet"; return { strokeDashoffset: timeline(time, 4000, [0,.36,.48,.82,.9,1], [16,16,0,0,16,16]) }; }} />
    <Label s={s} x={left + 32} y={y + 184.171875} weight={500}>Release notes</Label>
    <Motion as={AG} clock={s.clock} draw={(time) => { "worklet"; const scale = timeline(time, 3000, [0,.6,.66,.74,1], [1,1,.93,1,1], SPRING), dy = timeline(time, 3000, [0,.66,.74,1], [0,0,-1,0], SPRING), cx = right - 28.46875, cy = y + 179.171875; return { transform: `translate(${cx} ${cy + dy}) scale(${scale}) translate(${-cx} ${-cy})` }; }}>
      <Rect x={right - 56.9375} y={y + 162.171875} width={56.9375} height={34} rx={10} fill="transparent" />
      <Label s={s} x={right - 28.46875} y={y + 184.171875} size={13} weight={500} center fill={s.t["primary-foreground"]}>Save</Label>
    </Motion>
  </>;
}

function Inputs({ s }: { s: Scene }) {
  const width = Math.min(360, s.w * .88), x = (s.w - width) / 2, left = x + 18, inner = width - 36, y = (s.h - 178) / 2;
  return <>
    <Pane s={s} x={x} y={y} width={width} height={178} />
    <Label s={s} x={left} y={y + 29} size={12} weight={500} fill={s.t["muted-foreground"]}>Workspace URL</Label>
    <Motion as={AR} clock={s.clock} x={left} y={y + 38} width={inner} height={40} rx={10} fill={s.t["surface-sunken"]} draw={(time) => { "worklet"; const p = timeline(time,6000,[0,.08,.14,.88,.96,1],[0,0,1,1,0,0]); return { stroke: interpolateColor(p,[0,1],[s.line,s.t.primary]), strokeWidth: 1 }; }} />
    <Motion as={AR} clock={s.clock} x={left - 2} y={y + 36} width={inner + 4} height={44} rx={12} fill="none" stroke={s.ring} strokeWidth={4} draw={(time) => { "worklet"; return { opacity: timeline(time,6000,[0,.08,.14,.88,.96,1],[0,0,1,1,0,0]) }; }} />
    {"northwind".split("").map((letter,i) => <Motion key={i} as={AT} clock={s.clock} x={left + 12 + i * 8.4} y={y + 63} fill={s.t.foreground} fontFamily={s.fonts.mono} fontSize={14} draw={(time) => { "worklet"; const p = (time % 6000) / 6000; const n = p < .16 ? 0 : p < .46 ? Math.floor((p - .16) / .3 * 9) : p < .88 ? 9 : p < .96 ? Math.floor((.96 - p) / .08 * 9) : 0; return { opacity: i < n ? 1 : 0 }; }}>{letter}</Motion>)}
    <Motion as={AR} clock={s.clock} y={y + 47} width={1.5} height={16} fill={s.t.primary} draw={(time) => { "worklet"; const p = (time % 6000) / 6000, n = p < .16 ? 0 : p < .46 ? Math.floor((p - .16) / .3 * 9) : p < .88 ? 9 : p < .96 ? Math.floor((.96 - p) / .08 * 9) : 0; return { x: left + 13 + n * 8.4, opacity: time % 1000 < 500 ? 1 : 0 }; }} />
    <Label s={s} x={left + inner - 91} y={y + 63} size={12} mono fill={s.t["subtle-foreground"]}>.canvas.dev</Label>
    <Label s={s} x={left} y={y + 106} size={12} weight={500} fill={s.t["muted-foreground"]}>Verification code</Label>
    {"482107".split("").map((digit,i) => {
      const cell = Math.min(44,(inner - 40) / 6), xx = left + i * (cell + 8);
      return <G key={i}>
        <Motion as={AR} clock={s.clock} x={xx} width={cell} height={46} rx={10} fill={s.t["surface-sunken"]} draw={(time) => { "worklet"; const p = timeline(time,6000,[0,.5,.54,.6,.9,1],[0,0,1,.6,.6,0],EASE,i*250); return { y: y + 114 + timeline(time,6000,[0,.5,.54,.6,1],[0,0,-3,0,0],EASE,i*250), stroke: interpolateColor(p,[0,.6,1],[s.line,s.ring,s.t.primary]) }; }} />
        <Motion as={AT} clock={s.clock} x={xx + cell / 2} textAnchor="middle" fontFamily={s.fonts.mono} fontSize={18} fontWeight={500} fill={s.t.foreground} draw={(time) => { "worklet"; return { y: y + 143 + timeline(time,6000,[0,.5,.54,.6,1],[0,0,-3,0,0],EASE,i*250), opacity: timeline(time,6000,[0,.5,.6,.9,1],[0,0,1,1,0],EASE,i*250) }; }}>{digit}</Motion>
      </G>;
    })}
  </>;
}

function Navigation({ s }: { s: Scene }) {
  const cell = s.w <= 420 ? 72 : 96, x = (s.w - cell * 4) / 2, y = (s.h - 131) / 2, width = Math.min(380,s.w*.9), bx = (s.w-width)/2, bcell = (width - 12)/5;
  return <>
    <Line x1={x} x2={x+cell*4} y1={y+40} y2={y+40} stroke={s.t.border} />
    {["Overview","Components","Tokens","Changelog"].map((name,i) => <Motion key={name} as={AT} clock={s.clock} x={x+cell*(i+.5)} y={y+25} textAnchor="middle" fontFamily={s.fonts.sans} fontSize={s.w <= 420 ? 11 : 13} fontWeight={500} draw={(time) => { "worklet"; return { fill: interpolateColor(time < i*2000 ? 0 : timeline(time,8000,[0,.22,.25,1],[1,1,0,0],EASE,i*2000),[0,1],[s.t["muted-foreground"],s.t.foreground]) }; }}>{name}</Motion>)}
    <Motion as={AR} clock={s.clock} y={y+39} width={cell} height={2} rx={1} fill={s.t.primary} filter={`url(#${s.id}glow)`} draw={(time) => { "worklet"; return { x: x + timeline(time,8000,[0,.2,.25,.45,.5,.7,.75,.95,1],[0,0,cell,cell,2*cell,2*cell,3*cell,3*cell,0],SPRING) }; }} />
    <Pane s={s} x={bx} y={y+70} width={width} height={60} radius={30} />
    <Motion as={AR} clock={s.clock} y={y+76} width={bcell} height={46} rx={23} fill={s.t["primary-soft"]} stroke={s.ring} draw={(time) => { "worklet"; return { x: bx + 6 + timeline(time,10000,[0,.16,.2,.36,.4,.56,.6,.76,.8,.96,1],[0,0,bcell,bcell,2*bcell,2*bcell,3*bcell,3*bcell,4*bcell,4*bcell,0],SPRING) }; }} />
    {["home","inbox","columns2","messageCircle","settings"].map((name,i) => <Glyph key={name} name={name} x={bx+6+bcell*(i+.5)-10} y={y+90} ink={s.t["muted-foreground"]} />)}
  </>;
}

function Data({ s }: { s: Scene }) {
  const width = 270;
  const count = useAnimatedProps(() => { const p = Math.min(1,(s.clock.value%4000)/2000); const value = `${(48.2*(1-Math.pow(1-p,3))).toFixed(1)}k`; return { text: value, defaultValue: value }; });
  const motion = useAnimatedStyle(() => dataPlaneStyle(s.w,s.h,0,0,timeline(s.clock.value,8000,[0,.5,1],[0,1,0],[.42,0,.58,1])));
  return <>
    {[2,1].map(depth=><MovingPanel key={depth} s={s} radius={18} draw={(time)=>{ "worklet";return dataPlaneStyle(s.w,s.h,depth,timeline(time,8000,[0,.5,1],[0,1,0],SPRING),timeline(time,8000,[0,.5,1],[0,1,0],[.42,0,.58,1]));}}/>)}
    <Animated.View pointerEvents="none" style={motion}>
      <MaterialPanel s={s} x={0} y={0} width={270} height={176} radius={18}/>
      <Svg width={width} height={176} style={{position:"absolute"}}>
        <Pane s={s} x={0} y={0} width={270} height={176} radius={18} />
        <Meta s={s} x={19} y={29}>INSTALLS · THIS WEEK</Meta>
        <Label s={s} x={19} y={106.46875} size={12} weight={500} fill={s.t.success} mono>+12.4% vs. last week</Label>
        <G transform="translate(19 123) scale(1.16 1)"><Motion as={AP} clock={s.clock} d="M0 32L20 28L40 30L60 22L80 24L100 16L120 18L140 10L160 12L180 4L200 6" fill="none" stroke={s.t.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="260" draw={(time) => { "worklet"; return {strokeDashoffset:timeline(time,4000,[0,.5,1],[260,0,0],SMOOTH)}; }} /></G>
      </Svg>
      <AI editable={false} caretHidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" underlineColorAndroid="transparent" defaultValue="0.0k" animatedProps={count} style={{position:"absolute",left:19,top:39,width:232,padding:0,margin:0,height:52,color:s.t.foreground,fontSize:46,fontFamily:s.fonts.display,fontWeight:"600",letterSpacing:-1.38,fontVariant:["tabular-nums"]} as TextStyle} />
    </Animated.View>
  </>;
}

function Charts({ s }: { s: Scene }) {
  const side = s.w > 440, inner=s.w-44, main=side?(inner-14-32)*1.6/2.6+32:inner, sx=22+main+14, sw=inner-main-14, y=22, height=s.h-44;
  const plotW=main-32,plotH=height-55.2;
  return <>
    <Pane s={s} x={22} y={y} width={main} height={height} radius={18} />
    <Meta s={s} x={38} y={49}>WEEKLY DOWNLOADS</Meta>
    <G transform={`translate(38 62) scale(${plotW/300} ${plotH/130})`}>
      {[20,55,90,125].map(yy=><Line key={yy} x1={0} x2={300} y1={yy} y2={yy} stroke={s.t.border} strokeDasharray="2 4" />)}
      <Motion as={AP} clock={s.clock} d="M0 110L30 96L60 100L90 76L120 82L150 58L180 64L210 40L240 46L270 22L300 28L300 130H0Z" fill={s.t.primary} fillOpacity={.14} rest={{ opacity: 1 }} draw={(time)=>{ "worklet";return {opacity:timeline(time,6000,[0,.3,.5,.88,.98,1],[0,0,1,1,0,0])};}} />
      <Motion as={AP} clock={s.clock} d="M0 110L30 96L60 100L90 76L120 82L150 58L180 64L210 40L240 46L270 22L300 28" fill="none" stroke={s.t.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="420" rest={{ strokeDashoffset: 420, opacity: 1 }} draw={(time)=>{ "worklet";return {strokeDashoffset:timeline(time,6000,[0,.05,.45,.88,.98,1],[420,420,0,0,0,0],SMOOTH),opacity:timeline(time,6000,[0,.88,.98,1],[1,1,0,0],SMOOTH)};}} />
      <Motion as={AC} clock={s.clock} cx={300} cy={28} fill={s.t.primary} rest={{ r: 4.5 }} draw={(time)=>{ "worklet";return {r:4.5*timeline(time,6000,[0,.44,.52,.88,.98,1],[0,0,1,1,0,0],SPRING)};}} />
    </G>
    {side&&<>
      <Defs><LinearGradient id={`${s.id}bars`} x1="0" y1="0" x2="0" y2="1"><Stop offset={0} stopColor={s.t["chart-2"]}/><Stop offset={1} stopColor={s.t["chart-2"]} stopOpacity={.3}/></LinearGradient></Defs>
      <Pane s={s} x={sx} y={y} width={sw} height={(height-14+28)/2} radius={16}/>
      {[.4,.62,.48,.8,.66,.92].map((v,i)=><Motion key={i} as={AR} clock={s.clock} x={sx+14+i*((sw-28+7)/6)} width={(sw-28-35)/6} rx={4} fill={`url(#${s.id}bars)`} rest={{ height: ((height-14+28)/2-28)*v, y: y+(height-14+28)/2-14-((height-14+28)/2-28)*v }} draw={(time)=>{ "worklet"; const h=((height-14+28)/2-28)*v*timeline(time,6000,[0,.08,.3,.88,.98,1],[0,0,1,1,0,0],SPRING,i*80); return {height:Math.max(0,h),y:y+(height-14+28)/2-14-h};}} />)}
      <Pane s={s} x={sx} y={y+(height+14+28)/2} width={sw} height={(height-14-28)/2} radius={16}/>
      <G transform={`translate(${sx+sw/2} ${y+(height+14+28)/2+(height-14-28)/4}) rotate(-90) scale(1.05)`}>
        <Circle r={30} fill="none" stroke={s.t["surface-raised"]} strokeWidth={10}/>
        <Motion as={AC} clock={s.clock} r={30} fill="none" stroke={s.t.primary} strokeWidth={10} rest={{ strokeDasharray: [0, 189] }} draw={(time)=>{ "worklet";return {strokeDasharray:[timeline(time,6000,[0,.1,.4,.88,.98,1],[0,0,96,96,0,0],SPRING),189]};}}/>
        <Motion as={AC} clock={s.clock} r={30} fill="none" stroke={s.t["chart-3"]} strokeWidth={10} strokeDashoffset={-100} rest={{ strokeDasharray: [0, 189] }} draw={(time)=>{ "worklet";return {strokeDasharray:[timeline(time,6000,[0,.2,.5,.88,.98,1],[0,0,56,56,0,0],SPRING),189]};}}/>
      </G>
    </>}
  </>;
}

function Overlays({ s }: { s: Scene }) {
  const width=Math.min(320,s.w*.82),x=(s.w-width)/2,y=(s.h-220.03125)/2;
  return <>
    <Motion as={AG} clock={s.clock} draw={(time)=>{ "worklet";const opacity=timeline(time,8000,[0,.12,.22,.6,.68,1],[0,0,1,1,0,0],SPRING),scale=timeline(time,8000,[0,.12,.22,.6,.68,1],[.97,.97,1,1,.98,.98],SPRING),dy=timeline(time,8000,[0,.12,.22,.6,.68,1],[.08,.08,0,0,.03,.03],SPRING)*220.03125;return {opacity,transform:`translate(${s.w/2} ${s.h/2+dy}) scale(${scale}) translate(${-s.w/2} ${-s.h/2})`};}}>
      <Pane s={s} x={x} y={y} width={width} height={220.03125}/>
      <Rect x={x+19} y={y+19} width={34} height={34} rx={10} fill={s.t["primary-soft"]}/><Glyph name="users" x={x+27.5} y={y+27.5} size={17} ink={s.t["primary-text"] ?? s.t.primary}/>
      <Label s={s} x={x+19} y={y+78} size={16} weight={600} display>Invite teammates</Label>
      <Label s={s} x={x+19} y={y+106.1875} size={13} fill={s.t["muted-foreground"]}>They get edit access to this board only.</Label>
      <Rect x={x+17} y={y+119.03125} width={width-34} height={40} rx={12} fill="none" stroke={s.ring} strokeWidth={4}/>
      <Rect x={x+19} y={y+121.03125} width={width-38} height={36} rx={10} fill={s.t["surface-sunken"]} stroke={s.t.primary}/>
      <Label s={s} x={x+32} y={y+144.03125} size={13}>noor@nannier.com</Label>
      <Label s={s} x={x+141.625} y={y+190.03125} size={13} weight={500} fill={s.t["muted-foreground"]}>Cancel</Label>
      <Motion as={AG} clock={s.clock} draw={(time)=>{ "worklet";const p=timeline(time,8000,[0,.52,.56,1],[1,1,.93,1],SPRING);return {transform:`translate(${x+width-67.6484375} ${y+185.03125}) scale(${p}) translate(${-x-width+67.6484375} ${-y-185.03125})`};}}>
        <Rect x={x+width-116.296875} y={y+169.03125} width={97.296875} height={32} rx={9} fill={s.t.primary}/>
        <Label s={s} x={x+width-67.6484375} y={y+190.03125} size={13} weight={500} center fill={s.t["primary-foreground"]}>Send invites</Label>
      </Motion>
    </Motion>
    <Motion as={AG} clock={s.clock} draw={(time)=>{ "worklet";return {opacity:timeline(time,8000,[0,.64,.72,.92,.98,1],[0,0,1,1,0,0],SPRING),transform:`translate(0 ${timeline(time,8000,[0,.64,.72,.92,.98,1],[24,24,0,0,8,8],SPRING)})`};}}>
      <Pane s={s} x={s.w-245} y={s.h-62} width={227} height={44} radius={14}/>
      <Glyph name="circleCheck" x={s.w-231} y={s.h-48.5} size={17} ink={s.t.success}/>
      <Label s={s} x={s.w-204} y={s.h-35} size={13} weight={500}>Invites sent</Label>
      <Label s={s} x={s.w-65} y={s.h-35} size={13} weight={600} fill={s.t["primary-text"]}>Undo</Label>
    </Motion>
  </>;
}

function Skins({ s }: { s: Scene }) {
  const native = PLATFORMS_SHOWN.length === 1;
  const nativeIndex = PLATFORMS_SHOWN[0] === "ios" ? 1 : PLATFORMS_SHOWN[0] === "android" ? 2 : 0;
  const rowY = native ? 130.4 : 160.4;
  const px = (s.w - 258) / 2;
  const value = (time: number, web: number, ios: number, android: number): number => {
    "worklet";
    if (native) return [web,ios,android][nativeIndex]!;
    return timeline(time,9000,[0,.28,.33,.61,.66,.94,1],[web,web,ios,ios,android,android,web],SPRING);
  };
  return <>
    {!native && <>
      <Motion as={AR} clock={s.clock} x={px} width={258} height={36} rx={12} fill={s.t.secondary} stroke={s.t.border} draw={time=>{ "worklet";return {y:149-(97.2+value(time,40,50,40))/2};}} />
      <Motion as={AR} clock={s.clock} width={84} height={28} rx={9} fill={s.t.card} draw={time=>{ "worklet";return {x:px+3+value(time,0,84,168),y:152-(97.2+value(time,40,50,40))/2};}} />
      {PLATFORMS_SHOWN.map((p,i)=><Motion key={p} as={AT} clock={s.clock} x={px+45+i*84} textAnchor="middle" fontFamily={s.fonts.sans} fontSize={12} fontWeight={500} fill={s.t.foreground} draw={time=>{ "worklet";return {y:171-(97.2+value(time,40,50,40))/2};}}>{PLATFORM_LABELS[p]!.label}</Motion>)}
    </>}
    <Motion as={AR} clock={s.clock} fill={s.t.primary} filter={`url(#${s.id}glow)`} draw={time=>{ "worklet";const width=value(time,150,196,168),height=value(time,40,50,40),sw=value(time,44,51,52);return {x:s.w/2-(width+22+sw)/2,y:rowY-height/2,width,height,rx:Math.min(height/2,value(time,10,999,999))};}} />
    <Motion as={AT} clock={s.clock} y={rowY+5} textAnchor="middle" fill={s.t["primary-foreground"]} fontSize={15} draw={time=>{ "worklet";const p=native?nativeIndex:timeline(time,9000,[0,.28,.33,.61,.66,.94,1],[0,0,1,1,2,2,0],SPRING);return {x:s.w/2-(22+value(time,44,51,52))/2,fontWeight:p>.5&&p<1.5?"600":"500",fontFamily:p>.5&&p<1.5?"-apple-system,system-ui,sans-serif":p>=1.5?"Roboto,system-ui,sans-serif":s.fonts.sans};}}>Continue</Motion>
    <Motion as={AR} clock={s.clock} rx={999} draw={time=>{ "worklet";const width=value(time,44,51,52),height=value(time,26,31,32),bw=value(time,150,196,168);const green=Math.max(0,Math.min(1,value(time,0,1,0)));return {x:s.w/2+(bw+22-width)/2,y:rowY-height/2,width,height,rx:height/2,fill:interpolateColor(green,[0,1],[s.t.primary,s.t.success])};}} />
    <Motion as={AC} clock={s.clock} cy={rowY} filter={`url(#${s.id}thumb)`} draw={time=>{ "worklet";const sw=value(time,44,51,52),bw=value(time,150,196,168),r=value(time,11,13.5,12),android=Math.max(0,Math.min(1,value(time,0,0,1)));return {cx:s.w/2+(bw+22+sw)/2-2-r,r,fill:interpolateColor(android,[0,1],["#fff",s.t["primary-foreground"]])};}} />
    <Motion as={AT} clock={s.clock} x={s.w/2} textAnchor="middle" fontFamily={s.fonts.mono} fontSize={11} fontWeight={500} letterSpacing={.66} fill={s.t["subtle-foreground"]} draw={time=>{ "worklet";return {y:rowY+value(time,40,50,40)/2+34.56};}}>{PLATFORM_COPY.skinsCaption.toUpperCase()}</Motion>
  </>;
}

const SCENES = { foundations:Foundations,layout:Layout,controls:Controls,inputs:Inputs,navigation:Navigation,data:Data,charts:Charts,overlays:Overlays,skins:Skins };

export function SectionVignette({ kind }: { kind: VignetteKind }) {
  const theme=useTheme(),[w,setWidth]=useState(540),id=useId().replace(/[^a-zA-Z0-9]/g,""),reduced=useReducedMotion();
  const clock=useSharedValue(reduced?2800:0),entrance=useSharedValue(reduced?1:0);
  useEffect(()=>{if(reduced){clock.value=2800;entrance.value=1;}},[reduced,clock,entrance]);
  const frame=useFrameCallback(({ timeSinceFirstFrame })=>{ "worklet";if(!reduced){const time=timeSinceFirstFrame??0;clock.value=time;entrance.value=bezier(Math.min(1,time/900),.2,.8,.2,1);} },!reduced);
  useEffect(()=>{ const sub=AppState.addEventListener("change",state=>frame.setActive(!reduced&&state==="active"));return ()=>{sub.remove();frame.setActive(false);};},[frame,reduced]);
  const entering=useAnimatedStyle(()=>({opacity:entrance.value,transform:[{translateY:14*(1-entrance.value)},{scale:.985+.015*entrance.value}]}));
  const fonts={sans:resolveFontFace(theme.fonts.sans,"400")?.fontFamily??"sans-serif",display:resolveFontFace(theme.fonts.display,"500")?.fontFamily??"sans-serif",mono:resolveFontFace(theme.fonts.mono,"500")?.fontFamily??"monospace"};
  const s:Scene={kind,clock,w,h:298,id,t:theme.tokens,dark:theme.dark,fonts,panel:theme.surface==="glass"?(theme.dark?"rgba(18,18,26,.62)":"rgba(255,255,255,.62)"):theme.tokens.popover,line:theme.dark?"rgba(255,255,255,.16)":"rgba(17,17,24,.16)",ring:alpha(theme.tokens.primary,theme.dark?.35:.28)};
  const Scene=SCENES[kind];
  return <Animated.View style={entering}>
    <VignetteStage illustration>
      <View onLayout={e=>{const width=e.nativeEvent.layout.width;if(width>0)setWidth(width);}} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{height:298,width:"100%",overflow:"hidden"}}>
        <Materials s={s}/>{kind==="data"?<Scene s={s}/>:<Svg width="100%" height={298} style={{position:"absolute",left:0,top:0}}>
          <Defs>
            <Filter id={`${id}glow`} x="-100%" y="-100%" width="300%" height="300%"><FeDropShadow dx={0} dy={3} stdDeviation={5} floodColor={theme.tokens.primary} floodOpacity={.45}/></Filter>
            <Filter id={`${id}thumb`} x="-100%" y="-100%" width="300%" height="300%"><FeDropShadow dx={0} dy={2} stdDeviation={3} floodColor="#000" floodOpacity={.35}/></Filter>
          </Defs>
          <Scene s={s}/>
        </Svg>}
      </View>
    </VignetteStage>
  </Animated.View>;
}
