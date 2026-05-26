import { useState } from "react";
import {
  Download, Calendar, ChevronDown, TrendingUp, TrendingDown,
  Truck, AlertTriangle, Zap, BarChart2, CheckCircle2, XCircle,
  RotateCcw, Clock, MapPin, Trophy, Medal, Star, ArrowUpDown,
  Info, Lightbulb, Brain, Timer, Navigation, Activity,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Cell,
} from "recharts";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const COURIER_META = {
  Leopards: { color:"#f59e0b", ring:"ring-amber-400/30",  badge:"bg-amber-400/10 text-amber-400 border-amber-400/20"   },
  TCS:      { color:"#22d3ee", ring:"ring-cyan-400/30",   badge:"bg-cyan-400/10 text-cyan-400 border-cyan-400/20"      },
  Trax:     { color:"#a78bfa", ring:"ring-violet-400/30", badge:"bg-violet-400/10 text-violet-400 border-violet-400/20"},
  "M&P":    { color:"#34d399", ring:"ring-emerald-400/30",badge:"bg-emerald-400/10 text-emerald-400 border-emerald-400/20"},
  PostEx:   { color:"#60a5fa", ring:"ring-blue-400/30",   badge:"bg-blue-400/10 text-blue-400 border-blue-400/20"      },
};

const COURIER_STATS = [
  { name:"TCS",      rank:1, successRate:91, avgDays:2.1, returnPct:4,  failPct:5,  codSuccess:88, delayPct:8,  escFreq:3,  score:91, cost:"Rs 180/kg" },
  { name:"M&P",      rank:2, successRate:85, avgDays:2.5, returnPct:5,  failPct:6,  codSuccess:92, delayPct:12, escFreq:5,  score:79, cost:"Rs 150/kg" },
  { name:"PostEx",   rank:3, successRate:80, avgDays:2.9, returnPct:6,  failPct:8,  codSuccess:79, delayPct:15, escFreq:6,  score:73, cost:"Rs 140/kg" },
  { name:"Leopards", rank:4, successRate:74, avgDays:2.8, returnPct:5,  failPct:7,  codSuccess:71, delayPct:18, escFreq:9,  score:68, cost:"Rs 160/kg" },
  { name:"Trax",     rank:5, successRate:62, avgDays:3.2, returnPct:7,  failPct:9,  codSuccess:65, delayPct:22, escFreq:12, score:54, cost:"Rs 130/kg" },
];

const DELIVERY_TREND = [
  { week:"W1", TCS:2.0, Leopards:2.6, Trax:3.0, MandP:2.3, PostEx:2.8 },
  { week:"W2", TCS:2.2, Leopards:2.7, Trax:3.1, MandP:2.4, PostEx:2.9 },
  { week:"W3", TCS:2.0, Leopards:2.9, Trax:3.3, MandP:2.5, PostEx:3.0 },
  { week:"W4", TCS:2.1, Leopards:2.8, Trax:3.2, MandP:2.5, PostEx:2.9 },
];

const FAIL_TREND = [
  { week:"W1", TCS:4,  Leopards:6,  Trax:8,  MandP:5,  PostEx:7  },
  { week:"W2", TCS:5,  Leopards:7,  Trax:9,  MandP:6,  PostEx:8  },
  { week:"W3", TCS:5,  Leopards:7,  Trax:11, MandP:6,  PostEx:8  },
  { week:"W4", TCS:5,  Leopards:7,  Trax:9,  MandP:6,  PostEx:8  },
];

const COMPARISON_BAR = [
  { metric:"Success %",  TCS:91, Leopards:74, Trax:62, MandP:85, PostEx:80 },
  { metric:"COD %",      TCS:88, Leopards:71, Trax:65, MandP:92, PostEx:79 },
  { metric:"Score",      TCS:91, Leopards:68, Trax:54, MandP:79, PostEx:73 },
];

const REGIONAL_DATA = [
  { city:"Karachi",    TCS:88, Leopards:62, Trax:55, MandP:80, PostEx:75, volume:142 },
  { city:"Lahore",     TCS:93, Leopards:79, Trax:68, MandP:88, PostEx:82, volume:118 },
  { city:"Islamabad",  TCS:91, Leopards:82, Trax:72, MandP:85, PostEx:80, volume:76  },
  { city:"Rawalpindi", TCS:89, Leopards:75, Trax:64, MandP:83, PostEx:77, volume:54  },
  { city:"Faisalabad", TCS:85, Leopards:70, Trax:60, MandP:80, PostEx:74, volume:48  },
  { city:"Peshawar",   TCS:78, Leopards:65, Trax:50, MandP:72, PostEx:68, volume:36  },
  { city:"Quetta",     TCS:72, Leopards:60, Trax:44, MandP:70, PostEx:62, volume:22  },
  { city:"Multan",     TCS:84, Leopards:72, Trax:58, MandP:82, PostEx:72, volume:30  },
];

