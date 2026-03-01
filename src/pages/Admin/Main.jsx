import React from 'react'
import { ArrowUpRight, TrendingUp, TrendingDown, Activity } from 'lucide-react'

const Main = () => {
  const chartData = [28, 45, 32, 78, 52, 88, 64, 92, 70, 96, 80, 100]
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  const getSmoothPath = () => {
    const points = chartData.map((val, i) => ({ x: (i / (chartData.length - 1)) * 100, y: 100 - val }))
    if (points.length === 0) return ''
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i], next = points[i + 1]
      const cp1x = curr.x + (next.x - curr.x) / 3
      const cp2x = curr.x + 2 * (next.x - curr.x) / 3
      d += ` C ${cp1x},${curr.y} ${cp2x},${next.y} ${next.x},${next.y}`
    }
    return d
  }

  const smoothPath = getSmoothPath()
  const areaPath = `${smoothPath} L 100,100 L 0,100 Z`

  // Radial progress component
  const RadialRing = ({ value, size = 80, stroke = 6, color, bg, label, sublabel, trend }) => {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const dash = (value / 100) * circ
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
            <circle
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black tracking-tight">{value}%</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold tracking-tight">{label}</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            {trend > 0
              ? <TrendingUp size={9} className="text-emerald-500" />
              : <TrendingDown size={9} className="text-red-500" />}
            <span className="text-[10px] text-muted-foreground">{sublabel}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 items-stretch min-h-[400px]">

      {/* ── Area Chart Card ──────────────────────────────────────────── */}
      <div className="lg:w-[68%] dashboard-glass p-7 flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-base font-extrabold tracking-tight">Project Intelligence</h2>
            </div>
            <p className="text-xs text-muted-foreground">Performance analytics · Real-time</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Activity size={11} className="text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">+18.4%</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 relative min-h-[200px]">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[9px] font-bold text-muted-foreground/40 tracking-tighter">
            {['100', '75', '50', '25', '0'].map(v => <span key={v}>{v}</span>)}
          </div>

          {/* Chart area */}
          <div className="absolute left-6 right-0 top-0 bottom-8">
            {/* Grid */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-t border-dashed border-border/20 h-0" />
              ))}
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                  <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(221 83% 65%)" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <path d={areaPath} fill="url(#areaGrad)" />
              <path d={smoothPath} fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" filter="url(#glow)" />
              {chartData.map((val, i) => (
                <circle
                  key={i}
                  cx={(i / (chartData.length - 1)) * 100}
                  cy={100 - val}
                  r="1.8"
                  className="fill-background stroke-primary cursor-pointer hover:r-3 transition-all"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          </div>

          {/* X labels */}
          <div className="absolute bottom-0 left-6 right-0 flex justify-between">
            {months.map((m) => (
              <span key={m} className="text-[9px] font-black text-muted-foreground/35 tracking-tighter w-0 flex justify-center">{m}</span>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-gradient-to-r from-blue-400 to-primary rounded-full" />
            <span className="text-[10px] font-bold text-muted-foreground">Project Velocity</span>
          </div>
          <div className="ml-auto text-xs font-bold text-muted-foreground">
            Peak: <span className="text-foreground">Dec</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel ─────────────────────────────────────────────── */}
      <div className="lg:w-[32%] flex flex-col gap-4">

        {/* Radial rings card */}
        <div className="dashboard-glass p-6 flex-1">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <h3 className="text-sm font-extrabold tracking-tight">Performance KPIs</h3>
          </div>
          <div className="flex justify-around items-center">
            <RadialRing
              value={85} size={84} stroke={7}
              color="hsl(221 83% 53%)" bg="hsl(221 83% 53% / 0.1)"
              label="Efficiency" sublabel="+4.2% wk" trend={1}
            />
            <div className="w-px h-16 bg-border/50" />
            <RadialRing
              value={92} size={84} stroke={7}
              color="hsl(142 71% 45%)" bg="hsl(142 71% 45% / 0.1)"
              label="Satisfaction" sublabel="+2.1% wk" trend={1}
            />
          </div>
        </div>

        {/* Active milestone card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-violet-700 p-6 text-white shadow-xl shadow-primary/25 border border-white/10 min-h-[150px] flex flex-col justify-end">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-14 -mt-14 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-xl" />
          <div className="absolute top-4 right-4">
            <ArrowUpRight size={16} className="text-white/50" />
          </div>
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm">
              <Activity size={11} className="text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">Active Milestone</span>
            </div>
            <p className="text-sm font-bold leading-snug tracking-tight">
              Q1 Infrastructure Review & Deployment Audit
            </p>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-black text-blue-100 uppercase tracking-tight">
                <span>Completion</span>
                <span className="text-white">65%</span>
              </div>
              <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[65%] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Main