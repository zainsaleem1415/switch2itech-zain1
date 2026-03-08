import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell, Calendar, ChevronRight, Sun, Moon, Menu } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeContext'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const Navbar = ({ onMenuClick }) => {
  const { darkMode, toggleTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef(null)

  const pages = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Clients', path: '/clients' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Products', path: '/products' },
  ]

  const segments = location.pathname.split('/').filter(Boolean)
  const routeStateProjectName =
    location.state?.project?.title ||
    location.state?.project?.name ||
    location.state?.projectName ||
    null

  const isProjectDetailRoute =
    (segments[0] === 'projects' && segments.length === 2) ||
    (segments[0] === 'admin' && segments[1] === 'projects' && segments.length === 3)

  const currentPage = isProjectDetailRoute
    ? (routeStateProjectName || 'Project Detail')
    : segments.length === 0
      ? 'Overview'
      : segments[segments.length - 1].charAt(0).toUpperCase() + segments[segments.length - 1].slice(1)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    if (value.trim().length > 0) {
      setSuggestions(pages.filter(p => p.name.toLowerCase().includes(value.toLowerCase())))
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (path) => {
    navigate(path)
    setSearchQuery('')
    setShowSuggestions(false)
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) handleSuggestionClick(suggestions[0].path)
  }

  return (
    <header className="min-h-16 px-2 sm:px-4 md:px-6 py-2 md:py-0 flex items-center justify-between gap-2 shrink-0 border-b border-border bg-card transition-colors duration-300 relative">

      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 text-sm select-none min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 md:hidden shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={17} />
        </Button>
        <span className="text-muted-foreground font-medium hidden sm:inline">Dashboard</span>
        <ChevronRight size={13} className="text-muted-foreground/40" />
        <span className="font-bold text-foreground tracking-tight truncate">{currentPage}</span>
      </div>

      {/* ── Search ──────────────────────────────────────────────── */}
      <div className="hidden sm:block flex-1 max-w-sm mx-2 md:mx-6 relative" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search pages…"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            className="pl-9 h-9 bg-secondary/40 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/25 text-sm placeholder:text-muted-foreground/60"
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => handleSuggestionClick(s.path)}
                className="px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between group"
              >
                <span className="font-medium">{s.name}</span>
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        {/* Divider */}
        <div className="h-5 w-px bg-border mx-0.5 sm:mx-1" />

        {/* Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setShowNotifications(!showNotifications); setShowCalendar(false) }}
            className={`relative h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 ${showNotifications ? 'bg-primary/10 text-primary' : ''}`}
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 border border-card rounded-full" />
          </Button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] max-w-72 sm:w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">0 New</span>
                </div>
                <div className="p-4 sm:p-8 text-center">
                  <div className="mx-auto w-10 h-10 bg-secondary rounded-full flex items-center justify-center mb-3">
                    <Bell size={16} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold">All caught up</p>
                  <p className="text-xs text-muted-foreground mt-1">No new alerts.</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Calendar */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setShowCalendar(!showCalendar); setShowNotifications(false) }}
            className={`h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 ${showCalendar ? 'bg-primary/10 text-primary' : ''}`}
          >
            <Calendar size={17} />
          </Button>

          {showCalendar && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
              <div className="absolute right-0 top-full mt-2 w-[calc(100vw-1rem)] max-w-72 sm:w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Schedule</h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Today</span>
                </div>

                <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 mb-4">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Upcoming</p>
                  <p className="text-xs font-semibold mt-1">Client Presentation</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] text-muted-foreground">14:30 PM — Room 4</p>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground/50 pb-2 border-b border-border/40">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mt-2">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className={`py-1.5 text-[10px] rounded-lg cursor-pointer transition-colors ${i === 6
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'text-foreground hover:bg-secondary'
                        }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full mt-3 h-7 text-[10px] font-bold text-primary hover:bg-primary/5">
                  View Full Calendar
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </Button>
      </div>
    </header>
  )
}

export default Navbar
