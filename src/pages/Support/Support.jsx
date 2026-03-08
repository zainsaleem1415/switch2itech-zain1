import React from 'react'
import {
  Search, HelpCircle, MessageSquare, LifeBuoy,
  ArrowUpRight, CheckCircle2, AlertCircle, Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { dummyData } from '../../utility/dumydata'

const CHANNELS = [
  {
    icon: HelpCircle,
    title: 'Knowledge Base',
    desc: 'Read tutorials and guides for all products.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    accent: 'bg-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Community Forum',
    desc: 'Join discussions with other developers.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    accent: 'bg-indigo-500',
  },
  {
    icon: LifeBuoy,
    title: 'Direct Support',
    desc: 'Open a ticket with our expert team.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    accent: 'bg-emerald-500',
  },
]

const Support = () => {
  return (
    <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 space-y-10 animate-in fade-in duration-400">

      {/* Hero search header */}
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-5 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
          <LifeBuoy size={12} /> Support Center
        </div>
        <h1 className="text-4xl font-black tracking-tight">How can we help?</h1>
        <p className="text-muted-foreground text-sm">
          Search our knowledge base or get in touch with our expert support team.
        </p>
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search documentation, guides, FAQs..."
            className="pl-11 h-12 rounded-2xl border-border bg-card shadow-sm focus-visible:ring-primary/20 text-sm"
          />
        </div>
      </div>

      {/* Support channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CHANNELS.map((ch) => (
          <button
            key={ch.title}
            className={`stat-card flex flex-col items-center text-center gap-4 group cursor-pointer relative overflow-hidden`}
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${ch.accent} opacity-40 group-hover:opacity-100 transition-opacity`} />
            <div className={`p-4 ${ch.bg} border ${ch.border} rounded-2xl group-hover:scale-105 transition-transform`}>
              <ch.icon size={26} className={ch.color} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{ch.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{ch.desc}</p>
            </div>
            <div className={`text-xs font-bold ${ch.color} flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
              Learn more <ArrowUpRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Feedback */}
        <Card className="rounded-2xl border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-4">
            <div>
              <CardTitle className="text-base font-extrabold">Recent User Feedback</CardTitle>
              <CardDescription className="text-xs">Latest public reviews from users</CardDescription>
            </div>
            <Activity size={16} className="text-muted-foreground/40" />
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {dummyData.testimonials.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/40">
                <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                  {item.author.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold truncate">{item.author}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{item.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground italic line-clamp-1 mt-0.5">"{item.text}"</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Status */}
        <Card className="rounded-2xl border-border/50 bg-card">
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold">Platform Status</CardTitle>
                <CardDescription className="text-xs">Live health metrics</CardDescription>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">All Systems Go</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-1">
            {dummyData.analytics.slice(0, 5).map((stat) => (
              <div key={stat.id} className="flex items-center justify-between px-3.5 py-3 rounded-xl hover:bg-secondary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-1.5 w-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  <span className="text-sm font-medium">{stat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold">{stat.value}</span>
                  <ArrowUpRight size={13} className={stat.trend === 'up' ? 'text-emerald-500' : 'text-amber-500'} />
                </div>
              </div>
            ))}
            <div className="pt-4">
              <Button className="w-full rounded-xl gap-2 font-bold">
                <LifeBuoy size={16} /> Contact Support Team
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Support