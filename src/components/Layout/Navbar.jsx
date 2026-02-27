import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell, Calendar, Plus, ChevronRight, UserPlus, BarChart, MessageSquarePlus, Sun, Moon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from './ThemeContext'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const Navbar = () => {
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

  const currentPath = location.pathname.split('/').pop()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPageName = () => {
    if (!currentPath || currentPath === '') return 'Overview'
    return currentPath.charAt(0).toUpperCase() + currentPath.slice(1)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.trim().length > 0) {
      const filtered = pages.filter(page =>
        page.name.toLowerCase().includes(value.toLowerCase())
      )
      setSuggestions(filtered)
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
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSuggestionClick(suggestions[0].path)
    }
  }

  return (
    <>
      <header className="h-20 px-8 flex items-center justify-between shrink-0 border-b border-border bg-card transition-colors duration-300 relative">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground font-medium">Dashboard</span>
          <ChevronRight size={14} className="text-muted-foreground/50" />
          <span className="text-foreground font-bold tracking-tight">
            {getPageName()}
          </span>
        </div>

        <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              className="pl-10 bg-secondary/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.path)}
                  className="px-4 py-3 text-sm text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <span>{suggestion.name}</span>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowCalendar(false)
                }}
                className={`relative text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg ${showNotifications ? 'bg-primary/10 text-primary' : ''}`}
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 border-2 border-card rounded-full" />
              </Button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="p-4 border-b border-border">
                      <h3 className="font-bold text-sm text-foreground">Notifications</h3>
                    </div>
                    <div className="p-8 text-center">
                      <div className="mx-auto w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                        <Bell size={20} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">Notifications</p>
                      <p className="text-xs text-muted-foreground mt-1">You have no new alerts.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCalendar(!showCalendar)
                  setShowNotifications(false)
                }}
                className={`text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg ${showCalendar ? 'bg-primary/10 text-primary' : ''}`}
              >
                <Calendar size={20} />
              </Button>

              {showCalendar && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                  <div className="absolute right-0 mt-3 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm text-foreground">Schedule</h3>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Today</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Upcoming Task</p>
                        <p className="text-xs font-semibold text-foreground mt-1">Client Presentation</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <p className="text-[10px] text-muted-foreground">14:30 PM - Room 4</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground/60 pb-2 border-b border-border/50">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {[...Array(31)].slice(0, 14).map((_, i) => (
                          <div key={i} className={`py-1.5 text-[10px] rounded-lg transition-colors cursor-pointer ${i === 6 ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground hover:bg-secondary'}`}>
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full mt-3 h-8 text-[10px] font-bold text-primary hover:bg-primary/5">
                      View Full Calendar
                    </Button>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

export default Navbar