import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, SlidersHorizontal, Download, Upload, Plus, Calendar,
  ChevronDown, ChevronLeft, ChevronRight, X, MoreHorizontal,
  Eye, FileText, StickyNote, Ban, UserCheck, History,
  Phone, Mail, MapPin, Package, TrendingUp, TrendingDown,
  AlertTriangle, Shield, ShieldAlert, ShieldOff,
  Users, Star, RotateCcw, XCircle, CheckCircle2, Inbox, ArrowUpDown,
  Copy, Activity, MessageSquare, GitBranch, Zap, Layers,
  Clock, DollarSign, BarChart2, Fingerprint, Link,
  ChevronUp, Info, BadgeCheck, UserX, Merge,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const CITIES   = ["Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad","Peshawar","Quetta","Multan"];
const COURIERS = ["Leopards","TCS","Trax","M&P","PostEx"];

const MOCK_CUSTOMERS = [
  { id:"CUST-001", name:"Aisha Malik",     phone:"0300-1234567", email:"aisha.malik@gmail.com",    city:"Karachi",    addresses:["House 12, Block 5, Gulshan-e-Iqbal, Karachi","Flat 3, DHA Phase 2, Karachi"], totalOrders:14, delivered:10, failed:3, returns:1, codRate:71,  ltv:32500,  risk:"high",   status:"Blacklisted", lastOrder:"2024-01-22", joined:"2022-08-14", courier:"Leopards", tags:["COD Rejector","High Risk","Multiple Accounts"], fraudScore:88, duplicates:2, notes:["Called 3x no answer","Claims order not received"], orderHistory:[{id:"ORD-7821",date:"Jan 22",status:"Failed Delivery",amount:3400,courier:"Leopards"},{id:"ORD-7601",date:"Dec 10",status:"Returned",amount:1800,courier:"TCS"},{id:"ORD-7412",date:"Nov 05",status:"Delivered",amount:4200,courier:"Leopards"}] },
  { id:"CUST-002", name:"Bilal Raza",      phone:"0321-9876543", email:"bilal.raza@yahoo.com",     city:"Lahore",     addresses:["23-B, Gulberg III, Lahore"],                                                totalOrders:28, delivered:26, failed:1, returns:1, codRate:93,  ltv:87400,  risk:"low",    status:"VIP",         lastOrder:"2024-01-20", joined:"2021-03-22", courier:"TCS",      tags:["VIP","Loyal"],                                  fraudScore:4,  duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7820",date:"Jan 20",status:"Delivered",amount:5200,courier:"TCS"},{id:"ORD-7610",date:"Dec 18",status:"Delivered",amount:3800,courier:"TCS"},{id:"ORD-7500",date:"Nov 22",status:"Delivered",amount:6100,courier:"Trax"}] },
  { id:"CUST-003", name:"Fatima Noor",     phone:"0333-5551234", email:"fatima.noor@mail.com",     city:"Islamabad",  addresses:["F-7/2, Street 12, Islamabad"],                                              totalOrders:5,  delivered:4,  failed:0, returns:1, codRate:80,  ltv:14200,  risk:"low",    status:"Returning",   lastOrder:"2024-01-21", joined:"2023-06-11", courier:"Trax",     tags:["Returning"],                                    fraudScore:11, duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7819",date:"Jan 21",status:"In Transit",amount:8750,courier:"Trax"},{id:"ORD-7590",date:"Dec 04",status:"Delivered",amount:2100,courier:"Trax"}] },
  { id:"CUST-004", name:"Hassan Sheikh",   phone:"0311-7778899", email:"hassan.sheikh@live.com",   city:"Rawalpindi", addresses:["Bahria Town Phase 4, Rawalpindi","Satellite Town, Block B, Rawalpindi"],     totalOrders:9,  delivered:4,  failed:4, returns:1, codRate:44,  ltv:18900,  risk:"high",   status:"Blacklisted", lastOrder:"2024-01-21", joined:"2023-01-05", courier:"M&P",      tags:["COD Rejector","Frequent Failures","Suspicious"], fraudScore:91, duplicates:3, notes:["Disputed delivery twice","Possible fraud - same address diff phone"], orderHistory:[{id:"ORD-7818",date:"Jan 21",status:"Failed Delivery",amount:5100,courier:"M&P"},{id:"ORD-7600",date:"Dec 09",status:"Failed Delivery",amount:2900,courier:"TCS"},{id:"ORD-7401",date:"Oct 31",status:"Returned",amount:3800,courier:"M&P"}] },
  { id:"CUST-005", name:"Sana Tariq",      phone:"0345-2223344", email:"sana.tariq@gmail.com",     city:"Faisalabad", addresses:["Peoples Colony No.1, Faisalabad"],                                          totalOrders:3,  delivered:3,  failed:0, returns:0, codRate:100, ltv:7200,   risk:"low",    status:"New",         lastOrder:"2024-01-20", joined:"2023-11-28", courier:"Leopards", tags:["New Customer"],                                 fraudScore:6,  duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7817",date:"Jan 20",status:"Delivered",amount:950,courier:"Leopards"},{id:"ORD-7605",date:"Dec 15",status:"Delivered",amount:3400,courier:"Leopards"}] },
  { id:"CUST-006", name:"Umar Farooq",     phone:"0312-4445566", email:"umar.farooq@hotmail.com",  city:"Karachi",    addresses:["Defence Housing Authority, Phase 6, Karachi"],                              totalOrders:41, delivered:39, failed:1, returns:1, codRate:95,  ltv:142000, risk:"low",    status:"VIP",         lastOrder:"2024-01-20", joined:"2020-07-19", courier:"TCS",      tags:["VIP","High LTV","Loyal"],                       fraudScore:2,  duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7816",date:"Jan 20",status:"Delivered",amount:12400,courier:"TCS"},{id:"ORD-7620",date:"Dec 22",status:"Delivered",amount:8900,courier:"TCS"},{id:"ORD-7510",date:"Nov 30",status:"Delivered",amount:11200,courier:"Trax"}] },
  { id:"CUST-007", name:"Zara Hussain",    phone:"0322-6667788", email:"zara.hussain@gmail.com",   city:"Peshawar",   addresses:["University Town, Peshawar"],                                                totalOrders:7,  delivered:5,  failed:1, returns:1, codRate:71,  ltv:19300,  risk:"medium", status:"Returning",   lastOrder:"2024-01-19", joined:"2023-02-14", courier:"PostEx",   tags:["Occasional Rejector"],                          fraudScore:38, duplicates:1, notes:["One failed COD in Peshawar - driver issue"],       orderHistory:[{id:"ORD-7815",date:"Jan 19",status:"In Transit",amount:2300,courier:"PostEx"},{id:"ORD-7582",date:"Nov 28",status:"Failed Delivery",amount:1800,courier:"M&P"}] },
  { id:"CUST-008", name:"Kamran Ali",      phone:"0301-8889900", email:"kamran.ali@mail.com",      city:"Multan",     addresses:["Gulgasht Colony, Multan","Cantt Area, Multan"],                             totalOrders:11, delivered:5,  failed:5, returns:1, codRate:45,  ltv:21400,  risk:"high",   status:"Blacklisted", lastOrder:"2024-01-19", joined:"2022-12-01", courier:null,       tags:["High Risk","COD Rejector","Multiple Addresses"], fraudScore:79, duplicates:2, notes:["Do not assign COD","Verified phone - real person but habitual rejector"], orderHistory:[{id:"ORD-7814",date:"Jan 19",status:"Pending Verification",amount:4700,courier:null},{id:"ORD-7580",date:"Nov 25",status:"Failed Delivery",amount:3100,courier:"Leopards"},{id:"ORD-7390",date:"Sep 14",status:"Failed Delivery",amount:2800,courier:"TCS"}] },
  { id:"CUST-009", name:"Mehwish Qureshi", phone:"0331-1112233", email:"mehwish.q@gmail.com",      city:"Lahore",     addresses:["Johar Town, Lahore"],                                                       totalOrders:19, delivered:18, failed:0, returns:1, codRate:94,  ltv:54700,  risk:"low",    status:"VIP",         lastOrder:"2024-01-18", joined:"2021-09-08", courier:"Trax",     tags:["VIP","Loyal","Low Return"],                     fraudScore:7,  duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7813",date:"Jan 18",status:"Delivered",amount:1800,courier:"Trax"},{id:"ORD-7611",date:"Dec 19",status:"Delivered",amount:4300,courier:"Trax"},{id:"ORD-7495",date:"Nov 11",status:"Delivered",amount:6700,courier:"Leopards"}] },
  { id:"CUST-010", name:"Adnan Baig",      phone:"0343-3334455", email:"adnan.baig@yahoo.com",     city:"Quetta",     addresses:["Jinnah Town, Quetta"],                                                      totalOrders:8,  delivered:4,  failed:1, returns:3, codRate:50,  ltv:16200,  risk:"medium", status:"Returning",   lastOrder:"2024-01-18", joined:"2022-04-30", courier:"M&P",      tags:["High Return Rate"],                             fraudScore:52, duplicates:0, notes:["3 returns in 6 months - quality complaints"],     orderHistory:[{id:"ORD-7812",date:"Jan 18",status:"Returned",amount:7200,courier:"M&P"},{id:"ORD-7578",date:"Nov 22",status:"Returned",amount:3400,courier:"M&P"},{id:"ORD-7381",date:"Sep 10",status:"Delivered",amount:2100,courier:"TCS"}] },
  { id:"CUST-011", name:"Nadia Iqbal",     phone:"0315-5556677", email:"nadia.iqbal@mail.com",     city:"Karachi",    addresses:["North Nazimabad, Block H, Karachi"],                                        totalOrders:6,  delivered:5,  failed:1, returns:0, codRate:83,  ltv:14800,  risk:"low",    status:"Returning",   lastOrder:"2024-01-17", joined:"2023-04-22", courier:"Leopards", tags:["Returning","Reliable"],                         fraudScore:14, duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7811",date:"Jan 17",status:"In Transit",amount:3100,courier:"Leopards"},{id:"ORD-7591",date:"Dec 06",status:"Delivered",amount:4400,courier:"Leopards"}] },
  { id:"CUST-012", name:"Tariq Mehmood",   phone:"0303-7778899", email:"tariq.mehmood@live.com",   city:"Islamabad",  addresses:["G-10 Markaz, Islamabad"],                                                   totalOrders:2,  delivered:2,  failed:0, returns:0, codRate:100, ltv:5100,   risk:"low",    status:"New",         lastOrder:"2024-01-17", joined:"2023-12-10", courier:"TCS",      tags:["New Customer"],                                 fraudScore:5,  duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7810",date:"Jan 17",status:"Packed",amount:2200,courier:"TCS"},{id:"ORD-7601",date:"Dec 11",status:"Delivered",amount:2900,courier:"TCS"}] },
  { id:"CUST-013", name:"Rabia Zahoor",    phone:"0324-9990011", email:"rabia.zahoor@gmail.com",   city:"Lahore",     addresses:["Model Town Extension, Lahore","Allama Iqbal Town, Lahore"],                 totalOrders:15, delivered:7,  failed:6, returns:2, codRate:46,  ltv:29800,  risk:"high",   status:"Blacklisted", lastOrder:"2024-01-16", joined:"2022-06-17", courier:"PostEx",   tags:["COD Rejector","High Risk","Multiple Addresses"], fraudScore:83, duplicates:2, notes:["Flagged by courier - refuses delivery","Address inconsistency detected"], orderHistory:[{id:"ORD-7809",date:"Jan 16",status:"Failed Delivery",amount:5900,courier:"PostEx"},{id:"ORD-7576",date:"Nov 20",status:"Failed Delivery",amount:4100,courier:"M&P"},{id:"ORD-7370",date:"Aug 29",status:"Delivered",amount:3200,courier:"TCS"}] },
  { id:"CUST-014", name:"Imran Khan",      phone:"0336-2223344", email:"imran.k@mail.com",         city:"Rawalpindi", addresses:["Chaklala Scheme 3, Rawalpindi"],                                             totalOrders:4,  delivered:3,  failed:1, returns:0, codRate:75,  ltv:11200,  risk:"medium", status:"Returning",   lastOrder:"2024-01-16", joined:"2023-07-09", courier:"Trax",     tags:["Occasional Rejector"],                          fraudScore:29, duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7808",date:"Jan 16",status:"Out for Delivery",amount:4100,courier:"Trax"},{id:"ORD-7570",date:"Nov 15",status:"Delivered",amount:2800,courier:"Leopards"}] },
  { id:"CUST-015", name:"Sobia Anwar",     phone:"0317-4445566", email:"sobia.anwar@hotmail.com",  city:"Faisalabad", addresses:["Madina Town, Faisalabad"],                                                  totalOrders:22, delivered:21, failed:0, returns:1, codRate:95,  ltv:68100,  risk:"low",    status:"VIP",         lastOrder:"2024-01-15", joined:"2021-11-03", courier:"Leopards", tags:["VIP","High LTV","Low Return"],                  fraudScore:3,  duplicates:0, notes:[],                                                  orderHistory:[{id:"ORD-7807",date:"Jan 15",status:"Delivered",amount:6800,courier:"Leopards"},{id:"ORD-7598",date:"Dec 09",status:"Delivered",amount:9200,courier:"Leopards"},{id:"ORD-7488",date:"Nov 07",status:"Delivered",amount:7400,courier:"TCS"}] },
];

const SEGMENT_TABS = [
  { key:"all",         label:"All Customers",  color:"slate"   },
  { key:"VIP",         label:"VIP",            color:"violet"  },
  { key:"high",        label:"High Risk",      color:"red"     },
  { key:"Returning",   label:"Repeat Buyers",  color:"blue"    },
  { key:"Blacklisted", label:"Blacklisted",    color:"red"     },
  { key:"codRejector", label:"COD Rejectors",  color:"amber"   },
  { key:"highReturn",  label:"High Return",    color:"orange"  },
];

// ─────────────────────────────────────────────────────────────
// BADGE COMPONENTS
// ─────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = {
    low:    { cls:"bg-emerald-400/10 text-emerald-400 border-emerald-400/20", icon:<Shield size={10}/>,    label:"Low"  },
    medium: { cls:"bg-amber-400/10  text-amber-400  border-amber-400/20",    icon:<ShieldAlert size={10}/>,label:"Med"  },
    high:   { cls:"bg-red-400/10   text-red-400   border-red-400/20",        icon:<ShieldOff size={10}/>,  label:"High" },
  };
  const r = map[level] || map.low;
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${r.cls}`}>{r.icon}{r.label}</span>;
}

function StatusBadge({ status }) {
  const map = {
    VIP:         "bg-violet-400/10 text-violet-400 border-violet-400/20",
    Returning:   "bg-blue-400/10   text-blue-400   border-blue-400/20",
    New:         "bg-slate-400/10  text-slate-400  border-slate-400/20",
    Blacklisted: "bg-red-400/10   text-red-400   border-red-400/20",
  };
  const icons = { VIP:<Star size={10}/>, Returning:<RotateCcw size={10}/>, New:<Zap size={10}/>, Blacklisted:<Ban size={10}/> };
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${map[status]||map.New}`}>{icons[status]}{status}</span>;
}

function CODBar({ rate }) {
  const color = rate>=85?"bg-emerald-400":rate>=60?"bg-amber-400":"bg-red-400";
  const text  = rate>=85?"text-emerald-400":rate>=60?"text-amber-400":"text-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{width:`${rate}%`}}/>
      </div>
      <span className={`text-[11px] font-bold ${text} w-7 flex-shrink-0`}>{rate}%</span>
    </div>
  );
}

function FraudMeter({ score }) {
  const color = score<=20?"text-emerald-400":score<=50?"text-amber-400":"text-red-400";
  const bar   = score<=20?"bg-emerald-400":score<=50?"bg-amber-400":"bg-red-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-14 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${bar}`} style={{width:`${score}%`}}/>
      </div>
      <span className={`text-[11px] font-bold ${color} w-5`}>{score}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────────────────────
function PageHeader({ total }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-white" style={{fontFamily:"'Syne', sans-serif"}}>Customers</h1>
          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 text-xs font-semibold border border-white/[0.08]">{total.toLocaleString()}</span>
        </div>
        <p className="text-sm text-slate-500">Customer risk engine — COD behavior, return patterns & fraud intelligence.</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"><Upload size={13}/>Import CSV</button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"><Download size={13}/>Export</button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-black bg-amber-400 hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"><Plus size={13}/>Add Customer</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INSIGHT CARDS
// ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon:Icon, accent, trend, trendVal }) {
  const c = {
    amber:  {bg:"bg-amber-400/10",  ring:"ring-amber-400/15",  icon:"text-amber-400"},
    emerald:{bg:"bg-emerald-400/10",ring:"ring-emerald-400/15",icon:"text-emerald-400"},
    red:    {bg:"bg-red-400/10",    ring:"ring-red-400/15",    icon:"text-red-400"},
    violet: {bg:"bg-violet-400/10", ring:"ring-violet-400/15", icon:"text-violet-400"},
    blue:   {bg:"bg-blue-400/10",   ring:"ring-blue-400/15",   icon:"text-blue-400"},
    slate:  {bg:"bg-slate-400/10",  ring:"ring-slate-400/15",  icon:"text-slate-400"},
  }[accent]||{bg:"bg-slate-400/10",ring:"ring-slate-400/15",icon:"text-slate-400"};
  return (
    <div className="bg-[#13151f] border border-white/[0.06] rounded-2xl p-4 hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-xl ${c.bg} ring-1 ${c.ring} flex items-center justify-center`}><Icon size={15} className={c.icon}/></div>
        {trendVal && <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend==="up"?"text-emerald-400":"text-red-400"}`}>{trend==="up"?<TrendingUp size={10}/>:<TrendingDown size={10}/>}{trendVal}</span>}
      </div>
      <p className="text-xl font-bold text-white mb-0.5" style={{fontFamily:"'Syne', sans-serif"}}>{value}</p>
      <p className="text-xs text-slate-500 leading-none">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function InsightCards({ customers }) {
  const repeat      = customers.filter(c=>c.totalOrders>3).length;
  const highRisk    = customers.filter(c=>c.risk==="high").length;
  const blacklisted = customers.filter(c=>c.status==="Blacklisted").length;
  const totalLTV    = customers.reduce((s,c)=>s+c.ltv,0);
  const avgCOD      = Math.round(customers.reduce((s,c)=>s+c.codRate,0)/customers.length);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
      <MetricCard label="Total Customers"  value={customers.length}                   icon={Users}       accent="blue"   trend="up" trendVal="+12%"/>
      <MetricCard label="Repeat Buyers"    value={repeat}     sub=">3 orders"         icon={RotateCcw}   accent="emerald"trend="up" trendVal="+4%"/>
      <MetricCard label="High Risk"        value={highRisk}                           icon={ShieldAlert} accent="red"    trend="up" trendVal="+2"/>
      <MetricCard label="COD Success Rate" value={`${avgCOD}%`}                       icon={CheckCircle2}accent="amber"/>
      <MetricCard label="Blacklisted"      value={blacklisted}                        icon={Ban}         accent="red"/>
      <MetricCard label="Lifetime Revenue" value={`Rs ${(totalLTV/1000).toFixed(0)}k`}icon={DollarSign}  accent="violet" trend="up" trendVal="+18%"/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FILTER BAR
// ─────────────────────────────────────────────────────────────
function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)} className="appearance-none pl-3 pr-7 py-2 rounded-lg text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.07] focus:outline-none focus:border-amber-400/40 cursor-pointer transition-colors">
        <option value="">{label}</option>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
    </div>
  );
}

function FilterBar({ filters, setFilters, onClear }) {
  const hasActive = Object.values(filters).some(Boolean);
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
          <input type="text" placeholder="Search by name, phone, email, address…" value={filters.search} onChange={e=>setFilters(f=>({...f,search:e.target.value}))} className="w-full pl-8 pr-3 py-2 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-400/40 transition-colors"/>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors"><Calendar size={13}/>Date Range</button>
        {hasActive && <button onClick={onClear} className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-red-400 bg-red-400/5 border border-red-400/20 hover:bg-red-400/10 transition-colors"><X size={12}/>Clear</button>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <SlidersHorizontal size={13} className="text-slate-600 flex-shrink-0"/>
        <FilterSelect label="Risk Level"      options={["low","medium","high"]}                                                                                    value={filters.risk}    onChange={v=>setFilters(f=>({...f,risk:v}))}/>
        <FilterSelect label="Customer Type"   options={["VIP","Returning","New","Blacklisted"]}                                                                    value={filters.status}  onChange={v=>setFilters(f=>({...f,status:v}))}/>
        <FilterSelect label="COD Performance" options={[{value:"high",label:"High Acceptance"},{value:"low",label:"Frequent Rejector"},{value:"highReturn",label:"High Returns"}]} value={filters.cod} onChange={v=>setFilters(f=>({...f,cod:v}))}/>
        <FilterSelect label="City"            options={CITIES}  value={filters.city}    onChange={v=>setFilters(f=>({...f,city:v}))}/>
        <FilterSelect label="Courier Pref."   options={COURIERS}value={filters.courier} onChange={v=>setFilters(f=>({...f,courier:v}))}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SEGMENT TABS
// ─────────────────────────────────────────────────────────────
function SegmentTabs({ active, onChange, counts }) {
  const tabColor = { slate:"border-slate-400 text-slate-300 bg-slate-400/10", violet:"border-violet-400 text-violet-400 bg-violet-400/10", red:"border-red-400 text-red-400 bg-red-400/10", blue:"border-blue-400 text-blue-400 bg-blue-400/10", amber:"border-amber-400 text-amber-400 bg-amber-400/10", orange:"border-orange-400 text-orange-400 bg-orange-400/10" };
  const badgeColor = { slate:"bg-slate-500/20 text-slate-500", violet:"bg-violet-400/10 text-violet-500", red:"bg-red-400/10 text-red-500", blue:"bg-blue-400/10 text-blue-500", amber:"bg-amber-400/10 text-amber-500", orange:"bg-orange-400/10 text-orange-500" };
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-4">
      {SEGMENT_TABS.map(({key,label,color})=>{
        const isActive = active===key;
        return (
          <button key={key} onClick={()=>onChange(key)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 flex-shrink-0 border ${isActive?tabColor[color]:"border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"}`}>
            {label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isActive?"bg-white/20 text-current":badgeColor[color]}`}>{counts[key]??0}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ACTION DROPDOWN
// ─────────────────────────────────────────────────────────────
function ActionDropdown({ customer, onView }) {
  const [open,setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{
    const h = e=>{ if(ref.current&&!ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[]);
  const actions = [
    {label:"View Profile",     icon:Eye,       onClick:()=>{onView(customer);setOpen(false);}},
    {label:"View Orders",      icon:Package,   onClick:()=>setOpen(false)},
    {label:"Add Note",         icon:StickyNote,onClick:()=>setOpen(false)},
    {label:"Verify Customer",  icon:UserCheck, onClick:()=>setOpen(false)},
    {label:"Export History",   icon:Download,  onClick:()=>setOpen(false)},
    {divider:true},
    {label:"Blacklist",        icon:Ban,       danger:true, onClick:()=>setOpen(false)},
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"><MoreHorizontal size={14}/></button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#1a1d2e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/60 z-50 py-1 overflow-hidden">
          {actions.map((a,i)=>a.divider?<div key={i} className="my-1 border-t border-white/[0.06]"/>:(
            <button key={a.label} onClick={a.onClick} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${a.danger?"text-red-400 hover:bg-red-400/10":"text-slate-300 hover:bg-white/[0.06]"}`}>
              <a.icon size={12} className="flex-shrink-0"/>{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-t border-white/[0.04]">
      {[10,28,20,14,10,12,14,12,12,10,12,8].map((w,i)=>(
        <td key={i} className="px-3 py-3.5"><div className="h-3 rounded bg-white/[0.06] animate-pulse" style={{width:`${w*4}px`,maxWidth:"100%"}}/></td>
      ))}
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr><td colSpan={13}>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4"><Inbox size={28} className="text-slate-600"/></div>
        <h3 className="text-base font-bold text-white mb-1" style={{fontFamily:"'Syne', sans-serif"}}>No customers found</h3>
        <p className="text-sm text-slate-600 mb-5">Try adjusting your filters or import customers.</p>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"><Upload size={14}/>Import Customers</button>
      </div>
    </td></tr>
  );
}

// ─────────────────────────────────────────────────────────────
// TABLE ROW (DESKTOP)
// ─────────────────────────────────────────────────────────────
function TableRow({ customer:c, selected, onSelect, onView }) {
  const isHighRisk = c.risk==="high";
  return (
    <tr onClick={()=>onView(c)} className={`border-t border-white/[0.04] cursor-pointer transition-colors group ${selected?"bg-amber-400/[0.04]":"hover:bg-white/[0.02]"} ${isHighRisk?"border-l-2 border-l-red-400/40":""}`}>
      <td className="pl-4 pr-2 py-3" onClick={e=>e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={e=>onSelect(c.id,e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"/>
      </td>
      {/* Customer */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${c.risk==="high"?"bg-gradient-to-br from-red-600 to-red-800":c.status==="VIP"?"bg-gradient-to-br from-violet-500 to-indigo-700":"bg-gradient-to-br from-slate-600 to-slate-700"}`}>{c.name[0]}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">{c.name}</p>
              {c.duplicates>0 && <span title={`${c.duplicates} possible duplicates`} className="text-amber-400"><AlertTriangle size={10}/></span>}
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{c.phone}</p>
          </div>
        </div>
      </td>
      {/* Email */}
      <td className="px-3 py-3"><p className="text-[11px] text-slate-500 truncate max-w-[130px]">{c.email}</p></td>
      {/* City */}
      <td className="px-3 py-3"><span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap"><MapPin size={10} className="text-slate-600"/>{c.city}</span></td>
      {/* Orders */}
      <td className="px-3 py-3 text-center"><span className="text-xs font-semibold text-slate-200">{c.totalOrders}</span></td>
      {/* LTV */}
      <td className="px-3 py-3 whitespace-nowrap"><span className="text-xs font-bold text-white">Rs {c.ltv.toLocaleString()}</span></td>
      {/* COD */}
      <td className="px-3 py-3"><CODBar rate={c.codRate}/></td>
      {/* Returns */}
      <td className="px-3 py-3 text-center">
        <span className={`text-xs font-semibold ${c.returns>2?"text-red-400":c.returns>0?"text-amber-400":"text-slate-500"}`}>{c.returns}</span>
      </td>
      {/* Fraud */}
      <td className="px-3 py-3"><FraudMeter score={c.fraudScore}/></td>
      {/* Risk */}
      <td className="px-3 py-3"><RiskBadge level={c.risk}/></td>
      {/* Status */}
      <td className="px-3 py-3"><StatusBadge status={c.status}/></td>
      {/* Last Order */}
      <td className="px-3 py-3 whitespace-nowrap"><span className="text-[11px] text-slate-500">{c.lastOrder}</span></td>
      {/* Actions */}
      <td className="px-3 py-3" onClick={e=>e.stopPropagation()}><ActionDropdown customer={c} onView={onView}/></td>
    </tr>
  );
}

const COLUMNS = [
  {key:"name",      label:"Customer",      sortable:true },
  {key:"email",     label:"Email",         sortable:false},
  {key:"city",      label:"City",          sortable:true },
  {key:"totalOrders",label:"Orders",       sortable:true },
  {key:"ltv",       label:"Lifetime Value",sortable:true },
  {key:"codRate",   label:"COD Accept.",   sortable:true },
  {key:"returns",   label:"Returns",       sortable:true },
  {key:"fraudScore",label:"Fraud Score",   sortable:true },
  {key:"risk",      label:"Risk",          sortable:false},
  {key:"status",    label:"Status",        sortable:false},
  {key:"lastOrder", label:"Last Order",    sortable:true },
  {key:"actions",   label:"",              sortable:false},
];

function TableHead({ sort, onSort, allSelected, onSelectAll }) {
  return (
    <thead>
      <tr className="border-b border-white/[0.06]">
        <th className="pl-4 pr-2 py-3"><input type="checkbox" checked={allSelected} onChange={e=>onSelectAll(e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-amber-400 cursor-pointer"/></th>
        {COLUMNS.map(({key,label,sortable})=>(
          <th key={key} onClick={()=>sortable&&onSort(key)} className={`px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${sortable?"cursor-pointer hover:text-slate-300 select-none transition-colors":""}`}>
            <span className="flex items-center gap-1">{label}{sortable&&<ArrowUpDown size={10} className={sort.key===key?"text-amber-400":"text-slate-700"}/>}</span>
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ─────────────────────────────────────────────────────────────
// MOBILE CUSTOMER CARD
// ─────────────────────────────────────────────────────────────
function CustomerCard({ customer:c, onView }) {
  return (
    <div onClick={()=>onView(c)} className={`bg-[#13151f] border rounded-xl p-4 cursor-pointer hover:border-white/10 transition-all ${c.risk==="high"?"border-red-400/20":"border-white/[0.06]"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${c.risk==="high"?"bg-gradient-to-br from-red-600 to-red-800":c.status==="VIP"?"bg-gradient-to-br from-violet-500 to-indigo-700":"bg-gradient-to-br from-slate-600 to-slate-700"}`}>{c.name[0]}</div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-semibold text-white">{c.name}</p>
              {c.duplicates>0&&<AlertTriangle size={11} className="text-amber-400"/>}
            </div>
            <p className="text-[11px] text-slate-500">{c.phone}</p>
          </div>
        </div>
        <ActionDropdown customer={c} onView={onView}/>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        <RiskBadge level={c.risk}/><StatusBadge status={c.status}/>
        {c.tags.slice(0,1).map(t=><span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500 border border-white/[0.06]">{t}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div><p className="text-[10px] text-slate-600 mb-0.5">COD Acceptance</p><CODBar rate={c.codRate}/></div>
        <div><p className="text-[10px] text-slate-600 mb-0.5">Fraud Score</p><FraudMeter score={c.fraudScore}/></div>
        <div><p className="text-[10px] text-slate-600 mb-0.5">Total Orders</p><p className="text-xs font-bold text-white">{c.totalOrders}</p></div>
        <div><p className="text-[10px] text-slate-600 mb-0.5">Lifetime Value</p><p className="text-xs font-bold text-white">Rs {c.ltv.toLocaleString()}</p></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex gap-3 text-[11px] text-slate-500">
          <span className={c.failed>2?"text-red-400":""}>{c.failed} failed</span>
          <span className={c.returns>2?"text-orange-400":""}>{c.returns} returns</span>
        </div>
        <span className="text-[10px] text-slate-600">{c.city} · {c.lastOrder}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER PROFILE DRAWER
// ─────────────────────────────────────────────────────────────
function OrderHistoryItem({ order }) {
  const statusColor = {
    "Delivered":"text-emerald-400","In Transit":"text-cyan-400","Out for Delivery":"text-violet-400",
    "Failed Delivery":"text-red-400","Returned":"text-orange-400","Pending Verification":"text-yellow-400","Packed":"text-indigo-400",
  };
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2.5">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${order.status==="Delivered"?"bg-emerald-400":order.status.includes("Failed")?"bg-red-400":order.status==="Returned"?"bg-orange-400":"bg-amber-400"}`}/>
        <div>
          <p className="text-xs font-semibold text-slate-300 font-mono">{order.id}</p>
          <p className="text-[10px] text-slate-600">{order.date} · {order.courier||"No courier"}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-bold text-white">Rs {order.amount.toLocaleString()}</p>
        <p className={`text-[10px] font-semibold ${statusColor[order.status]||"text-slate-400"}`}>{order.status}</p>
      </div>
    </div>
  );
}

function DuplicateAlert({ count }) {
  if(!count) return null;
  return (
    <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-xs font-bold text-amber-400 mb-1">Duplicate Detection Alert</p>
          <p className="text-[11px] text-amber-300/60 mb-3">System found <strong className="text-amber-400">{count}</strong> potential duplicate account{count>1?"s":""} matching this customer's phone, email, or address.</p>
          <div className="space-y-1.5">
            {[["Same phone number","0300-1234567"],["Similar address","Gulshan-e-Iqbal, Karachi"]].slice(0,count).map(([type,val])=>(
              <div key={type} className="flex items-center justify-between bg-amber-400/5 rounded-lg px-3 py-2">
                <span className="text-[10px] text-amber-300/60">{type}</span>
                <span className="text-[10px] font-mono text-amber-400">{val}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"><Link size={11}/>Investigate Duplicates</button>
        </div>
      </div>
    </div>
  );
}

function CustomerDrawer({ customer:c, onClose }) {
  if(!c) return null;
  const [tab,setTab] = useState("overview");
  const tabs = [{key:"overview",label:"Overview"},{key:"orders",label:"Orders"},{key:"risk",label:"Risk Intel"},{key:"comms",label:"Comms"}];
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}/>
      <div className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-[#0f1120] border-l border-white/[0.07] z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white ${c.risk==="high"?"bg-gradient-to-br from-red-600 to-red-800":c.status==="VIP"?"bg-gradient-to-br from-violet-500 to-indigo-700":"bg-gradient-to-br from-slate-600 to-slate-700"}`}>{c.name[0]}</div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-white">{c.name}</p>
                  {c.duplicates>0&&<AlertTriangle size={12} className="text-amber-400"/>}
                </div>
                <div className="flex items-center gap-1.5"><RiskBadge level={c.risk}/><StatusBadge status={c.status}/></div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors flex-shrink-0"><X size={16}/></button>
          </div>
          {/* Sub-tabs */}
          <div className="flex gap-1">
            {tabs.map(t=>(
              <button key={t.key} onClick={()=>setTab(t.key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab===t.key?"bg-amber-400/10 text-amber-400 border border-amber-400/20":"text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent"}`}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab==="overview" && (
            <div className="space-y-5">
              {c.duplicates>0 && <DuplicateAlert count={c.duplicates}/>}
              {/* Contact */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Phone size={12} className="text-slate-600 flex-shrink-0"/>{c.phone}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-400"><Mail size={12} className="text-slate-600 flex-shrink-0"/>{c.email}</div>
                  <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider pt-1">Addresses ({c.addresses.length})</div>
                  {c.addresses.map((a,i)=>(
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400"><MapPin size={12} className="text-slate-600 flex-shrink-0 mt-0.5"/>{a}</div>
                  ))}
                </div>
              </section>
              {/* Tags */}
              {c.tags.length>0&&(
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Customer Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.map(t=>(
                      <span key={t} className="px-2 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] text-slate-400 border border-white/[0.07]">{t}</span>
                    ))}
                  </div>
                </section>
              )}
              {/* Operational Metrics */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Operational Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {label:"Total Orders", value:c.totalOrders, color:"text-white"},
                    {label:"Delivered",    value:c.delivered,   color:"text-emerald-400"},
                    {label:"Failed",       value:c.failed,      color:c.failed>2?"text-red-400":"text-amber-400"},
                    {label:"Returns",      value:c.returns,     color:c.returns>2?"text-orange-400":"text-amber-400"},
                  ].map(({label,value,color})=>(
                    <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                      <p className="text-[10px] text-slate-600 mb-1">{label}</p>
                      <p className={`text-xl font-bold ${color}`} style={{fontFamily:"'Syne', sans-serif"}}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-slate-600">COD Acceptance Rate</p>
                    <span className={`text-sm font-bold ${c.codRate>=85?"text-emerald-400":c.codRate>=60?"text-amber-400":"text-red-400"}`}>{c.codRate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${c.codRate>=85?"bg-emerald-400":c.codRate>=60?"bg-amber-400":"bg-red-400"}`} style={{width:`${c.codRate}%`}}/>
                  </div>
                </div>
                <div className="mt-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between">
                  <p className="text-[10px] text-slate-600">Lifetime Value</p>
                  <p className="text-sm font-bold text-white">Rs {c.ltv.toLocaleString()}</p>
                </div>
              </section>
            </div>
          )}

          {tab==="orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">{c.totalOrders} total orders</p>
                <button className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">View All</button>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">
                {c.orderHistory.map(o=><OrderHistoryItem key={o.id} order={o}/>)}
              </div>
              {/* Courier preference */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Courier Preference</h3>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-200">{c.courier||"No preference"}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Most frequently assigned courier</p>
                </div>
              </section>
            </div>
          )}

          {tab==="risk" && (
            <div className="space-y-4">
              {/* Fraud Score */}
              <div className={`border rounded-xl p-4 ${c.fraudScore>60?"bg-red-400/5 border-red-400/20":c.fraudScore>30?"bg-amber-400/5 border-amber-400/20":"bg-emerald-400/5 border-emerald-400/20"}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-300">Fraud Risk Score</p>
                  <span className={`text-2xl font-black ${c.fraudScore>60?"text-red-400":c.fraudScore>30?"text-amber-400":"text-emerald-400"}`} style={{fontFamily:"'Syne', sans-serif"}}>{c.fraudScore}<span className="text-sm font-semibold text-slate-500">/100</span></span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className={`h-full rounded-full ${c.fraudScore>60?"bg-red-400":c.fraudScore>30?"bg-amber-400":"bg-emerald-400"} transition-all`} style={{width:`${c.fraudScore}%`}}/>
                </div>
                <p className={`text-[11px] mt-2 font-semibold ${c.fraudScore>60?"text-red-400":c.fraudScore>30?"text-amber-400":"text-emerald-400"}`}>{c.fraudScore>60?"High Risk — Review Before Fulfillment":c.fraudScore>30?"Medium Risk — Monitor Closely":"Low Risk — Clear to Fulfill"}</p>
              </div>
              {/* Risk indicators */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Risk Indicators</h3>
                <div className="space-y-2">
                  {c.risk!=="low" && [
                    c.failed>2&&{icon:<XCircle size={12}/>,text:`${c.failed} failed deliveries`,severity:"high"},
                    c.returns>1&&{icon:<RotateCcw size={12}/>,text:`${c.returns} returns in history`,severity:"medium"},
                    c.duplicates>0&&{icon:<AlertTriangle size={12}/>,text:`${c.duplicates} potential duplicate accounts`,severity:"high"},
                    c.codRate<60&&{icon:<Ban size={12}/>,text:`COD acceptance only ${c.codRate}%`,severity:"high"},
                    c.addresses.length>1&&{icon:<MapPin size={12}/>,text:"Multiple delivery addresses detected",severity:"medium"},
                  ].filter(Boolean).map((r,i)=>(
                    <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border ${r.severity==="high"?"bg-red-400/5 border-red-400/20 text-red-400":"bg-amber-400/5 border-amber-400/20 text-amber-400"}`}>
                      {r.icon}{r.text}
                    </div>
                  ))}
                  {c.risk==="low"&&<div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-400/5 border border-emerald-400/20 text-xs font-medium text-emerald-400"><CheckCircle2 size={12}/>No risk indicators detected</div>}
                </div>
              </section>
              {/* Duplicate detection */}
              <DuplicateAlert count={c.duplicates}/>
            </div>
          )}

          {tab==="comms" && (
            <div className="space-y-4">
              {/* Notes */}
              {c.notes.length>0&&(
                <section>
                  <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Internal Notes</h3>
                  <div className="space-y-2">
                    {c.notes.map((n,i)=>(
                      <div key={i} className="bg-amber-400/5 border border-amber-400/10 rounded-xl px-3 py-2.5 flex items-start gap-2">
                        <StickyNote size={11} className="text-amber-400 flex-shrink-0 mt-0.5"/>
                        <p className="text-xs text-amber-300/70">{n}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {/* Add note */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                <textarea rows={3} placeholder="Add an internal note…" className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none resize-none"/>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] text-slate-600 flex items-center gap-1"><StickyNote size={10}/>Internal only</span>
                  <button className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors">Save Note</button>
                </div>
              </div>
              {/* WhatsApp placeholder */}
              <section>
                <h3 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">WhatsApp Logs</h3>
                <div className="flex flex-col items-center py-8 text-center">
                  <MessageSquare size={24} className="text-slate-700 mb-2"/>
                  <p className="text-xs text-slate-600">No WhatsApp conversations yet.</p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center gap-2 flex-shrink-0">
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"><UserCheck size={13}/>Verify</button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 text-xs font-semibold hover:bg-white/[0.08] transition-colors"><Package size={13}/>View Orders</button>
          <button className="p-2.5 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition-colors" title="Blacklist"><Ban size={14}/></button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onPage, onPerPage }) {
  const totalPages = Math.ceil(total/perPage);
  const from = (page-1)*perPage+1, to = Math.min(page*perPage,total);
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>Rows per page:</span>
        <div className="relative">
          <select value={perPage} onChange={e=>{onPerPage(Number(e.target.value));onPage(1);}} className="appearance-none pl-2 pr-5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 text-xs focus:outline-none cursor-pointer">
            {[10,25,50,100].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
        </div>
        <span className="text-slate-600">{from}–{to} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={()=>onPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14}/></button>
        {Array.from({length:Math.min(5,totalPages)},(_,i)=>{
          const p = page<=3?i+1:page-2+i;
          if(p<1||p>totalPages) return null;
          return <button key={p} onClick={()=>onPage(p)} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p===page?"bg-amber-400 text-black":"text-slate-400 hover:text-white hover:bg-white/[0.06]"}`}>{p}</button>;
        })}
        <button onClick={()=>onPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><ChevronRight size={14}/></button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function CustomerProfiles() {
  const [filters,  setFilters]  = useState({search:"",risk:"",status:"",cod:"",city:"",courier:""});
  const [activeTab,setActiveTab]= useState("all");
  const [selected, setSelected] = useState(new Set());
  const [sort,     setSort]     = useState({key:"name",dir:"asc"});
  const [page,     setPage]     = useState(1);
  const [perPage,  setPerPage]  = useState(10);
  const [drawer,   setDrawer]   = useState(null);
  const loading = false;

  const filtered = useMemo(()=>{
    return MOCK_CUSTOMERS.filter(c=>{
      if(activeTab==="VIP"         && c.status!=="VIP")         return false;
      if(activeTab==="high"        && c.risk!=="high")          return false;
      if(activeTab==="Returning"   && c.status!=="Returning")   return false;
      if(activeTab==="Blacklisted" && c.status!=="Blacklisted") return false;
      if(activeTab==="codRejector" && c.codRate>=70)            return false;
      if(activeTab==="highReturn"  && c.returns<2)              return false;
      if(filters.search){
        const q=filters.search.toLowerCase();
        if(!c.name.toLowerCase().includes(q)&&!c.phone.includes(q)&&!c.email.toLowerCase().includes(q)&&!c.addresses.some(a=>a.toLowerCase().includes(q))) return false;
      }
      if(filters.risk    && c.risk!==filters.risk)       return false;
      if(filters.status  && c.status!==filters.status)   return false;
      if(filters.city    && c.city!==filters.city)       return false;
      if(filters.courier && c.courier!==filters.courier) return false;
      if(filters.cod==="high"       && c.codRate<85)     return false;
      if(filters.cod==="low"        && c.codRate>=70)    return false;
      if(filters.cod==="highReturn" && c.returns<2)      return false;
      return true;
    });
  },[filters,activeTab]);

  const sorted = useMemo(()=>[...filtered].sort((a,b)=>{
    let av=a[sort.key],bv=b[sort.key];
    if(typeof av==="string"){av=av.toLowerCase();bv=bv.toLowerCase();}
    return sort.dir==="asc"?(av>bv?1:-1):(av<bv?1:-1);
  }),[filtered,sort]);

  const paginated = sorted.slice((page-1)*perPage,page*perPage);

  const counts = useMemo(()=>({
    all:MOCK_CUSTOMERS.length,
    VIP:MOCK_CUSTOMERS.filter(c=>c.status==="VIP").length,
    high:MOCK_CUSTOMERS.filter(c=>c.risk==="high").length,
    Returning:MOCK_CUSTOMERS.filter(c=>c.status==="Returning").length,
    Blacklisted:MOCK_CUSTOMERS.filter(c=>c.status==="Blacklisted").length,
    codRejector:MOCK_CUSTOMERS.filter(c=>c.codRate<70).length,
    highReturn:MOCK_CUSTOMERS.filter(c=>c.returns>=2).length,
  }),[]);

  const handleSort = k=>setSort(s=>({key:k,dir:s.key===k&&s.dir==="asc"?"desc":"asc"}));
  const handleSelect = (id,checked)=>setSelected(s=>{const n=new Set(s);checked?n.add(id):n.delete(id);return n;});
  const handleSelectAll = checked=>setSelected(checked?new Set(paginated.map(c=>c.id)):new Set());
  const clearFilters = ()=>{setFilters({search:"",risk:"",status:"",cod:"",city:"",courier:""});setActiveTab("all");setPage(1);};

  return (
    <div className="min-h-full p-4 lg:p-6">
      <PageHeader total={MOCK_CUSTOMERS.length}/>
      <InsightCards customers={MOCK_CUSTOMERS}/>
      <FilterBar filters={filters} setFilters={v=>{setFilters(v);setPage(1);}} onClear={clearFilters}/>
      <SegmentTabs active={activeTab} onChange={t=>{setActiveTab(t);setPage(1);setSelected(new Set());}} counts={counts}/>

      {/* Bulk bar */}
      {selected.size>0&&(
        <div className="flex items-center gap-3 px-4 py-2.5 mb-3 rounded-xl bg-amber-400/5 border border-amber-400/20 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-400 flex items-center justify-center"><span className="text-[10px] font-bold text-black">{selected.size}</span></div>
            <span className="text-xs font-semibold text-amber-400">customers selected</span>
          </div>
          <div className="w-px h-4 bg-white/10"/>
          {[{l:"Export",icon:Download},{l:"Verify",icon:UserCheck},{l:"Blacklist",icon:Ban,d:true}].map(({l,icon:I,d})=>(
            <button key={l} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${d?"text-red-400 border-red-400/20 bg-red-400/5 hover:bg-red-400/10":"text-slate-300 border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08]"}`}><I size={12}/>{l}</button>
          ))}
          <button onClick={()=>setSelected(new Set())} className="ml-auto text-slate-500 hover:text-slate-300 p-1"><X size={14}/></button>
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block bg-[#13151f] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <TableHead sort={sort} onSort={handleSort} allSelected={paginated.length>0&&paginated.every(c=>selected.has(c.id))} onSelectAll={handleSelectAll}/>
            <tbody>
              {loading ? Array.from({length:perPage}).map((_,i)=><SkeletonRow key={i}/>)
               : paginated.length===0 ? <EmptyState/>
               : paginated.map(c=><TableRow key={c.id} customer={c} selected={selected.has(c.id)} onSelect={handleSelect} onView={setDrawer}/>)}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={filtered.length} perPage={perPage} onPage={setPage} onPerPage={setPerPage}/>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden space-y-3">
        {loading ? Array.from({length:4}).map((_,i)=>(
          <div key={i} className="bg-[#13151f] border border-white/[0.06] rounded-xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-full bg-white/[0.06]"/><div className="space-y-2 flex-1"><div className="h-3 bg-white/[0.06] rounded w-28"/><div className="h-2.5 bg-white/[0.04] rounded w-20"/></div></div>
            <div className="h-2.5 bg-white/[0.04] rounded w-full mb-2"/><div className="h-2.5 bg-white/[0.04] rounded w-3/4"/>
          </div>
        )) : paginated.length===0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4"><Inbox size={28} className="text-slate-600"/></div>
            <h3 className="text-base font-bold text-white mb-1" style={{fontFamily:"'Syne', sans-serif"}}>No customers found</h3>
            <p className="text-sm text-slate-600 mb-5">Try adjusting your filters.</p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"><Upload size={14}/>Import Customers</button>
          </div>
        ) : paginated.map(c=><CustomerCard key={c.id} customer={c} onView={setDrawer}/>)}
        {paginated.length>0&&<div className="bg-[#13151f] border border-white/[0.06] rounded-xl"><Pagination page={page} total={filtered.length} perPage={perPage} onPage={setPage} onPerPage={setPerPage}/></div>}
      </div>

      <CustomerDrawer customer={drawer} onClose={()=>setDrawer(null)}/>
    </div>
  );
}
