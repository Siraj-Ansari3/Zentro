import { useState } from "react";
import {
  RefreshCw, Download, Calendar, AlertTriangle, Clock, Truck,
  TrendingUp, TrendingDown, XCircle, RotateCcw, Zap, Activity,
  ChevronRight, Radio, CheckCircle2, Package, AlertOctagon,
  Layers, Timer, BarChart2, Navigation, MapPin, User,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// ─────────────────────────────────────────────────────────────
// CONSTANTS & MOCK DATA
// ─────────────────────────────────────────────────────────────
const COURIER_META = {
  Leopards: { color: "#f59e0b", bg: "bg-amber-400",  ring: "ring-amber-400/30",  text: "text-amber-400",  badge: "bg-amber-400/10 text-amber-400 border-amber-400/20"  },
  TCS:      { color: "#22d3ee", bg: "bg-cyan-400",   ring: "ring-cyan-400/30",   text: "text-cyan-400",   badge: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20"     },
  Trax:     { color: "#a78bfa", bg: "bg-violet-400", ring: "ring-violet-400/30", text: "text-violet-400", badge: "bg-violet-400/10 text-violet-400 border-violet-400/20"},
  "M&P":    { color: "#34d399", bg: "bg-emerald-400",ring: "ring-emerald-400/30",text: "text-emerald-400",badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"},
  PostEx:   { color: "#60a5fa", bg: "bg-blue-400",   ring: "ring-blue-400/30",   text: "text-blue-400",   badge: "bg-blue-400/10 text-blue-400 border-blue-400/20"     },
};

const SHIPMENT_ACTIVITY = [
  { day:"Mon 13", total:342, delivered:280, failed:28, delayed:34 },
  { day:"Tue 14", total:318, delivered:260, failed:22, delayed:36 },
  { day:"Wed 15", total:395, delivered:330, failed:30, delayed:35 },
  { day:"Thu 16", total:412, delivered:350, failed:25, delayed:37 },
  { day:"Fri 17", total:380, delivered:310, failed:35, delayed:35 },
  { day:"Sat 18", total:290, delivered:240, failed:18, delayed:32 },
  { day:"Sun 19", total:264, delivered:215, failed:20, delayed:29 },
];

const COURIER_HEALTH = [
  { name:"Leopards", active:142, avgDays:2.8, delayPct:18, failPct:7,  returnPct:5, score:68, status:"warning"  },
  { name:"TCS",      active:98,  avgDays:2.1, delayPct:8,  failPct:5,  returnPct:4, score:91, status:"healthy"  },
  { name:"Trax",     active:76,  avgDays:3.2, delayPct:22, failPct:9,  returnPct:7, score:54, status:"critical" },
  { name:"M&P",      active:54,  avgDays:2.5, delayPct:12, failPct:6,  returnPct:5, score:79, status:"healthy"  },
  { name:"PostEx",   active:38,  avgDays:2.9, delayPct:15, failPct:8,  returnPct:6, score:73, status:"warning"  },
];

const DELAYED_SHIPMENTS = [
  { trackId:"LP-88291", customer:"Aisha Malik",   courier:"Leopards", delay:"74h", city:"Karachi",    escalation:"Open"      },
  { trackId:"TX-19203", customer:"Zara Hussain",  courier:"Trax",     delay:"61h", city:"Peshawar",   escalation:"Pending"   },
  { trackId:"MP-33901", customer:"Hassan Sheikh", courier:"M&P",      delay:"89h", city:"Rawalpindi", escalation:"Escalated" },
  { trackId:"TX-55602", customer:"Mehwish Q.",    courier:"Trax",     delay:"48h", city:"Lahore",     escalation:"Pending"   },
  { trackId:"LP-66712", customer:"Nadia Iqbal",   courier:"Leopards", delay:"52h", city:"Karachi",    escalation:"Open"      },
];

const FAILED_DELIVERIES = [
  { trackId:"TX-38872", customer:"Rabia Zahoor",  courier:"PostEx",   attempts:3, reason:"Not Home",          retry:"Pending",   response:"No answer" },
  { trackId:"MP-10988", customer:"Adnan Baig",    courier:"M&P",      attempts:2, reason:"Wrong Address",     retry:"Scheduled", response:"Confirmed"  },
  { trackId:"LP-44120", customer:"Hassan Sheikh", courier:"Leopards", attempts:3, reason:"COD Refused",       retry:"Hold",      response:"Refused"    },
  { trackId:"TC-22841", customer:"Tariq M.",      courier:"TCS",      attempts:1, reason:"Area Inaccessible", retry:"Tomorrow",  response:"Pending"    },
];

const LIVE_FEED = [
  { type:"delivered", trackId:"TC-44120", customer:"Bilal Raza",    city:"Lahore",     courier:"TCS",      time:"2m ago"  },
  { type:"delayed",   trackId:"TX-19203", customer:"Zara Hussain",  city:"Peshawar",   courier:"Trax",     time:"5m ago"  },
  { type:"intransit", trackId:"LP-77003", customer:"Sana Tariq",    city:"Faisalabad", courier:"Leopards", time:"8m ago"  },
  { type:"failed",    trackId:"TX-38872", customer:"Rabia Zahoor",  city:"Lahore",     courier:"PostEx",   time:"12m ago" },
  { type:"booked",    trackId:"MP-55120", customer:"Imran Khan",    city:"Rawalpindi", courier:"M&P",      time:"15m ago" },
  { type:"delivered", trackId:"LP-22044", customer:"Sobia Anwar",   city:"Faisalabad", courier:"Leopards", time:"18m ago" },
  { type:"returned",  trackId:"MP-10988", customer:"Adnan Baig",    city:"Quetta",     courier:"M&P",      time:"22m ago" },
  { type:"attempt",   trackId:"LP-44120", customer:"Hassan Sheikh", city:"Rawalpindi", courier:"Leopards", time:"28m ago" },
  { type:"intransit", trackId:"TC-91003", customer:"Imran Khan",    city:"Islamabad",  courier:"TCS",      time:"31m ago" },
  { type:"delayed",   trackId:"LP-88291", customer:"Aisha Malik",   city:"Karachi",    courier:"Leopards", time:"35m ago" },
];

const ALERTS = [
  { severity:"critical", title:"Trax — Delay Spike Detected",      desc:"22% of Trax shipments delayed >48h. Lahore & Peshawar worst affected.",         time:"14m ago" },
  { severity:"warning",  title:"50 Shipments Stuck >72 Hours",     desc:"Across all couriers. Majority: Leopards (31) and Trax (14).",                   time:"1h ago"  },
  { severity:"warning",  title:"Leopards — Karachi Slowdown",      desc:"Delivery times in Karachi up 35% vs last week. Driver shortage suspected.",     time:"2h ago"  },
  { severity:"info",     title:"TCS Performing Above Benchmark",   desc:"TCS achieving 91% delivery success rate this week. Best for Lahore routes.",    time:"3h ago"  },
];

const KPI_STATS = [
  { label:"Active Shipments",   value:"408",   sub:"+12 today",  icon:Layers,       color:"blue",   trend:"up"   },
  { label:"In Transit",         value:"291",   sub:"71% of active",icon:Truck,      color:"cyan",   trend:"up"   },
  { label:"Delayed Shipments",  value:"63",    sub:"↑8 vs yesterday",icon:Clock,    color:"amber",  trend:"down" },
  { label:"Failed Deliveries",  value:"24",    sub:"5.9% failure rate",icon:XCircle, color:"red",   trend:"down" },
  { label:"Return Rate",        value:"5.4%",  sub:"-0.3% this week",icon:RotateCcw, color:"orange",trend:"up"  },
  { label:"Avg Delivery Time",  value:"2.6d",  sub:"vs 2.4d target", icon:Timer,    color:"violet", trend:"down" },
  { label:"Courier Success",    value:"82%",   sub:"+2% this week",  icon:TrendingUp,color:"emerald",trend:"up"  },
  { label:"Stuck >72h",         value:"50",    sub:"Needs escalation",icon:AlertOctagon,color:"red",trend:"down"},
];

// ─────────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────
function CourierPill({ name }) {
  const m = COURIER_META[name] || { badge:"bg-slate-400/10 text-slate-400 border-slate-400/20" };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${m.badge}`}>{name}</span>;
}

function EscalationBadge({ status }) {
  const map = {
    Open:      "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    Pending:   "bg-slate-400/10  text-slate-400  border-slate-400/20",
    Escalated: "bg-red-400/10   text-red-400   border-red-400/20",
  };
  return <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${map[status]||map.Pending}`}>{status}</span>;
}

function RetryBadge({ status }) {
  const map = {
    Pending:   "bg-yellow-400/10 text-yellow-400",
    Scheduled: "bg-blue-400/10   text-blue-400",
    Hold:      "bg-red-400/10   text-red-400",
    Tomorrow:  "bg-slate-400/10  text-slate-400",
  };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${map[status]||map.Pending}`}>{status}</span>;
}

function HealthStatusBadge({ status }) {
  const map = {
    healthy:  { cls:"bg-emerald-400/10 text-emerald-400 border-emerald-400/20", dot:"bg-emerald-400", label:"Healthy"  },
    warning:  { cls:"bg-amber-400/10  text-amber-400  border-amber-400/20",    dot:"bg-amber-400",   label:"Warning"  },
    critical: { cls:"bg-red-400/10   text-red-400   border-red-400/20",        dot:"bg-red-400",     label:"Critical" },
  };
  const s = map[status]||map.healthy;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status==="critical"?"animate-pulse":""}`}/>
      {s.label}
    </span>
  );
}

