import React, { useState, useEffect } from "react";
import projectService from "../../api/projectService";
import productService from "../../api/productService";
import userService from "../../api/userService";
import testimonialService from "../../api/testimonialService";
import {
  Monitor, Package, Users, Star,
  CircleDollarSign, ArrowUpRight, ArrowLeft, Loader2,
  LayoutDashboard, Sparkles,
} from "lucide-react";
import ProjectPage from "../Admindashboard/Projectspage";
import Productpage from "../Admindashboard/Productpage";
import Userspage from "../Admindashboard/Userspage";
import Testimonialspage from "../Admindashboard/Testimonialspage";
import Revenuepage from "../Admindashboard/Revenuepage";

const STAT_CONFIG = [
  {
    id: "projects",
    title: "Total Projects",
    label: "Live",
    icon: Monitor,
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/25",
    ring: "ring-blue-500/20",
    badge: "bg-blue-500/10 text-blue-600",
    bar: "bg-gradient-to-r from-blue-400 to-blue-600",
  },
  {
    id: "products",
    title: "Total Products",
    label: "In Stock",
    icon: Package,
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/25",
    ring: "ring-violet-500/20",
    badge: "bg-violet-500/10 text-violet-600",
    bar: "bg-gradient-to-r from-violet-400 to-purple-600",
  },
  {
    id: "users",
    title: "Manage Users",
    label: "Active",
    icon: Users,
    gradient: "from-orange-500 to-amber-500",
    glow: "shadow-orange-500/25",
    ring: "ring-orange-500/20",
    badge: "bg-orange-500/10 text-orange-600",
    bar: "bg-gradient-to-r from-orange-400 to-amber-500",
  },
  {
    id: "testimonials",
    title: "Testimonials",
    label: "Verified",
    icon: Star,
    gradient: "from-amber-400 to-yellow-500",
    glow: "shadow-amber-400/25",
    ring: "ring-amber-400/20",
    badge: "bg-amber-400/10 text-amber-600",
    bar: "bg-gradient-to-r from-amber-300 to-yellow-500",
  },
  {
    id: "revenue",
    title: "Total Revenue",
    label: "Budget",
    icon: CircleDollarSign,
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/25",
    ring: "ring-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-600",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
  },
];

const Top = ({ currentView, setCurrentView }) => {
  const [data, setData] = useState({ projects: 0, products: 0, users: 0, testimonials: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, prodRes, userRes, testRes] = await Promise.all([
          projectService.getAllProjects(),
          productService.getAllProducts(),
          userService.getUsers(),
          testimonialService.getTestimonials(),
        ]);
        const totalRevenue = projRes.data.data.reduce((sum, proj) => sum + (proj.budget || 0), 0);
        setData({
          projects: projRes.data.data.length,
          products: prodRes.data.data.length,
          users: userRes.data.data.length,
          testimonials: testRes.data.data.length,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentView === "overview") fetchDashboardData();
  }, [currentView]);

  const getValue = (id) => {
    if (loading) return "···";
    if (id === "revenue") return `$${data.revenue.toLocaleString()}`;
    return data[id];
  };

  const BackButton = () => (
    <button
      onClick={() => setCurrentView("overview")}
      className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80 transition-opacity mb-6 group"
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <ArrowLeft size={14} />
      </span>
      Back to Dashboard
    </button>
  );

  const renderView = () => {
    const views = { projects: ProjectPage, products: Productpage, users: Userspage, testimonials: Testimonialspage, revenue: Revenuepage };
    const View = views[currentView];
    return View ? <><BackButton /><View /></> : null;
  };

  if (currentView !== "overview") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
        {renderView()}
      </div>
    );
  }

  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-8 animate-in fade-in duration-400">

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/5 pointer-events-none" />
        {/* Decorative orbs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
                <LayoutDashboard size={11} />
                Admin Control Center
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
              {greeting}, Admin 👋
            </h1>
            <p className="text-sm text-muted-foreground font-medium">{dateStr}</p>
          </div>

          <div className="flex items-center gap-3">
            {loading && <Loader2 className="animate-spin text-primary" size={20} />}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/8 border border-primary/15">
              <Sparkles size={13} className="text-primary" />
              <span className="text-xs font-bold text-primary">Live Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAT_CONFIG.map((stat) => (
          <button
            key={stat.id}
            onClick={() => setCurrentView(stat.id)}
            className={`metric-card text-left group cursor-pointer ring-1 ${stat.ring} hover:shadow-xl ${stat.glow}`}
          >
            {/* Icon */}
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-md ${stat.glow} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>

            {/* Value */}
            <div className="space-y-0.5 mb-4">
              <h3 className="text-2xl font-black tracking-tight tabular-nums">
                {loading ? (
                  <span className="inline-block w-12 h-7 bg-muted animate-pulse rounded-lg" />
                ) : getValue(stat.id)}
              </h3>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${stat.badge}`}>
                {stat.label}
              </span>
              <ArrowUpRight size={14} className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </div>

            {/* Bottom accent bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${stat.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default Top;
