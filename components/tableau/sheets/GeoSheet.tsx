"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const REGIONS=[
  {name:"North America",value:42,revenue:"$3.2M",growth:"+18%",color:"#4E79A7",coords:[-100,45] as [number,number]},
  {name:"Europe",       value:31,revenue:"$2.4M",growth:"+12%",color:"#F28E2B",coords:[15,52]   as [number,number]},
  {name:"Asia Pacific", value:18,revenue:"$1.4M",growth:"+34%",color:"#E15759",coords:[115,30]  as [number,number]},
  {name:"Latin America",value:6, revenue:"$460K", growth:"+22%",color:"#76B7B2",coords:[-65,-15] as [number,number]},
  {name:"Middle East",  value:3, revenue:"$230K", growth:"+41%",color:"#59A14F",coords:[45,25]   as [number,number]},
];

const CITIES=[
  {name:"New York",  coords:[-74.0,40.7] as [number,number]},
  {name:"London",    coords:[-0.12,51.5] as [number,number]},
  {name:"Tokyo",     coords:[139.7,35.7] as [number,number]},
  {name:"Singapore", coords:[103.8,1.35] as [number,number]},
  {name:"São Paulo", coords:[-46.6,-23.6]as [number,number]},
  {name:"Dubai",     coords:[55.27,25.2] as [number,number]},
  {name:"Sydney",    coords:[151.2,-33.9]as [number,number]},
  {name:"Mumbai",    coords:[72.88,19.1] as [number,number]},
  {name:"Toronto",   coords:[-79.4,43.7] as [number,number]},
];

export default function GeoSheet({ filters }:{ filters:Record<string,string> }) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const svg=d3.select(svgRef.current);
    const wrap=wrapRef.current;
    if(!svg||!wrap)return;
    const W=wrap.clientWidth||700,H=Math.round(W*0.44);
    svg.attr("width",W).attr("height",H);
    svg.selectAll("*").remove();

    const proj=d3.geoNaturalEarth1().scale(W/6.2).translate([W/2,H/2]);
    const path=d3.geoPath().projection(proj);
    svg.append("rect").attr("width",W).attr("height",H).attr("fill","#F0F4FA");
    const graticule=d3.geoGraticule()();
    svg.append("path").datum(graticule).attr("d",path as any).attr("fill","none").attr("stroke","rgba(0,0,0,0.05)").attr("stroke-width",0.5);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world:any)=>{
      const countries=topojson.feature(world,world.objects.countries) as any;
      const mesh=topojson.mesh(world,world.objects.countries,(a:any,b:any)=>a!==b) as any;
      svg.append("g").selectAll("path").data(countries.features).enter().append("path")
        .attr("d",path as any).attr("fill","#C8D8E8").attr("opacity",0.7);
      svg.append("path").datum(mesh).attr("d",path as any).attr("fill","none").attr("stroke","white").attr("stroke-width",0.4);

      REGIONS.forEach(r=>{
        const pt=proj(r.coords);
        if(!pt)return;
        const[px,py]=pt;
        const radius=Math.sqrt(r.value)*5;
        svg.append("circle").attr("cx",px).attr("cy",py).attr("r",radius)
          .attr("fill",r.color).attr("opacity",0.35).attr("stroke",r.color).attr("stroke-width",1.5);
        svg.append("circle").attr("cx",px).attr("cy",py).attr("r",4).attr("fill",r.color).attr("opacity",0.9);
        svg.append("text").attr("x",px+radius+3).attr("y",py+4).attr("fill","#333").attr("font-size",9).attr("font-weight","600").text(`${r.value}%`);
      });

      CITIES.forEach(c=>{
        const pt=proj(c.coords);if(!pt)return;
        const[px,py]=pt;
        svg.append("circle").attr("cx",px).attr("cy",py).attr("r",3).attr("fill","#4E79A7").attr("opacity",0.8).attr("stroke","white").attr("stroke-width",0.8);
        svg.append("text").attr("x",px+5).attr("y",py+3).attr("fill","#555").attr("font-size",8).text(c.name);
      });
    }).catch(()=>{});
  },[]);

  return(
    <div className="p-4 h-full overflow-y-auto" style={{ background:"var(--t-canvas)" }}>
      <div className="mb-4">
        <h2 className="text-base font-semibold" style={{ color:"var(--t-text)" }}>Geographic Revenue Distribution</h2>
        <p className="text-xs mt-0.5" style={{ color:"var(--t-text-muted)" }}>Bubble size = revenue share · Metric: {filters["Metric"]??"Revenue"}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 t-card overflow-hidden">
          <div ref={wrapRef}><svg ref={svgRef} className="w-full"/></div>
        </div>
        <div className="t-card p-4">
          <p className="text-xs font-semibold mb-3" style={{ color:"var(--t-text)" }}>Region Breakdown</p>
          <div className="space-y-3">
            {REGIONS.map(r=>(
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium" style={{ color:"var(--t-text)" }}>{r.name}</span>
                  <span className="text-[11px] font-bold text-green-600">{r.growth}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"var(--t-border-lt)" }}>
                    <div className="h-full rounded-full" style={{ width:`${r.value}%`,background:r.color }}/>
                  </div>
                  <span className="text-[11px] tabular-nums" style={{ color:"var(--t-text-muted)", minWidth:32 }}>{r.value}%</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color:"var(--t-text-muted)" }}>{r.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