const SLA_DATA = [
  { courier:"TCS",      avgPickup:"4.2h",  pickupSLA:"94%",  deliverySLA:"91%", delayPct:"8%",  resolution:"6.1h" },
  { courier:"M&P",      avgPickup:"5.1h",  pickupSLA:"88%",  deliverySLA:"85%", delayPct:"12%", resolution:"8.4h" },
  { courier:"PostEx",   avgPickup:"5.8h",  pickupSLA:"83%",  deliverySLA:"80%", delayPct:"15%", resolution:"9.2h" },
  { courier:"Leopards", avgPickup:"6.4h",  pickupSLA:"79%",  deliverySLA:"74%", delayPct:"18%", resolution:"11.3h"},
  { courier:"Trax",     avgPickup:"8.1h",  pickupSLA:"68%",  deliverySLA:"62%", delayPct:"22%", resolution:"14.7h"},
];

const BOTTLENECKS = [
  { severity:"critical", title:"Trax Returns Up 18% This Month",  desc:"Pattern linked to Lahore and Peshawar routes. Quality dispute suspected.",       action:"Review Trax assignment for fragile items" },
  { severity:"critical", title:"M&P Has Highest COD Success (92%)",desc:"M&P consistently outperforms on COD. Recommend priority for COD orders.",         action:"Increase M&P allocation for COD shipments" },
  { severity:"warning",  title:"Leopards Delay Spike in Karachi",  desc:"Delivery times up 35% in last 2 weeks. Driver allocation issue in Defence area.", action:"Escalate to Leopards ops team"             },
  { severity:"info",     title:"TCS Best Performer Lahore Routes", desc:"91%+ success rate maintained for 4 consecutive weeks in Lahore.",                  action:"Prioritize TCS for Lahore orders"          },
  { severity:"warning",  title:"Trax Pickup SLA at 68%",          desc:"Well below 80% benchmark. Consistent delays in pickup scheduling.",                 action:"Shift to TCS/M&P for urgent shipments"    },
];

