import { expect, it } from "bun:test";
import { dataPlaneStyle } from "../docs/src/ui/showcase/section-vignette-geometry";
function matrixOf(ops: any[]): number[][] {
  const identity = () => [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  const multiply = (a: number[][], b: number[][]) => a.map((row) => b[0]!.map((_, j) => row.reduce((sum, value, k) => sum + value * b[k]![j]!, 0)));
  return ops.reduce((acc, op) => {
    const m = identity();
    const [key, value] = Object.entries(op)[0] as [string, number | string];
    if (key === "translateX") m[0]![3] = value as number;
    else if (key === "translateY") m[1]![3] = value as number;
    else if (key === "scale") { m[0]![0] = value as number; m[1]![1] = value as number; }
    else if (key === "perspective") m[3]![2] = -1 / (value as number);
    else {
      const a = (parseFloat(value as string) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      if (key === "rotateX") { m[1]![1] = c; m[1]![2] = -s; m[2]![1] = s; m[2]![2] = c; }
      if (key === "rotateY") { m[0]![0] = c; m[0]![2] = s; m[2]![0] = -s; m[2]![2] = c; }
      if (key === "rotateZ") { m[0]![0] = c; m[0]![1] = -s; m[1]![0] = s; m[1]![1] = c; }
    }
    return multiply(acc, m);
  }, identity());
}

it("projects every animated section Data plane as CSS preserve-3d, including negative depth and spring overshoot", () => {
let maximum=0,checks=0;
for(const w of [340,560,674])for(const depth of [0,1,2])for(const p of [0,.4,1,1.08])for(const t of [0,.5,1]) {
 const st=dataPlaneStyle(w,298,depth,p,t);const m=matrixOf(st.transform as any[]);
 const rx=(16-8*t)*Math.PI/180,ry=(-20+12*t)*Math.PI/180,rz=(3-3*t)*Math.PI/180;
 const dx=depth*14*(1+p),dy=-depth*(14+10*p),z=-depth*(30+15*p);
 for(const [x,y] of [[0,0],[270,0],[0,176],[270,176]]) {
   const q=[x,y,0,1];const [px,py,,pw]=m.map(row=>row.reduce((a,v,i)=>a+v*q[i]!,0));
   const xx=x-135+dx,yy=y-88+dy;
   const x1=Math.cos(rz)*xx-Math.sin(rz)*yy,y1=Math.sin(rz)*xx+Math.cos(rz)*yy;
   const x2=Math.cos(ry)*x1+Math.sin(ry)*z,z2=-Math.sin(ry)*x1+Math.cos(ry)*z;
   const yr=Math.cos(rx)*y1-Math.sin(rx)*z2,zr=Math.sin(rx)*y1+Math.cos(rx)*z2;
   const expected=[w/2+x2/(1-zr/900),149+yr/(1-zr/900)];
   maximum=Math.max(maximum,Math.abs((st.left as number)+px!/pw!-expected[0]!),Math.abs((st.top as number)+py!/pw!-expected[1]!));checks++;
 }
}
expect(checks).toBe(432);
expect(maximum).toBeLessThan(1e-8);
});
