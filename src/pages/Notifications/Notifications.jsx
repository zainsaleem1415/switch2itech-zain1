import React from 'react'
import { Bell, Plus, Megaphone, Info } from 'lucide-react'
import { Button } from '../../components/ui/button'

const Notifications = () => {
  return (
    <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 animate-in fade-in duration-400">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Manage system notifications and alerts.</p>
        </div>
        <Button className="gap-2 rounded-xl shadow-sm shadow-primary/20">
          <Plus size={15} /> New Announcement
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-border mb-10" />

      {/* Empty state */}
      <div className="flex items-center justify-center min-h-[55vh]">
        <div className="max-w-sm w-full flex flex-col items-center text-center gap-5">
          {/* Icon bubble */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bell size={36} className="text-primary" />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
              <span className="text-[9px] font-black text-primary-foreground">0</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-extrabold tracking-tight">No announcements yet</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create your first system notification to keep your team informed.
            </p>
          </div>

          {/* Info strip */}
          <div className="w-full p-4 rounded-2xl bg-secondary/50 border border-border/50 flex items-start gap-3 text-left">
            <Info size={15} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Announcements are visible to all users in their notification feed. Use them for important updates and alerts.
            </p>
          </div>

          <Button
            variant="outline"
            className="gap-2 rounded-xl border-dashed border-2 w-full hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Megaphone size={15} /> Create First Announcement
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Notifications