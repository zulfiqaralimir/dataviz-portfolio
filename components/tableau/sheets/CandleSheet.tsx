"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Bar { date: Date; open: number; high: number; low: number; close: number; volume: number; }

function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; };
}

function generateDaily(count: number, base: number, seed: number): Bar[] {
  const rng = seededRng(seed);
  const bars: Bar[] = [];
  let price = base;
  let d = new Date(2023, 0, 2);
  for (let i = 0; i < count; i++) {
    while (d.getDay()===0||d.getDay()===6) d=new Date(d.getTime()+864e5);
    const chg=(rng()-0.485)*base*0.028; price=Math.max(price+chg,base*0.4);
    const o=price,h=price+rng()*base*0.022,l=price-rng()*base*0.018,c=l+rng()*(h-l);
    bars.push({date:new Date(d),open:+o.toFixed(2),high:+h.toFixed(2),low:+l.toFixed(2),close:+c.toFixed(2),volume:Math.floor(rng()*9e6+8e5)});
    price=c; d=new Date(d.getTime()+864e5);
  }
  return bars;
}

function toWeekly(bars:Bar[]):Bar[]{const r:Bar[]=[];for(let i=0;i<bars.length;i+=5){const c=bars.slice(i,Math.min(i+5,bars.length));r.push({date:c[0].date,open:c[0].open,close:c[c.length-1].close,high:Math.max(...c.map(b=>b.high)),low:Math.min(...c.map(b=>b.low)),volume:c.reduce((s,b)=>s+b.volume,0)});}return r;}
function toMonthly(bars:Bar[]):Bar[]{const m=new Map<string,Bar[]>();bars.forEach(b=>{const k=`${b.date.getFullYear()}-${b.date.getMonth()}`;if(!m.has(k))m.set(k,[]);m.get(k)!.push(b);});return[...m.values()].map(c=>({date:c[0].date,open:c[0].open,close:c[c.length-1].close,high:Math.max(...c.map(b=>b.high)),low:Math.min(...c.map(b=>b.low)),volume:c.reduce((s,b)=>s+b.volume,0)}));}
function calcSMA(bars:Bar[],p:number):(number|null)[]{return bars.map((_,i)=>i<p-1?null:bars.slice(i-p+1,i+1).reduce((s,b)=>s+b.close,0)/p);}

const ASSETS=[{label:"TECH Corp",base:280,seed:42},{label:"DATA Inc",base:145,seed:77},{label:"AI Systems",base:520,seed:13},{label:"FINTECH Ltd",base:95,seed:55},{label:"RETAIL Co",base:32,seed:88}];
const DAILY_DATA=ASSETS.map(a=>generateDaily(300,a.base,a.seed));

