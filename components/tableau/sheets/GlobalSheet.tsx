"use client";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { TrendingUp, TrendingDown } from "lucide-react";

function seededRng(s: number){let x=s>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function hashNum(id:string){let h=5381;for(let i=0;i<id.length;i++)h=((h<<5)+h+id.charCodeAt(i))>>>0;return h;}

const MAJOR:Record<string,{perf:number;label:string}>={
  "840":{perf:+2.31,label:"S&P 500"},"124":{perf:+1.18,label:"TSX"},"484":{perf:-0.74,label:"IPC"},
  "76":{perf:-1.82,label:"BOVESPA"},"826":{perf:+0.83,label:"FTSE 100"},"276":{perf:-1.22,label:"DAX"},
  "250":{perf:-0.51,label:"CAC 40"},"380":{perf:-0.88,label:"FTSE MIB"},"724":{perf:-0.63,label:"IBEX 35"},
  "528":{perf:+0.44,label:"AEX"},"756":{perf:+0.27,label:"SMI"},"643":{perf:-3.41,label:"MOEX"},
  "792":{perf:-2.18,label:"BIST 100"},"682":{perf:+1.55,label:"TASI"},"784":{perf:+1.33,label:"ADX"},
  "356":{perf:+3.12,label:"SENSEX"},"156":{perf:-2.78,label:"SSE"},"392":{perf:+1.44,label:"Nikkei 225"},
  "410":{perf:+0.91,label:"KOSPI"},"702":{perf:+1.67,label:"STI"},"036":{perf:+0.94,label:"ASX 200"},
  "710":{perf:+0.31,label:"JSE"},"404":{perf:+2.14,label:"NSE"},
};

function countryPerf(id:string):number{
  if(MAJOR[id]!==undefined)return MAJOR[id].perf;
  const r=seededRng(hashNum(id));return+((r()-0.5)*8).toFixed(2);
}

function perfColor(p:number):string{
  if(p>=3) return"#276b35";if(p>=1.5)return"#59A14F";if(p>=0.3)return"#9CC984";
  if(p>=-0.3)return"#D4D4D4";if(p>=-1.5)return"#F28E8E";if(p>=-3)return"#E15759";
  return"#9B1C1C";
}

const INDICES=[
  {name:"S&P 500",flag:"🇺🇸",val:5842, chg:+2.31,region:"Americas"},
  {name:"NASDAQ", flag:"🇺🇸",val:18420,chg:+1.85,region:"Americas"},
  {name:"FTSE 100",flag:"🇬🇧",val:8210, chg:+0.83,region:"Europe"},
  {name:"DAX",    flag:"🇩🇪",val:18650,chg:-1.22,region:"Europe"},
  {name:"Nikkei", flag:"🇯🇵",val:38420,chg:+1.44,region:"Asia"},
  {name:"SSE",    flag:"🇨🇳",val:3180, chg:-2.78,region:"Asia"},
  {name:"SENSEX", flag:"🇮🇳",val:82450,chg:+3.12,region:"Asia"},
  {name:"CAC 40", flag:"🇫🇷",val:7820, chg:-0.51,region:"Europe"},
  {name:"ASX 200",flag:"🇦🇺",val:7940, chg:+0.94,region:"Asia"},
  {name:"TSX",    flag:"🇨🇦",val:22180,chg:+1.18,region:"Americas"},
  {name:"BOVESPA",flag:"🇧🇷",val:128500,chg:-1.82,region:"Americas"},
  {name:"TASI",   flag:"🇸🇦",val:11280,chg:+1.55,region:"MENA"},
];

export default function GlobalSheet({ filters }:{ filters:Record<string,string> }) {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered,setHovered]=useState<{name:string;id:string;perf:number;x:number;y:number}|null>(null);

  const regionFilter = filters["Region"]??"All";
  const sentFilter   = filters["Sentiment"]??"All";

  const filtered = INDICES.filter(idx=>{
    if(regionFilter!=="All"&&idx.region!==regionFilter)return false;
    if(sentFilter==="Bullish Only"&&idx.chg<0)return false;
    if(sentFilter==="Bearish Only"&&idx.chg>=0)return false;
    return true;
  });

  useEffect(()=>{
    const svg=d3.select(svgRef.current);
    const wrap=wrapRef.current;
    if(!svg||!wrap)return;
    const W=wrap.clientWidth||700,H=Math.round(W*0.46);
    svg.attr("width",W).attr("height",H);
    svg.selectAll("*").remove();

    const proj=d3.geoNaturalEarth1().scale(W/6.1).translate([W/2,H/2]);
    const path=d3.geoPath().projection(proj);
    svg.append("rect").attr("width",W).attr("height",H).attr("fill","#F8F8F8");
    const graticule=d3.geoGraticule()();
    svg.append("path").datum(graticule).attr("d",path as any).attr("fill","none").attr("stroke","rgba(0,0,0,0.04)").attr("stroke-width",0.5);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((world:any)=>{
      const countries=topojson.feature(world,world.objects.countries) as any;
      const mesh=topojson.mesh(world,world.objects.countries,(a:any,b:any)=>a!==b) as any;

      svg.append("g").selectAll("path").data(countries.features).enter().append("path")
        .attr("d",path as any)
        .attr("fill",(d:any)=>perfColor(countryPerf(String(d.id))))
        .attr("opacity",0.9)
        .style("cursor","pointer")
        .on("mousemove",function(event:MouseEvent,d:any){
          const id=String(d.id);
          const[mx,my]=d3.pointer(event,wrap);
          setHovered({name:d.properties?.name??id,id,perf:countryPerf(id),x:mx,y:my});
        })
        .on("mouseleave",()=>setHovered(null));

      svg.append("path").datum(mesh).attr("d",path as any).attr("fill","none").attr("stroke","rgba(255,255,255,0.6)").attr("stroke-width",0.4);
    }).catch(()=>{});
  },[]);

  const bull=filtered.filter(i=>i.chg>0).length;
  const bear=filtered.filter(i=>i.chg<0).length;

  return(
    <div className="p-4 h-full overflow-y-auto" style={{ background:"var(--t-canvas)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color:"var(--t-text)" }}>Global Bull &amp; Bear Market Heatmap</h2>
          <p className="text-xs mt-0.5" style={{ color:"var(--t-text-muted)" }}>
            {regionFilter} · {sentFilter} · <span className="text-green-600 font-medium">{bull} bullish</span> · <span className="text-red-500 font-medium">{bear} bearish</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 t-card overflow-hidden relative">
          <div ref={wrapRef} className="relative">
            <svg ref={svgRef} className="w-full"/>
            {hovered&&(
              <div className="absolute pointer-events-none bg-white border rounded shadow-lg p-2.5 text-xs z-10"
                style={{ left:Math.min(hovered.x+10,(wrapRef.current?.clientWidth??600)-150),top:Math.max(4,hovered.y-60),borderColor:"var(--t-border)" }}>
                <p className="font-semibold mb-1" style={{ color:"var(--t-text)" }}>{hovered.name}</p>
                <p className={`text-base font-bold ${hovered.perf>=0?"text-green-600":"text-red-500"}`}>
                  {hovered.perf>=0?"+":""}{hovered.perf.toFixed(2)}%
                </p>
                {MAJOR[hovered.id]&&<p className="text-[10px] mt-1" style={{ color:"var(--t-text-muted)" }}>{MAJOR[hovered.id].label}</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 px-4 py-2 border-t" style={{ borderColor:"var(--t-border-lt)" }}>
            <span className="text-[10px]" style={{ color:"var(--t-text-muted)" }}>Bearish</span>
            {["#9B1C1C","#E15759","#F28E8E","#D4D4D4","#9CC984","#59A14F","#276b35"].map(c=>(
              <div key={c} className="flex-1 h-2.5 rounded-sm" style={{ background:c }}/>
            ))}
            <span className="text-[10px]" style={{ color:"var(--t-text-muted)" }}>Bullish</span>
          </div>
        </div>

        <div className="t-card overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b text-xs font-semibold" style={{ borderColor:"var(--t-border-lt)", color:"var(--t-text)" }}>
            Global Indices
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(idx=>{
              const up=idx.chg>=0;
              return(
                <div key={idx.name} className="flex items-center gap-2 px-3 py-2 border-b hover:bg-gray-50 transition-colors"
                  style={{ borderColor:"var(--t-border-lt)" }}>
                  <span className="text-sm">{idx.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate" style={{ color:"var(--t-text)" }}>{idx.name}</p>
                    <p className="text-[10px]" style={{ color:"var(--t-text-muted)" }}>{idx.val.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {up?<TrendingUp className="w-3 h-3 text-green-600"/>:<TrendingDown className="w-3 h-3 text-red-500"/>}
                    <span className={`text-[11px] font-bold tabular-nums ${up?"text-green-600":"text-red-500"}`}>
                      {up?"+":""}{idx.chg.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