function LiveEventIcon({ type }) {
  const map = {
    delivered: { icon:<CheckCircle2 size={12}/>, cls:"bg-emerald-400/10 text-emerald-400",   dot:"bg-emerald-400" },
    delayed:   { icon:<Clock size={12}/>,        cls:"bg-amber-400/10  text-amber-400",       dot:"bg-amber-400 animate-pulse"  },
    failed:    { icon:<XCircle size={12}/>,      cls:"bg-red-400/10   text-red-400",          dot:"bg-red-400"   },
    intransit: { icon:<Truck size={12}/>,        cls:"bg-cyan-400/10   text-cyan-400",        dot:"bg-cyan-400 animate-pulse"   },
    booked:    { icon:<Package size={12}/>,      cls:"bg-blue-400/10   text-blue-400",        dot:"bg-blue-400"  },
    returned:  { icon:<RotateCcw size={12}/>,    cls:"bg-orange-400/10 text-orange-400",      dot:"bg-orange-400"},
    attempt:   { icon:<Navigation size={12}/>,   cls:"bg-violet-400/10 text-violet-400",      dot:"bg-violet-400"},
  };
  const e = map[type]||map.booked;
  return (
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${e.cls}`}>{e.icon}</div>
  );
}

// ─────────────────────────────────────────────────────────────
// KPI STAT CARDS
// ─────────────────────────────────────────────────────────────
function KPIStatCard({ label, value, sub, icon:Icon, color, trend }) {
  const c = {
    blue:   { bg:"bg-blue-400/10",   text:"text-blue-400",   ring:"ring-blue-400/15"   },
    cyan:   { bg:"bg-cyan-400/10",   text:"text-cyan-400",   ring:"ring-cyan-400/15"   },
    amber:  { bg:"bg-amber-400/10",  text:"text-amber-400",  ring:"ring-amber-400/15"  },
    red:    { bg:"bg-red-400/10",    text:"text-red-400",    ring:"ring-red-400/15"    },
    orange: { bg:"bg-orange-400/10", text:"text-orange-400", ring:"ring-orange-400/15" },
    violet: { bg:"bg-violet-400/10", text:"text-violet-400", ring:"ring-violet-400/15" },
    emerald:{ bg:"bg-emerald-400/10",text:"text-emerald-400",ring:"ring-emerald-400/15"},
  }[color]||{ bg:"bg-slate-400/10",text:"text-slate-400",ring:"ring-slate-400/15" };
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}>
          <Icon size={15} className={c.text}/>
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold ${trend==="up"?"text-emerald-400":"text-red-400"}`}>
            {trend==="up"?<TrendingUp size={10} className="inline"/>:<TrendingDown size={10} className="inline"/>}
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white mb-0.5" style={{fontFamily:"'Syne', sans-serif"}}>{value}</p>
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHIPMENT ACTIVITY GRAPH
// ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d2e] border border-white/[0.10] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-[11px] font-bold text-slate-400 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2 h-2 rounded-full" style={{backgroundColor:p.color}}/>
          <span className="text-slate-400 capitalize">{p.dataKey}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function ShipmentActivityGraph() {
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Shipment Activity</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">7-day delivery flow — completed, failed & delayed</p>
        </div>
        <div className="flex items-center gap-3">
          {[{label:"Delivered",color:"#34d399"},{label:"Failed",color:"#f87171"},{label:"Delayed",color:"#fbbf24"}].map(({label,color})=>(
            <div key={label} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{backgroundColor:color}}/><span className="text-[10px] text-slate-500">{label}</span></div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={SHIPMENT_ACTIVITY} margin={{top:0,right:0,left:-20,bottom:0}}>
          <defs>
            <linearGradient id="gDelivered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34d399" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f87171" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gDelayed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#fbbf24" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="day" tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"#475569",fontSize:10}} axisLine={false} tickLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Area type="monotone" dataKey="delivered" stroke="#34d399" strokeWidth={2} fill="url(#gDelivered)" dot={false} activeDot={{r:4,fill:"#34d399"}}/>
          <Area type="monotone" dataKey="failed"    stroke="#f87171" strokeWidth={2} fill="url(#gFailed)"    dot={false} activeDot={{r:4,fill:"#f87171"}}/>
          <Area type="monotone" dataKey="delayed"   stroke="#fbbf24" strokeWidth={2} fill="url(#gDelayed)"  dot={false} activeDot={{r:4,fill:"#fbbf24"}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COURIER HEALTH GRID
// ─────────────────────────────────────────────────────────────
function ScoreMeter({ score, color }) {
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

function CourierHealthCard({ courier }) {
  const m = COURIER_META[courier.name]||{color:"#94a3b8",text:"text-slate-400",bg:"bg-slate-400"};
  const statusBorder = courier.status==="critical"?"border-red-400/30":courier.status==="warning"?"border-amber-400/20":"border-white/[0.06]";
  return (
    <div className={`bg-[#13151f] border ${statusBorder} rounded-2xl p-4 hover:border-white/10 transition-colors`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${m.bg} bg-opacity-20 flex items-center justify-center ring-1 ${m.ring||"ring-white/10"}`} style={{backgroundColor:`${m.color}18`}}>
            <Truck size={14} style={{color:m.color}}/>
          </div>
          <span className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>{courier.name}</span>
        </div>
        <HealthStatusBadge status={courier.status}/>
      </div>
      <div className="space-y-2.5 mb-4">
        {[
          {label:"Active Shipments", value:courier.active,           unit:"",    warn:false},
          {label:"Avg Delivery",     value:courier.avgDays,          unit:"d",   warn:courier.avgDays>2.5},
          {label:"Delay Rate",       value:`${courier.delayPct}%`,   unit:"",    warn:courier.delayPct>15},
          {label:"Fail Rate",        value:`${courier.failPct}%`,    unit:"",    warn:courier.failPct>7},
          {label:"Return Rate",      value:`${courier.returnPct}%`,  unit:"",    warn:courier.returnPct>6},
        ].map(({label,value,warn})=>(
          <div key={label} className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500">{label}</span>
            <span className={`text-xs font-semibold ${warn?"text-amber-400":"text-slate-300"}`}>{value}</span>
          </div>
        ))}
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Performance Score</span>
        </div>
        <ScoreMeter score={courier.score} color={m.color}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DELAYED SHIPMENTS PANEL
// ─────────────────────────────────────────────────────────────
function DelayedShipmentsPanel() {
  return (
    <div className="bg-[#13151f] border border-amber-400/15 rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
          <span className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Delayed Shipments</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 text-[10px] font-bold border border-amber-400/20">{DELAYED_SHIPMENTS.length}</span>
        </div>
        <button className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1">View All<ChevronRight size={12}/></button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Tracking","Customer","Courier","Delay","City","Status"].map(h=>(
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DELAYED_SHIPMENTS.map(s=>(
              <tr key={s.trackId} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5"><span className="text-[11px] font-mono text-slate-300">{s.trackId}</span></td>
                <td className="px-3 py-2.5"><span className="text-[11px] text-slate-400 whitespace-nowrap">{s.customer}</span></td>
                <td className="px-3 py-2.5"><CourierPill name={s.courier}/></td>
                <td className="px-3 py-2.5"><span className={`text-[11px] font-bold ${parseInt(s.delay)>=72?"text-red-400":"text-amber-400"}`}>{s.delay}</span></td>
                <td className="px-3 py-2.5"><span className="text-[11px] text-slate-500 flex items-center gap-1 whitespace-nowrap"><MapPin size={9} className="text-slate-600"/>{s.city}</span></td>
                <td className="px-3 py-2.5"><EscalationBadge status={s.escalation}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAILED DELIVERIES PANEL
// ─────────────────────────────────────────────────────────────
function FailedDeliveriesPanel() {
  return (
    <div className="bg-[#13151f] border border-red-400/15 rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400"/>
          <span className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Failed Deliveries</span>
          <span className="px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 text-[10px] font-bold border border-red-400/20">{FAILED_DELIVERIES.length}</span>
        </div>
        <button className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1">View All<ChevronRight size={12}/></button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr className="border-b border-white/[0.04]">
              {["Tracking","Customer","Attempts","Reason","Retry","Response"].map(h=>(
                <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FAILED_DELIVERIES.map(f=>(
              <tr key={f.trackId} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5"><span className="text-[11px] font-mono text-slate-300">{f.trackId}</span></td>
                <td className="px-3 py-2.5"><span className="text-[11px] text-slate-400 whitespace-nowrap">{f.customer}</span></td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`text-[11px] font-bold ${f.attempts>=3?"text-red-400":"text-amber-400"}`}>{f.attempts}x</span>
                </td>
                <td className="px-3 py-2.5"><span className="text-[11px] text-slate-500 whitespace-nowrap">{f.reason}</span></td>
                <td className="px-3 py-2.5"><RetryBadge status={f.retry}/></td>
                <td className="px-3 py-2.5">
                  <span className={`text-[11px] ${f.response==="Refused"?"text-red-400":f.response==="Confirmed"?"text-emerald-400":"text-slate-500"}`}>{f.response}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LIVE SHIPMENT FEED
// ─────────────────────────────────────────────────────────────
const LIVE_LABELS = {
  delivered:"Delivered",intransit:"In Transit",delayed:"Delayed Alert",
  failed:"Failed Attempt",booked:"Shipment Booked",returned:"Returned",attempt:"Delivery Attempt",
};

function LiveActivityFeed() {
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Live Shipment Feed</span>
          <span className="text-[10px] text-slate-500">auto-refreshing</span>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors font-medium border border-white/[0.08] px-2.5 py-1 rounded-lg hover:bg-white/[0.04]">
          <RefreshCw size={11}/> Refresh
        </button>
      </div>
      <div className="divide-y divide-white/[0.04] max-h-[320px] overflow-y-auto">
        {LIVE_FEED.map((e,i)=>(
          <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
            <LiveEventIcon type={e.type}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[11px] font-semibold ${e.type==="delivered"?"text-emerald-400":e.type==="failed"?"text-red-400":e.type==="delayed"?"text-amber-400":"text-slate-300"}`}>
                  {LIVE_LABELS[e.type]}
                </span>
                <span className="text-[10px] font-mono text-slate-600">#{e.trackId}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600">
                <span>{e.customer}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5"><MapPin size={9}/>{e.city}</span>
                <span>·</span>
                <CourierPill name={e.courier}/>
              </div>
            </div>
            <span className="text-[10px] text-slate-600 flex-shrink-0">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OPERATIONAL ALERTS
// ─────────────────────────────────────────────────────────────
function OperationalAlerts() {
  const sMap = {
    critical:{ border:"border-red-400/30", bg:"bg-red-400/5",   icon:<AlertOctagon size={14} className="text-red-400 flex-shrink-0 mt-0.5"/>, dot:"bg-red-400"     },
    warning: { border:"border-amber-400/25",bg:"bg-amber-400/5", icon:<AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5"/>,dot:"bg-amber-400"  },
    info:    { border:"border-blue-400/20", bg:"bg-blue-400/5",  icon:<Zap size={14} className="text-blue-400 flex-shrink-0 mt-0.5"/>,          dot:"bg-blue-400"    },
  };
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <AlertOctagon size={14} className="text-red-400"/>
          <span className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Operational Alerts</span>
          <span className="px-1.5 py-0.5 rounded bg-red-400/10 text-red-400 text-[10px] font-bold border border-red-400/20">{ALERTS.length}</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {ALERTS.map((a,i)=>{
          const s = sMap[a.severity];
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${s.border} ${s.bg}`}>
              {s.icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-200 mb-0.5">{a.title}</p>
                <p className="text-[11px] text-slate-500">{a.desc}</p>
              </div>
              <span className="text-[10px] text-slate-600 flex-shrink-0 mt-0.5">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COURIER SELECTOR BAR
// ─────────────────────────────────────────────────────────────
function CourierSelectorBar({ active, onChange }) {
  const couriers = ["All", ...Object.keys(COURIER_META)];
  return (
    <div className="flex items-center gap-2 flex-wrap mb-5">
      {couriers.map(c=>{
        const isActive = active===c;
        const m = COURIER_META[c];
        return (
          <button
            key={c}
            onClick={()=>onChange(c)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isActive
                ? m ? `border-[${m.color}33] text-white bg-white/[0.06]` : "border-white/20 text-white bg-white/[0.06]"
                : "border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
            }`}
          >
            {m && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:m.color}}/>}
            {c === "All" && !m && <Layers size={12}/>}
            {c}
          </button>
        );
      })}
      <div className="ml-auto flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 border border-white/[0.06] hover:bg-white/[0.04] transition-colors"><Calendar size={12}/>Date Range</button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 border border-white/[0.06] hover:bg-white/[0.04] transition-colors"><Download size={12}/>Export</button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] transition-colors"><RefreshCw size={12}/>Refresh</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CourierDashboard() {
  const [activeCourier, setActiveCourier] = useState("All");

  return (
    <div className="min-h-full p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Courier Dashboard</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <span className="text-[10px] font-semibold text-emerald-400">Live</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">Real-time shipment flow, courier health & operational bottlenecks.</p>
        </div>
      </div>

      <CourierSelectorBar active={activeCourier} onChange={setActiveCourier}/>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-5">
        {KPI_STATS.map(s=><KPIStatCard key={s.label} {...s}/>)}
      </div>

      <ShipmentActivityGraph/>

      {/* Courier Health Grid */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Courier Health Grid</h2>
          <span className="text-[11px] text-slate-500">Updated 2 min ago</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {COURIER_HEALTH.map(c=><CourierHealthCard key={c.name} courier={c}/>)}
        </div>
      </div>

      {/* Delayed + Failed two-column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
        <DelayedShipmentsPanel/>
        <FailedDeliveriesPanel/>
      </div>

      {/* Live Feed + Alerts two-column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2"><LiveActivityFeed/></div>
        <OperationalAlerts/>
      </div>
    </div>
  );
}
