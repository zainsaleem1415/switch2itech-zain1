import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import testimonialService from "../../api/testimonialService"
import {
  Star, MessageSquare, Clock, Award, Search,
  Trash2, Eye, ThumbsUp, CheckCircle2,
  Loader2, Globe, ArrowLeft
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"

const Testimonialspage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const FILTER_TABS = [
    { label: "All", value: "All" },
    { label: "Published", value: "Published" },
    { label: "Review", value: "Review" },
    { label: "Pending", value: "Pending" },
  ]

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const res = await testimonialService.getTestimonials()
      setReviews(res.data?.data || [])
    } catch (err) {
      console.error("Failed to fetch testimonials:", err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const handleApprove = async (id, current) => {
    try {
      await testimonialService.approveTestimonial(id, { isApproved: !current })
      // Or if approve is standalone boolean flag update: updateTestimonial(id, { isApproved })
      setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: !current } : r))
    } catch {
      console.error("Failed to update approval status")
    }
  }

  const handleToggleFeatured = async (id, current) => {
    try {
      await testimonialService.updateTestimonial(id, { isFeatured: !current })
      setReviews(prev => prev.map(r => r._id === id ? { ...r, isFeatured: !current } : r))
    } catch {
      console.error("Failed to toggle featured status")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return
    try {
      await testimonialService.deleteTestimonial(id)
      setReviews(prev => prev.filter(r => r._id !== id))
    } catch {
      console.error("Failed to delete testimonial")
    }
  }

  const stats = [
    { label: "Total Reviews", value: reviews.length, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Average Rating", value: `${(reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / Math.max(reviews.length, 1)).toFixed(1)} ★`, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Approval", value: reviews.filter(r => !r.isApproved).length, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
  ]

  const filtered = reviews.filter(r => {
    const name = r.authorNameOverride || r.author?.name || r.clientName || ""
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === "All"
      || (activeTab === "Published"
        ? r.isApproved
        : activeTab === "Review"
          ? r.isFeatured
          : !r.isApproved)
    return matchesTab && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 space-y-8 animate-in fade-in duration-400">

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-4 sm:px-6 md:px-8 py-6 sm:py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link to="/" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors">
                <ArrowLeft size={12} />
                Dashboard
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                <Globe size={12} />
                Public Relations
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text py-1">Testimonials & Reviews</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Curate, moderate, and publish client feedback to feature on the main landing pages.
            </p>
          </div>
          <div className="w-full md:w-auto flex items-center gap-3">
            <Button className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 rounded-xl font-bold gap-2 shadow-lg shadow-amber-500/20 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-500 border-0 text-white transition-all text-xs sm:text-sm">
              <ThumbsUp size={16} /> Add Review Manually
            </Button>
          </div>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="metric-card ring-1 ring-border/50 bg-card/40 hover:bg-card">
            <div className={`inline-flex p-3 rounded-xl ${s.bg} mb-4`}>
              <s.icon size={20} className={s.color} />
            </div>
            <h3 className="text-3xl font-black tracking-tight tabular-nums">{loading ? "—" : s.value}</h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="dashboard-glass rounded-2xl overflow-hidden border-border/50 shadow-sm">
        {/* Filter bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-3 sm:px-6 py-4 sm:py-5 border-b border-border/40 bg-card/30">
          <div className="grid grid-cols-2 sm:flex items-center gap-1 bg-secondary/50 p-1 rounded-xl w-full sm:w-fit border border-border/50">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-center whitespace-nowrap ${activeTab === tab.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Search by client name…"
              className="pl-9 h-10 rounded-xl text-sm bg-background border-border/50 focus-visible:ring-primary shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-0 divide-y divide-border/30">
          {loading && filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
              <Loader2 size={32} className="animate-spin opacity-50 text-amber-500" />
              <p className="font-extrabold uppercase tracking-widest text-xs">Fetching Testimonials...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
              <MessageSquare size={32} className="opacity-30" />
              <p className="font-extrabold text-sm">No reviews found.</p>
            </div>
          ) : (
            filtered.map(review => {
              const name = review.authorNameOverride || review.author?.name || review.clientName || "Anonymous"
              const avatar = review.authorAvatarOverride || review.author?.profile || review.avatar || `https://i.pravatar.cc/150?u=${review._id}`
              return (
                <div key={review._id} className="group p-4 sm:p-6 hover:bg-secondary/20 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4 sm:gap-6">
                    {/* Author */}
                    <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-60 shrink-0">
                      <img src={avatar} className="h-12 w-12 rounded-xl border border-border/60 object-cover shadow-sm group-hover:border-amber-500/50 transition-colors" alt="" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm">{name}</h4>
                          {review.isFeatured && (
                            <Badge onClick={() => handleToggleFeatured(review._id, review.isFeatured)}
                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-500/30 text-[9px] font-black uppercase cursor-pointer px-2 py-0.5 rounded-full transition-colors">
                              <Award size={10} className="mr-1 inline" /> Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{review.authorRoleOverride || review.author?.role || "Client"}</p>
                        <div className="flex text-amber-500 gap-0.5 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < (review.rating || 5) ? "currentColor" : "none"} strokeWidth={2} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">"{review.content}"</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.15em] mt-3">
                        Received on {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <Badge className={`border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 ${review.isApproved ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-amber-500/10 text-amber-600 border-amber-500/30"}`}>
                        {review.isApproved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {review.isApproved ? "Published" : "Pending"}
                      </Badge>
                      {!review.isApproved ? (
                        <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest rounded-lg text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500 transition-colors shadow-sm" onClick={() => handleApprove(review._id, review.isApproved)}>
                          Approve
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary text-emerald-600" onClick={() => handleApprove(review._id, review.isApproved)} title="Unpublish">
                          <Eye size={14} />
                        </Button>
                      )}

                      {!review.isFeatured && review.isApproved && (
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-amber-500 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500 transition-colors shadow-sm" onClick={() => handleToggleFeatured(review._id, review.isFeatured)} title="Feature">
                          <Award size={14} />
                        </Button>
                      )}

                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" onClick={() => handleDelete(review._id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Testimonialspage