export default function CandleSheet({ filters }: { filters: Record<string,string> }) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const assetLabel = filters["Asset"]     ?? "TECH Corp";
  const tfLabel    = filters["Timeframe"] ?? "Daily (1D)";
  const overlay    = filters["Overlay"]   ?? "None";
  const oscillator = filters["Oscillator"]?? "Off";

  const assetIdx = ASSETS.findIndex(a=>a.label===assetLabel) ?? 0;
  const daily = DAILY_DATA[Math.max(0,assetIdx)];
  const bars = tfLabel==="Weekly (1W)" ? toWeekly(daily) : tfLabel==="Monthly (1M)" ? toMonthly(daily) : daily.slice(-90);
  const last = bars[bars.length-1], first = bars[0];
  const pct = (((last?.close-first?.close)/first?.close)*100).toFixed(2);
  const isUp = (last?.close??0) >= (first?.close??0);

  useEffect(()=>{
    if(!svgRef.current||!wrapRef.current||!bars.length)return;
    const W=wrapRef.current.clientWidth||700;
    const hasOsc=oscillator!=="Off";
    const mg={t:10,r:55,b:20,l:8};
    const mainH=hasOsc?220:300, volH=50, oscH=80, gap=6;
    const H=mg.t+mainH+gap+volH+(hasOsc?gap+oscH:0)+mg.b;
    const IW=W-mg.l-mg.r, n=bars.length;

    const svg=d3.select(svgRef.current).attr("width",W).attr("height",H);
    svg.selectAll("*").remove();

    const xS=d3.scaleBand().domain(bars.map((_,i)=>String(i))).range([0,IW]).padding(0.18);
    const bw=xS.bandwidth(), cx=(i:number)=>xS(String(i))!+bw/2;
    const yP=d3.scaleLinear().domain([d3.min(bars,b=>b.low)!*0.997,d3.max(bars,b=>b.high)!*1.003]).range([mainH,0]).nice();
    const yV=d3.scaleLinear().domain([0,d3.max(bars,b=>b.volume)!*1.2]).range([volH,0]);

    const root=svg.append("g").attr("transform",`translate(${mg.l},${mg.t})`);
    const mainG=root.append("g");

    mainG.append("rect").attr("width",IW).attr("height",mainH).attr("fill","white").attr("stroke","#E5E5E5").attr("stroke-width",1);

    yP.ticks(5).forEach(t=>{
      mainG.append("line").attr("x1",0).attr("x2",IW).attr("y1",yP(t)).attr("y2",yP(t)).attr("stroke","#EBEBEB").attr("stroke-width",1);
      mainG.append("text").attr("x",IW+4).attr("y",yP(t)+4).attr("fill","#999").attr("font-size",10).text(`$${t>=100?t.toFixed(0):t.toFixed(2)}`);
    });

    const li=Math.max(1,Math.floor(n/7));
    const dfmt=tfLabel==="Monthly (1M)"?d3.timeFormat("%b %Y"):d3.timeFormat("%b %d");
    bars.forEach((b,i)=>{if(i%li===0)mainG.append("text").attr("x",cx(i)).attr("y",mainH+gap+volH+mg.b-4).attr("text-anchor","middle").attr("fill","#999").attr("font-size",9).text(dfmt(b.date));});

    if(overlay!=="None"){
      const p=overlay.includes("20")?20:50;
      const smaV=calcSMA(bars,p);
      const line=d3.line<Bar>().defined((_,i)=>smaV[i]!==null).x((_,i)=>cx(i)).y((_,i)=>yP(smaV[i]!));
      mainG.append("path").datum(bars).attr("d",line as any).attr("fill","none").attr("stroke","#E15759").attr("stroke-width",1.5).attr("stroke-dasharray",overlay==="Bollinger Bands"?"none":"4,2");
    }

    bars.forEach((b,i)=>{
      const bull=b.close>=b.open, col=bull?"#59A14F":"#E15759";
      mainG.append("line").attr("x1",cx(i)).attr("x2",cx(i)).attr("y1",yP(b.high)).attr("y2",yP(b.low)).attr("stroke",col).attr("stroke-width",1);
      mainG.append("rect").attr("x",xS(String(i))!).attr("y",yP(Math.max(b.open,b.close))).attr("width",bw).attr("height",Math.max(1,Math.abs(yP(b.open)-yP(b.close)))).attr("fill",col).attr("opacity",0.9);
    });

    const volG=root.append("g").attr("transform",`translate(0,${mainH+gap})`);
    volG.append("rect").attr("width",IW).attr("height",volH).attr("fill","white").attr("stroke","#E5E5E5").attr("stroke-width",1);
    bars.forEach((b,i)=>{
      volG.append("rect").attr("x",xS(String(i))!).attr("y",yV(b.volume)).attr("width",bw).attr("height",volH-yV(b.volume)).attr("fill",b.close>=b.open?"rgba(89,161,79,0.4)":"rgba(225,87,89,0.4)");
    });

    if(hasOsc){
      const oscY=mainH+gap+volH+gap;
      const oscG=root.append("g").attr("transform",`translate(0,${oscY})`);
      oscG.append("rect").attr("width",IW).attr("height",oscH).attr("fill","white").attr("stroke","#E5E5E5").attr("stroke-width",1);
      oscG.append("text").attr("x",6).attr("y",14).attr("fill","#888").attr("font-size",9).text(oscillator);
      const yO=d3.scaleLinear().domain([0,100]).range([oscH,0]);
      [30,50,70].forEach(v=>oscG.append("line").attr("x1",0).attr("x2",IW).attr("y1",yO(v)).attr("y2",yO(v)).attr("stroke",v===50?"#EEE":"rgba(200,200,200,0.6)").attr("stroke-dasharray","3,3"));
    }
  },[bars,overlay,oscillator,tfLabel]);

  return (
    <div className="p-4 h-full overflow-y-auto" style={{ background:"var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color:"var(--t-text)" }}>OHLC Candlestick Chart</h2>
          <p className="text-xs mt-0.5" style={{ color:"var(--t-text-muted)" }}>
            {assetLabel} · {tfLabel} {overlay!=="None"?`· ${overlay}`:""} {oscillator!=="Off"?`· ${oscillator}`:""}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold" style={{ color:"var(--t-text)" }}>${last?.close.toFixed(2)}</span>
          <span className={`text-sm font-semibold ${isUp?"text-green-600":"text-red-500"}`}>{isUp?"+":""}{pct}%</span>
        </div>
      </div>

      <div ref={wrapRef} className="t-card p-3">
        <svg ref={svgRef} className="w-full"/>
      </div>

      <div className="flex gap-4 mt-2 text-[11px]" style={{ color:"var(--t-text-muted)" }}>
        {[{col:"#59A14F",lbl:"Bullish"},{col:"#E15759",lbl:"Bearish"}].map(x=>(
          <div key={x.lbl} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background:x.col,opacity:0.9 }}/>
            {x.lbl}
          </div>
        ))}
        {overlay!=="None"&&<div className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 rounded" style={{ background:"#E15759" }}/>{overlay}</div>}
      </div>
    </div>
  );
}