const AI_INSIGHTS = [
  { icon:Lightbulb, text:'Use TCS for Lahore & Islamabad shipments — 91%+ delivery success 4 weeks running.' },
  { icon:AlertTriangle,text:'Avoid Trax for fragile or high-value items — return rate at 7%, highest in network.' },
  { icon:Star,       text:'M&P is the best COD courier — 92% acceptance rate significantly above average.' },
  { icon:Zap,        text:'Leopards performs best for same-city Karachi orders under 2kg. Decline for intercity.' },
];

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d2e] border border-white/[0.10] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] font-bold text-slate-400 mb-2">{label}</p>
      {payload.map(p=>(
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor:p.color||p.fill}}/>
          <span className="text-slate-400">{p.dataKey}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function CourierPill({ name }) {
  const m = COURIER_META[name]||{badge:"bg-slate-400/10 text-slate-400 border-slate-400/20"};
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${m.badge}`}>{name}</span>;
}

function SLAPct({ value }) {
  const n = parseFloat(value);
  const color = n>=90?"text-emerald-400":n>=80?"text-amber-400":"text-red-400";
  return <span className={`text-xs font-semibold ${color}`}>{value}</span>;
}

function RankMedal({ rank }) {
  if(rank===1) return <Trophy size={14} className="text-amber-400"/>;
  if(rank===2) return <Medal  size={14} className="text-slate-400"/>;
  if(rank===3) return <Medal  size={14} className="text-orange-600"/>;
  return <span className="text-xs font-bold text-slate-600">#{rank}</span>;
}

function ScoreBar({ score }) {
  const bar = score>=80?"bg-emerald-400":score>=60?"bg-amber-400":"bg-red-400";
  const txt  = score>=80?"text-emerald-400":score>=60?"text-amber-400":"text-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{width:`${score}%`}}/>
      </div>
      <span className={`text-xs font-black w-6 ${txt}`}>{score}</span>
    </div>
  );
}

function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)} className="appearance-none pl-3 pr-7 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.07] focus:outline-none focus:border-amber-400/40 cursor-pointer transition-colors">
        <option value="">{label}</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COURIER COMPARISON CARDS
// ─────────────────────────────────────────────────────────────
function ComparisonCard({ courier }) {
  const m = COURIER_META[courier.name]||{color:"#94a3b8"};
  const score = courier.score;
  const grade = score>=85?"A":score>=75?"B":score>=65?"C":"D";
  const gradeColor = score>=85?"text-emerald-400":score>=75?"text-blue-400":score>=65?"text-amber-400":"text-red-400";
  const borderColor = courier.rank===1?"border-amber-400/30":"border-white/[0.06]";

  return (
    <div className={`bg-[#13151f] border ${borderColor} rounded-2xl p-5 relative overflow-hidden hover:border-white/10 transition-colors`}>
      {courier.rank===1 && <div className="absolute top-0 right-0 w-16 h-16 opacity-10" style={{background:`radial-gradient(circle, ${m.color}, transparent)`}}/>}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center ring-2" style={{backgroundColor:`${m.color}18`,ringColor:m.color}}>
            <Truck size={16} style={{color:m.color}}/>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>{courier.name}</p>
              <RankMedal rank={courier.rank}/>
            </div>
            <p className="text-[10px] text-slate-600">{courier.cost}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${gradeColor}`} style={{fontFamily:"'Syne', sans-serif"}}>{grade}</p>
          <p className="text-[10px] text-slate-600">Grade</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-4">
        {[
          {label:"Success Rate", value:`${courier.successRate}%`, good:courier.successRate>=85},
          {label:"Avg Delivery",  value:`${courier.avgDays}d`,    good:courier.avgDays<=2.5},
          {label:"Return Rate",   value:`${courier.returnPct}%`,  good:courier.returnPct<=5},
          {label:"Fail Rate",     value:`${courier.failPct}%`,    good:courier.failPct<=6},
          {label:"COD Success",   value:`${courier.codSuccess}%`, good:courier.codSuccess>=85},
          {label:"Delay Rate",    value:`${courier.delayPct}%`,   good:courier.delayPct<=12},
        ].map(({label,value,good})=>(
          <div key={label}>
            <p className="text-[10px] text-slate-600 mb-0.5">{label}</p>
            <p className={`text-xs font-bold ${good?"text-emerald-400":"text-red-400"}`}>{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Performance Score</p>
        </div>
        <ScoreBar score={courier.score}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PERFORMANCE CHARTS
// ─────────────────────────────────────────────────────────────
function PerformanceCharts() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
      {/* Delivery Time Trend */}
      <div className="xl:col-span-2 bg-[#13151f] border border-white/[0.06] rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Delivery Time Trend</h3>
          <p className="text-[11px] text-slate-500">Avg days to deliver — 4-week comparison</p>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(COURIER_META).map(([name,m])=>(
            <div key={name} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:m.color}}/><span className="text-[10px] text-slate-500">{name}</span></div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={DELIVERY_TREND} margin={{top:0,right:0,left:-20,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="week" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false} domain={[1.5,3.5]}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Line type="monotone" dataKey="TCS"      stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{r:4}}/>
            <Line type="monotone" dataKey="Leopards" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{r:4}}/>
            <Line type="monotone" dataKey="Trax"     stroke="#a78bfa" strokeWidth={2} dot={false} activeDot={{r:4}}/>
            <Line type="monotone" dataKey="MandP"    stroke="#34d399" strokeWidth={2} dot={false} activeDot={{r:4}}/>
            <Line type="monotone" dataKey="PostEx"   stroke="#60a5fa" strokeWidth={2} dot={false} activeDot={{r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Bar */}
      <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>KPI Comparison</h3>
          <p className="text-[11px] text-slate-500">Success, COD & overall score</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={COMPARISON_BAR} layout="vertical" margin={{top:0,right:0,left:10,bottom:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
            <XAxis type="number" tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false} domain={[0,100]}/>
            <YAxis type="category" dataKey="metric" tick={{fill:"#475569",fontSize:9}} axisLine={false} tickLine={false} width={55}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="TCS"      fill="#22d3ee" radius={[0,3,3,0]}/>
            <Bar dataKey="MandP"    fill="#34d399" radius={[0,3,3,0]}/>
            <Bar dataKey="PostEx"   fill="#60a5fa" radius={[0,3,3,0]}/>
            <Bar dataKey="Leopards" fill="#f59e0b" radius={[0,3,3,0]}/>
            <Bar dataKey="Trax"     fill="#a78bfa" radius={[0,3,3,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REGIONAL PERFORMANCE TABLE
// ─────────────────────────────────────────────────────────────
function RegionalPerformance() {
  const [sortCourier,setSortCourier] = useState("TCS");
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Regional Performance</h3>
          <p className="text-[11px] text-slate-500">Delivery success % by city across couriers</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(COURIER_META).map(([name,m])=>(
            <div key={name} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:m.color}}/><span className="text-[10px] text-slate-500">{name}</span></div>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">City</th>
              <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Volume</th>
              {Object.keys(COURIER_META).map(name=>(
                <th key={name} className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider" style={{color:COURIER_META[name].color}}>{name}</th>
              ))}
              <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Best</th>
            </tr>
          </thead>
          <tbody>
            {REGIONAL_DATA.map(row=>{
              const scores = {Leopards:row.Leopards,TCS:row.TCS,Trax:row.Trax,"M&P":row.MandP,PostEx:row.PostEx};
              const best = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0];
              const worst = Object.entries(scores).sort((a,b)=>a[1]-b[1])[0][0];
              return (
                <tr key={row.city} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"><MapPin size={11} className="text-slate-600"/>{row.city}</span>
                  </td>
                  <td className="px-4 py-3 text-center"><span className="text-xs text-slate-500">{row.volume}</span></td>
                  {[row.TCS, row.Leopards, row.Trax, row.MandP, row.PostEx].map((val,i)=>{
                    const courierName = ["TCS","Leopards","Trax","M&P","PostEx"][i];
                    const isBest  = courierName===best;
                    const isWorst = courierName===worst;
                    return (
                      <td key={i} className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold ${isBest?"text-emerald-400":isWorst?"text-red-400/70":"text-slate-400"}`}>{val}%</span>
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center"><CourierPill name={best}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SLA TABLE
// ─────────────────────────────────────────────────────────────
function SLATable() {
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>SLA & Efficiency Monitor</h3>
        <p className="text-[11px] text-slate-500">Pickup time, delivery SLA compliance, resolution speed</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Courier","Avg Pickup","Pickup SLA","Delivery SLA","Delay Rate","Resolution"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLA_DATA.map((row,i)=>(
              <tr key={row.courier} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:COURIER_META[row.courier]?.color||"#94a3b8"}}/>
                    <span className="text-xs font-semibold text-slate-200">{row.courier}</span>
                    {i===0&&<span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[9px] font-bold border border-amber-400/20">TOP</span>}
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold ${parseFloat(row.avgPickup)<=5?"text-emerald-400":parseFloat(row.avgPickup)<=7?"text-amber-400":"text-red-400"}`}>{row.avgPickup}</span></td>
                <td className="px-4 py-3"><SLAPct value={row.pickupSLA}/></td>
                <td className="px-4 py-3"><SLAPct value={row.deliverySLA}/></td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold ${parseFloat(row.delayPct)<=10?"text-emerald-400":parseFloat(row.delayPct)<=18?"text-amber-400":"text-red-400"}`}>{row.delayPct}</span></td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold ${parseFloat(row.resolution)<=7?"text-emerald-400":parseFloat(row.resolution)<=10?"text-amber-400":"text-red-400"}`}>{row.resolution}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COURIER RANKING TABLE
// ─────────────────────────────────────────────────────────────
function CourierRankingTable() {
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Courier Rankings</h3>
        <p className="text-[11px] text-slate-500">Operational performance ranking — current period</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Rank","Courier","Success Rate","Avg Days","Return %","Delay %","COD %","Score"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COURIER_STATS.map((c,i)=>(
              <tr key={c.name} className={`border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors ${c.rank===1?"bg-amber-400/[0.02]":""}`}>
                <td className="px-4 py-3.5 w-12"><div className="flex items-center justify-center w-7 h-7"><RankMedal rank={c.rank}/></div></td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor:COURIER_META[c.name]?.color||"#94a3b8"}}/>
                    <span className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5"><span className={`text-xs font-bold ${c.successRate>=85?"text-emerald-400":c.successRate>=75?"text-amber-400":"text-red-400"}`}>{c.successRate}%</span></td>
                <td className="px-4 py-3.5"><span className={`text-xs font-bold ${c.avgDays<=2.3?"text-emerald-400":c.avgDays<=2.8?"text-amber-400":"text-red-400"}`}>{c.avgDays}d</span></td>
                <td className="px-4 py-3.5"><span className={`text-xs font-bold ${c.returnPct<=5?"text-emerald-400":c.returnPct<=6?"text-amber-400":"text-red-400"}`}>{c.returnPct}%</span></td>
                <td className="px-4 py-3.5"><span className={`text-xs font-bold ${c.delayPct<=12?"text-emerald-400":c.delayPct<=18?"text-amber-400":"text-red-400"}`}>{c.delayPct}%</span></td>
                <td className="px-4 py-3.5"><span className={`text-xs font-bold ${c.codSuccess>=85?"text-emerald-400":c.codSuccess>=75?"text-amber-400":"text-red-400"}`}>{c.codSuccess}%</span></td>
                <td className="px-4 py-3.5 w-32"><ScoreBar score={c.score}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTTLENECK ANALYSIS
// ─────────────────────────────────────────────────────────────
function BottleneckAnalysis() {
  const sMap = {
    critical:{ border:"border-red-400/25",   bg:"bg-red-400/5",    icon:<AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5"/>,    tag:"bg-red-400/10 text-red-400 border-red-400/20",    tagLabel:"Critical" },
    warning: { border:"border-amber-400/20", bg:"bg-amber-400/5",  icon:<AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5"/>,  tag:"bg-amber-400/10 text-amber-400 border-amber-400/20",tagLabel:"Warning"  },
    info:    { border:"border-blue-400/15",  bg:"bg-blue-400/5",   icon:<Zap size={13} className="text-blue-400 flex-shrink-0 mt-0.5"/>,             tag:"bg-blue-400/10 text-blue-400 border-blue-400/20",  tagLabel:"Insight"  },
  };
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Bottleneck Analysis</h3>
          <p className="text-[11px] text-slate-500">System-detected operational inefficiencies & opportunities</p>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {BOTTLENECKS.map((b,i)=>{
          const s = sMap[b.severity];
          return (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${s.border} ${s.bg}`}>
              {s.icon}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-200">{b.title}</p>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${s.tag}`}>{s.tagLabel}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{b.desc}</p>
                <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1"><Zap size={10} className="text-amber-400"/>{b.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI INSIGHTS
