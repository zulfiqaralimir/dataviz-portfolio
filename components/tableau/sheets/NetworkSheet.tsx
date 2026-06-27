"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node extends d3.SimulationNodeDatum { id:string; group:number; size:number; label:string; }
interface Link { source:string; target:string; strength:number; }

const NODES:Node[]=[
  {id:"product",group:1,size:26,label:"Product Core"},{id:"analytics",group:1,size:20,label:"Analytics"},{id:"ml",group:1,size:18,label:"ML Engine"},
  {id:"api",group:2,size:17,label:"API Layer"},{id:"db",group:2,size:15,label:"Database"},{id:"cache",group:2,size:13,label:"Cache"},
  {id:"users",group:3,size:19,label:"Users"},{id:"mobile",group:3,size:15,label:"Mobile App"},{id:"web",group:3,size:16,label:"Web App"},
  {id:"commerce",group:4,size:20,label:"Commerce"},{id:"payments",group:4,size:15,label:"Payments"},{id:"inventory",group:4,size:13,label:"Inventory"},
  {id:"reports",group:5,size:16,label:"Reports"},{id:"alerts",group:5,size:12,label:"Alerts"},{id:"exports",group:5,size:11,label:"Exports"},
];

const LINKS:Link[]=[
  {source:"product",target:"analytics",strength:0.8},{source:"product",target:"api",strength:0.9},{source:"product",target:"commerce",strength:0.7},
  {source:"analytics",target:"ml",strength:0.8},{source:"analytics",target:"reports",strength:0.7},{source:"api",target:"db",strength:0.9},
  {source:"api",target:"cache",strength:0.7},{source:"api",target:"users",strength:0.8},{source:"users",target:"mobile",strength:0.9},
  {source:"users",target:"web",strength:0.9},{source:"commerce",target:"payments",strength:0.8},{source:"commerce",target:"inventory",strength:0.7},
  {source:"ml",target:"alerts",strength:0.6},{source:"reports",target:"exports",strength:0.7},{source:"analytics",target:"alerts",strength:0.5},
  {source:"db",target:"commerce",strength:0.6},{source:"web",target:"analytics",strength:0.5},
];

const GROUP_COLORS:Record<number,string>={1:"#4E79A7",2:"#F28E2B",3:"#E15759",4:"#59A14F",5:"#B07AA1"};
const GROUP_LABELS:Record<number,string>={1:"Core Product",2:"Infrastructure",3:"Client Interfaces",4:"Commerce",5:"Reporting"};

export default function NetworkSheet({ filters }:{ filters:Record<string,string> }) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const svgEl=svgRef.current; if(!svgEl)return;
    const W=wrapRef.current?.clientWidth||700, H=420;
    const svg=d3.select(svgEl).attr("width",W).attr("height",H);
    svg.selectAll("*").remove();

    svg.append("rect").attr("width",W).attr("height",H).attr("fill","white");

    const nodeData:Node[]=NODES.map(n=>({...n}));
    const linkData:any[]=LINKS.map(l=>({...l}));

    const sim=d3.forceSimulation<Node>(nodeData)
      .force("link",d3.forceLink<Node,any>(linkData).id(d=>d.id).distance(80).strength(d=>d.strength))
      .force("charge",d3.forceManyBody().strength(-200))
      .force("center",d3.forceCenter(W/2,H/2))
      .force("collision",d3.forceCollide<Node>().radius(d=>d.size+8));

    const defs=svg.append("defs");
    Object.entries(GROUP_COLORS).forEach(([g,col])=>{
      const grd=defs.append("radialGradient").attr("id",`ng${g}`);
      grd.append("stop").attr("offset","0%").attr("stop-color",col).attr("stop-opacity",0.25);
      grd.append("stop").attr("offset","100%").attr("stop-color",col).attr("stop-opacity",0.08);
    });

    const linkG=svg.append("g");
    const linkEl=linkG.selectAll("line").data(linkData).enter().append("line")
      .attr("stroke","#D4D4D4").attr("stroke-width",(d:any)=>d.strength*2).attr("opacity",0.7);

    const nodeG=svg.append("g");
    const nodeEl=nodeG.selectAll("g").data(nodeData).enter().append("g").style("cursor","pointer")
      .call(d3.drag<SVGGElement,Node>()
        .on("start",(ev,d)=>{if(!ev.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;})
        .on("drag",(ev,d)=>{d.fx=ev.x;d.fy=ev.y;})
        .on("end",(ev,d)=>{if(!ev.active)sim.alphaTarget(0);d.fx=null;d.fy=null;})as any);

    nodeEl.append("circle").attr("r",d=>d.size+6).attr("fill",d=>`url(#ng${d.group})`);
    nodeEl.append("circle").attr("r",d=>d.size).attr("fill","white").attr("stroke",d=>GROUP_COLORS[d.group]).attr("stroke-width",1.5);
    nodeEl.append("text").attr("text-anchor","middle").attr("dy","0.35em").attr("font-size",9).attr("font-weight","600")
      .attr("fill",d=>GROUP_COLORS[d.group]).text(d=>d.label.split(" ")[0]);

    sim.on("tick",()=>{
      linkEl.attr("x1",(d:any)=>d.source.x).attr("y1",(d:any)=>d.source.y)
            .attr("x2",(d:any)=>d.target.x).attr("y2",(d:any)=>d.target.y);
      nodeEl.attr("transform",d=>`translate(${d.x},${d.y})`);
    });

    return()=>{ sim.stop(); };
  },[]);

  return(
    <div className="p-4 h-full overflow-y-auto" style={{ background:"var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color:"var(--t-text)" }}>Product Architecture — Network Graph</h2>
        <p className="text-xs mt-0.5" style={{ color:"var(--t-text-muted)" }}>{NODES.length} nodes · {LINKS.length} connections · Drag nodes to explore</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3 t-card overflow-hidden">
          <div ref={wrapRef}><svg ref={svgRef} className="w-full"/></div>
        </div>
        <div className="space-y-3">
          <div className="t-card p-3">
            <p className="text-[11px] font-semibold mb-2" style={{ color:"var(--t-text)" }}>Node Groups</p>
            {Object.entries(GROUP_COLORS).map(([g,col])=>(
              <div key={g} className="flex items-center gap-2 mb-1.5">
                <span className="w-3 h-3 rounded-full border-2" style={{ background:col+"22",borderColor:col }}/>
                <span className="text-[11px]" style={{ color:"var(--t-text-muted)" }}>{GROUP_LABELS[+g]}</span>
              </div>
            ))}
          </div>
          <div className="t-card p-3">
            <p className="text-[11px] font-semibold mb-2" style={{ color:"var(--t-text)" }}>Statistics</p>
            {[["Nodes",NODES.length],["Edges",LINKS.length],["Groups",5],["Avg Degree",((LINKS.length*2)/NODES.length).toFixed(1)]].map(([k,v])=>(
              <div key={String(k)} className="flex justify-between mb-1">
                <span className="text-[11px]" style={{ color:"var(--t-text-muted)" }}>{k}</span>
                <span className="text-[11px] font-bold" style={{ color:"var(--t-blue)" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
