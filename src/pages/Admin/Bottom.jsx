import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar'
import { MoreHorizontal, ArrowUpRight, CalendarDays, Users } from 'lucide-react'

const PROJECTS = [
  {
    name: 'Enterprise CRM Revamp',
    client: 'Global Tech Solutions',
    ref: '#1002',
    progress: 72,
    priority: { label: 'High', color: 'bg-red-500/10 text-red-600 border-red-500/20' },
    status: { label: 'In Progress', dot: 'bg-primary animate-pulse', text: 'text-primary' },
    deadline: 'Oct 12, 2025',
    team: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
    ],
    extra: '+3',
  },
  {
    name: 'Cloud Migration Phase 2',
    client: 'Nexus Logistics',
    ref: '#1003',
    progress: 34,
    priority: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    status: { label: 'Planning', dot: 'bg-emerald-500', text: 'text-emerald-600' },
    deadline: 'Nov 05, 2025',
    team: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
    ],
    extra: null,
  },
  {
    name: 'Mobile App Redesign',
    client: 'Swift Dynamics',
    ref: '#1004',
    progress: 91,
    priority: { label: 'Low', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    status: { label: 'Review', dot: 'bg-violet-500', text: 'text-violet-600' },
    deadline: 'Sep 28, 2025',
    team: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=50&h=50&fit=crop',
    ],
    extra: '+1',
  },
]

const progressColor = (p) => {
  if (p >= 80) return 'from-emerald-400 to-teal-500'
  if (p >= 50) return 'from-blue-400 to-primary'
  return 'from-amber-400 to-orange-500'
}

const Bottom = () => (
  <div className="dashboard-glass overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-7 py-5 border-b border-border/30">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Project Pipeline</h2>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">Active Engagements</p>
      </div>
      <button className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity px-3 py-1.5 rounded-xl bg-primary/8 border border-primary/15">
        View All <ArrowUpRight size={12} />
      </button>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/40 border-b border-border/20">
            <th className="px-7 py-4">Project</th>
            <th className="px-5 py-4 hidden md:table-cell">Stakeholder</th>
            <th className="px-5 py-4">Progress</th>
            <th className="px-5 py-4 hidden sm:table-cell">Priority</th>
            <th className="px-5 py-4 hidden lg:table-cell">Status</th>
            <th className="px-5 py-4 hidden lg:table-cell">
              <CalendarDays size={11} className="inline mr-1" />Deadline
            </th>
            <th className="px-5 py-4 text-center hidden md:table-cell">
              <Users size={11} className="inline mr-1" />Team
            </th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {PROJECTS.map((project, index) => (
            <tr key={index} className="group hover:bg-primary/2 transition-colors duration-150">

              {/* Project */}
              <td className="px-7 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-border/40 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                    {project.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</p>
                    <p className="text-[11px] text-muted-foreground/50 mt-0.5 font-medium">{project.ref}</p>
                  </div>
                </div>
              </td>

              {/* Client */}
              <td className="px-5 py-5 hidden md:table-cell">
                <span className="text-sm font-semibold text-muted-foreground">{project.client}</span>
              </td>

              {/* Progress */}
              <td className="px-5 py-5">
                <div className="w-28 space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>Done</span>
                    <span className="text-foreground tabular-nums">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${progressColor(project.progress)} rounded-full transition-all duration-700 shadow-sm`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </td>

              {/* Priority */}
              <td className="px-5 py-5 hidden sm:table-cell">
                <span className={`text-[10px] font-black uppercase tracking-tight px-2.5 py-1 rounded-lg border ${project.priority.color}`}>
                  {project.priority.label}
                </span>
              </td>

              {/* Status */}
              <td className="px-5 py-5 hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${project.status.dot}`} />
                  <span className={`text-xs font-bold ${project.status.text}`}>{project.status.label}</span>
                </div>
              </td>

              {/* Deadline */}
              <td className="px-5 py-5 hidden lg:table-cell">
                <span className="text-xs text-muted-foreground font-medium">{project.deadline}</span>
              </td>

              {/* Team */}
              <td className="px-5 py-5 hidden md:table-cell">
                <div className="flex items-center justify-center -space-x-2">
                  {project.team.map((img, i) => (
                    <Avatar key={i} className="w-7 h-7 border-2 border-card ring-1 ring-border/30">
                      <AvatarImage src={img} alt="member" className="object-cover" />
                      <AvatarFallback className="text-[8px] font-black bg-gradient-to-br from-primary/20 to-violet-500/20">US</AvatarFallback>
                    </Avatar>
                  ))}
                  {project.extra && (
                    <div className="w-7 h-7 rounded-full bg-secondary border-2 border-card ring-1 ring-border/30 flex items-center justify-center text-[9px] font-black text-muted-foreground">
                      {project.extra}
                    </div>
                  )}
                </div>
              </td>

              {/* Action */}
              <td className="px-5 py-5">
                <button className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground/40 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

export default Bottom