// ─────────────────────────────────────────────────────────────
function AIInsightsPanel() {
  return (
    <div className="bg-gradient-to-br from-[#13151f] to-[#0f1120] border border-violet-400/15 rounded-2xl overflow-hidden mb-5">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <Brain size={13} className="text-violet-400"/>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>AI Routing Recommendations</h3>
          <p className="text-[10px] text-slate-500">Intelligence engine — based on 30-day operational data</p>
        </div>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-violet-400/10 border border-violet-400/20 text-[10px] text-violet-400 font-semibold">Beta</span>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {AI_INSIGHTS.map((ins,i)=>(
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-violet-400/15 transition-colors">
            <ins.icon size={13} className="text-violet-400 flex-shrink-0 mt-0.5"/>
            <p className="text-xs text-slate-400 leading-relaxed">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CourierPerformance() {
  const [filters,setFilters] = useState({courier:"",city:"",payment:"",type:""});

  return (
    <div className="min-h-full p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Courier Performance</h1>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">Analytics</span>
          </div>
          <p className="text-sm text-slate-500">Courier intelligence & optimization — efficiency trends, SLA compliance, regional insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.04] transition-colors"><Calendar size={12}/>Date Range</button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"><Download size={12}/>Export Report</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap mb-5 p-3 bg-[#13151f] border border-white/[0.06] rounded-2xl">
        <FilterSelect label="All Couriers" options={Object.keys(COURIER_META)} value={filters.courier} onChange={v=>setFilters(f=>({...f,courier:v}))}/>
        <FilterSelect label="All Cities"   options={REGIONAL_DATA.map(r=>r.city)}                    value={filters.city}    onChange={v=>setFilters(f=>({...f,city:v}))}/>
        <FilterSelect label="Payment Type" options={["COD","Prepaid"]}                                value={filters.payment} onChange={v=>setFilters(f=>({...f,payment:v}))}/>
        <FilterSelect label="Shipment Type"options={["Standard","Express","Fragile"]}                 value={filters.type}    onChange={v=>setFilters(f=>({...f,type:v}))}/>
        {Object.values(filters).some(Boolean)&&<button onClick={()=>setFilters({courier:"",city:"",payment:"",type:""})} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-400/5 border border-red-400/20 hover:bg-red-400/10 transition-colors">✕ Clear</button>}
      </div>

      {/* Courier Comparison Cards */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Courier Comparison</h2>
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"/>Good</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"/>Below benchmark</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {COURIER_STATS.map(c=><ComparisonCard key={c.name} courier={c}/>)}
        </div>
      </div>

      <PerformanceCharts/>
      <RegionalPerformance/>
      <SLATable/>
      <CourierRankingTable/>
      <BottleneckAnalysis/>
      <AIInsightsPanel/>
    </div>
  );
}
