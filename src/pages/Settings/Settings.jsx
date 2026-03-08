import React, { useState } from 'react'
import { Info, Upload, Save, ChevronRight, Globe, Shield, Bell, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { useTheme } from '../../components/Layout/ThemeContext'
import logoUrl from '/Images/Logo.png'

const NAV = [
  { label: 'General', icon: Info, active: true },
  { label: 'About', icon: Globe, active: false },
  { label: 'Contact', icon: Shield, active: false },
  { label: 'SEO Config', icon: Bell, active: false },
]

const FieldRow = ({ label, value, editable = false }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
    {editable ? (
      <input className="auth-input" defaultValue={value} />
    ) : (
      <div className="h-12 px-4 flex items-center rounded-xl border border-border/50 bg-secondary/30 text-sm font-semibold">
        {value}
      </div>
    )}
  </div>
)

const Settings = () => {
  const [activeNav, setActiveNav] = useState('General')
  const { darkMode, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 animate-in fade-in duration-400">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Website Settings</h1>
          <p className="page-subtitle">Manage global configuration and platform assets</p>
        </div>
        <Button onClick={toggleTheme} variant="outline" className="rounded-xl gap-2">
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-7 mt-2">
        {/* Side Nav */}
        <div className="lg:w-56 shrink-0 space-y-1">
          {NAV.map(link => (
            <button
              key={link.label}
              onClick={() => setActiveNav(link.label)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeNav === link.label
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"}`}
            >
              <div className="flex items-center gap-2.5">
                <link.icon size={15} />
                {link.label}
              </div>
              {activeNav === link.label && <ChevronRight size={13} className="text-primary" />}
            </button>
          ))}
        </div>

        {/* Settings Card */}
        <Card className="flex-1 rounded-2xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="px-7 pt-7 pb-5 border-b border-border/40">
            <CardTitle className="text-base font-extrabold">{activeNav}</CardTitle>
            <CardDescription className="text-xs">Update your platform configuration settings</CardDescription>
          </CardHeader>

          <CardContent className="p-7 space-y-8">
            {/* General Info */}
            <section className="space-y-5">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/60">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <FieldRow label="Website Name" value="Switch2iTech" editable />
                <FieldRow label="Support Email" value="support@switch2itech.com" editable />
                <FieldRow label="Platform Version" value="v2.0.4" />
                <FieldRow label="Environment" value="Production" />
              </div>
            </section>

            {/* Logo Upload */}
            <section className="space-y-4 pt-4 border-t border-border/40">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted-foreground/60">Website Logo</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-secondary/20 border border-dashed border-border px-6 py-5 rounded-2xl max-w-lg">
                <div className="h-20 w-20 bg-card rounded-xl flex items-center justify-center border border-border shadow-sm overflow-hidden shrink-0">
                  <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <Button variant="outline" className="rounded-xl gap-2 text-sm font-bold">
                    <Upload size={14} /> Upload New Logo
                  </Button>
                  <p className="text-[11px] text-muted-foreground">Recommended: 512×512px · PNG or JPG</p>
                </div>
              </div>
            </section>
          </CardContent>

          {/* Footer */}
          <div className="px-7 py-5 bg-secondary/20 border-t border-border/40 flex items-center justify-end">
            <Button className="gap-2 rounded-xl shadow-sm shadow-primary/20 font-bold">
              <Save size={15} /> Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Settings