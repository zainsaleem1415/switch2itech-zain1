import React, { useState, useEffect } from "react"
import projectService from "../../api/projectService"
import {
  TrendingUp, DollarSign, Briefcase, CreditCard,
  Clock, Download, Calendar, ArrowUpRight, Search, Loader2, Play
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"

const Revenuepage = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await projectService.getAllProjects()
        const mapped = (res.data?.data || []).map(p => ({
          _id: p._id,
          projectName: p.title || p.name,
          client: p.clients?.[0]?.name || "Internal App",
          amount: p.budget || 0,
          status: p.status?.toLowerCase() === 'completed' ? "Paid" : "Pending",
          date: new Date(p.startDate || Date.now()).toLocaleDateString(),
          paymentMethod: p.clients?.length > 0 ? "Bank Transfer" : "Internal Funding",
          category: p.category || "Development",
        }))
        setTransactions(mapped)
      } catch (err) {
        console.error("Failed to fetch revenue/projects:", err)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const total = transactions.reduce((s, t) => s + (t.amount || 0), 0)
  const pending = transactions.filter(t => t.status === "Pending").reduce((s, t) => s + (t.amount || 0), 0)
  const paid = total - pending;

  const stats = [
    { label: "Total Revenue", value: `$${(total / 1000).toFixed(1)}k`, trend: "+18%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Pending Invoices", value: `$${(pending / 1000).toFixed(1)}k`, trend: `${transactions.filter(t => t.status === "Pending").length} items`, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Project Earnings", value: `$${(paid / 1000).toFixed(1)}k`, trend: `${total ? Math.round((paid / total) * 100) : 0}% collected`, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Average Deal Size", value: `$${Math.round(total / Math.max(transactions.length, 1)).toLocaleString()}`, trend: "+5%", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ]

  const filtered = transactions.filter(t =>
    (t.projectName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.client || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-in fade-in duration-400">

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                <DollarSign size={12} />
                Finance Department
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text py-1">Financial Overview</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Track project earnings, automated invoices, transaction history, and fiscal growth in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-5 rounded-xl font-bold gap-2 hover:bg-secondary/80">
              <Calendar size={16} /> Last 30 Days
            </Button>
            <Button className="h-11 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-teal-500 hover:to-emerald-500 border-0 text-white transition-all">
              <Download size={16} /> Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="metric-card ring-1 ring-border/50 bg-card/40 hover:bg-card">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest">
                {s.trend}
              </Badge>
            </div>
            <h2 className="text-3xl font-black tabular-nums">{s.value}</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Ledger */}
        <div className="lg:col-span-2 dashboard-glass rounded-2xl overflow-hidden border-border/50 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-5 border-b border-border/40 bg-card/30 gap-4">
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Revenue Ledger</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Earnings breakdown by project budget via API</p>
            </div>
            <div className="relative w-full md:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Search projects…"
                className="pl-9 h-10 rounded-xl text-sm bg-background border-border/50 focus-visible:ring-primary shadow-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20 border-b border-border/40 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                  <th className="px-6 py-4">Project &amp; Client</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold">
                      <Loader2 className="animate-spin inline mr-2" size={16} /> Syncing Finances...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold italic">
                      No financial records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(item => (
                    <tr key={item._id} className="group hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-sm">{item.projectName}</p>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{item.client}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="border border-border/50 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-black text-sm text-foreground tabular-nums">
                        ${(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`border rounded-lg text-[9px] font-black uppercase px-2 py-0.5 tracking-widest ${item.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors opacity-100 lg:opacity-0 group-hover:opacity-100">
                          <ArrowUpRight size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-glass rounded-2xl overflow-hidden border-border/50 shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-border/40 bg-card/30">
            <h2 className="text-base font-extrabold tracking-tight">Recent Activity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Incoming payments and audits</p>
          </div>

          <div className="p-0 divide-y divide-border/30">
            {loading ? (
              <div className="p-8 text-center"><Loader2 size={24} className="animate-spin text-muted-foreground mx-auto" /></div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-muted-foreground">No recent activity.</div>
            ) : (
              transactions.slice(0, 7).map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${item.status === "Paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border/50"}`}>
                    <CreditCard size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-extrabold truncate">{item.client}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-0.5">{item.paymentMethod} • {item.date}</p>
                  </div>
                  <span className={`text-sm font-black tabular-nums shrink-0 ${item.status === "Paid" ? "text-emerald-500" : "text-amber-500"}`}>
                    {item.status === "Paid" ? "+" : ""}${(item.amount || 0).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-border/40 bg-card/10 mt-auto">
            <Button variant="outline" className="w-full rounded-xl font-bold text-[10px] uppercase tracking-widest border-border/50 hover:bg-secondary">
              View All Transactions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Revenuepage