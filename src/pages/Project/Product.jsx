/**
 * PUBLIC PROJECTS PAGE  (/projects)
 * ---------------------------------------------------------------------------
 * 100 % visually synchronized with /admin/projects.
 * Same design tokens, same card layout, same filter tabs, same status colors.
 * Admins/Managers see the "+ New Project" button; clicking navigates to the
 * shared Addproject form page. Clicking a card navigates to /projects/:id.
 */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import projectService from "../../api/projectService";
import { useAuth } from "../../context/ContextProvider";
import { toast } from "react-hot-toast";
import {
  Search, Plus, ExternalLink, Loader2, AlertCircle,
  FolderGit2, Users, Calendar, Zap, CheckCircle2,
  Clock, PauseCircle, XCircle, LayoutGrid, List,
  ArrowRight, TrendingUp, RefreshCw,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getDisplayProgress } from "../../utils/projectProgress";

// ─── Shared design helpers (identical copy in Projectspage.jsx) ─────────────

export const STATUS_TABS = ["All", "Active", "Completed", "In Review", "Planning", "On Hold"];

export const getStatusConfig = (status = "") => {
  const s = status.toLowerCase();
  if (s === "completed") return { label: "Completed", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400", bar: "from-emerald-400 to-teal-500", pulse: false };
  if (s === "active" || s === "in-progress") return { label: "Active", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", dot: "bg-blue-400", bar: "from-blue-400 to-indigo-500", pulse: true };
  if (s === "in-review") return { label: "In Review", color: "bg-violet-500/15 text-violet-400 border-violet-500/30", dot: "bg-violet-400", bar: "from-violet-400 to-purple-500", pulse: false };
  if (s === "on-hold") return { label: "On Hold", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", dot: "bg-amber-400", bar: "from-amber-400 to-orange-400", pulse: false };
  if (s === "cancelled") return { label: "Cancelled", color: "bg-rose-500/15 text-rose-400 border-rose-500/30", dot: "bg-rose-400", bar: "from-rose-400 to-red-400", pulse: false };
  return { label: status || "Planning", color: "bg-secondary text-muted-foreground border-border/50", dot: "bg-muted-foreground/40", bar: "from-slate-400 to-gray-400", pulse: false };
};


export const getPrimaryImage = (project) => {
  if (project?.coverImage) return project.coverImage;
  if (Array.isArray(project?.images) && project.images.length > 0) return project.images[0];
  if (Array.isArray(project?.image) && project.image.length > 0) return project.image[0];
  if (project?.thumbnail) return project.thumbnail;
  return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";
};

const matchTab = (project, tab) => {
  const s = (project.status || "").toLowerCase();
  if (tab === "All") return true;
  if (tab === "Active") return s === "active" || s === "in-progress";
  if (tab === "Completed") return s === "completed";
  if (tab === "In Review") return s === "in-review";
  if (tab === "Planning") return s === "planning";
  if (tab === "On Hold") return s === "on-hold";
  return true;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const ProjectCard = ({ project, onClick }) => {
  const cfg = getStatusConfig(project.status);
  const progress = getDisplayProgress(project);
  return (
    <div
      onClick={() => onClick(project)}
      className="group bg-card border border-border/50 rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-muted flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
        <img src={getPrimaryImage(project)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {/* Status pill */}
        <div className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}${cfg.pulse ? " animate-pulse" : ""}`} />
          {cfg.label}
        </div>
        {/* Priority */}
        {project.priority && (
          <div className="absolute top-3 left-3 z-20">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border backdrop-blur-sm ${project.priority === "critical" ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : project.priority === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                : project.priority === "medium" ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-secondary text-muted-foreground border-border/50"
              }`}>{project.priority}</span>
          </div>
        )}
        {/* Team count */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-white/80 text-[11px] font-bold">
          <Users size={11} /><span>{project.teamMembers?.length || 0} devs</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-extrabold leading-tight mb-1 group-hover:text-primary transition-colors truncate">{project.title}</h3>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3 min-h-[2rem]">{project.description || "No description provided."}</p>
        {/* Tags */}
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map(t => (
              <span key={t} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{t}</span>
            ))}
            {project.tags.length > 3 && <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">+{project.tags.length - 3}</span>}
          </div>
        )}
        {/* Progress */}
        <div className="mb-3 mt-auto">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className={progress >= 80 ? "text-emerald-400" : progress >= 40 ? "text-blue-400" : "text-amber-400"}>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          {project.startDate
            ? <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold"><Calendar size={11} />{new Date(project.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
            : <span />
          }
          <div className="ml-auto flex items-center gap-1.5 text-primary text-xs font-bold group-hover:gap-2.5 transition-all">
            View <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectListRow = ({ project, onClick }) => {
  const cfg = getStatusConfig(project.status);
  const progress = getDisplayProgress(project);
  return (
    <div
      onClick={() => onClick(project)}
      className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-5 py-4 bg-card hover:bg-secondary/30 border border-border/50 rounded-2xl transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary/20"
    >
      <div className="col-span-5 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/60 group-hover:border-primary/30 transition-colors">
          <img src={getPrimaryImage(project)} alt={project.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-sm truncate group-hover:text-primary transition-colors">{project.title}</p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{project.description?.slice(0, 60) || "—"}</p>
        </div>
      </div>
      <div className="col-span-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}${cfg.pulse ? " animate-pulse" : ""}`} />
          {cfg.label}
        </span>
      </div>
      <div className="col-span-3 space-y-1">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-muted-foreground">Progress</span>
          <span className={progress >= 80 ? "text-emerald-400" : progress >= 40 ? "text-blue-400" : "text-amber-400"}>{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${cfg.bar}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-end gap-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold"><Users size={12} />{project.teamMembers?.length || 0}</div>
        <div className="h-8 w-8 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"><ExternalLink size={13} /></div>
      </div>
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const ProductDashboard = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const canManage = role === "admin" || role === "manager";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [layout, setLayout] = useState("grid");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await projectService.getAllProjects();
      setProjects(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Could not load projects. Please check the server connection.");
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = projects.filter(p =>
    ((p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) &&
    matchTab(p, activeTab)
  );

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? projects.length : projects.filter(p => matchTab(p, tab)).length;
    return acc;
  }, {});

  const handleCardClick = (project) => navigate(`/projects/${project._id}`, { state: { project } });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><FolderGit2 className="text-primary" size={26} /></div>
          <Loader2 className="animate-spin text-primary absolute -bottom-1 -right-1" size={18} />
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Projects</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4"><AlertCircle size={28} className="text-rose-500" /></div>
      <h2 className="text-lg font-bold mb-1">Connection Error</h2>
      <p className="text-muted-foreground text-sm mb-4">{error}</p>
      <Button onClick={() => fetchProjects()} className="rounded-xl gap-2"><RefreshCw size={14} />Retry</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">

      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden bg-card border-b border-border/40">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                  <FolderGit2 size={11} /> Portfolio
                </div>
              </div>
              <h1 className="text-4xl font-black tracking-tight gradient-text pb-1">Our Projects</h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-lg">
                Explore our portfolio of delivered solutions — from cutting-edge web applications to enterprise platforms.
              </p>
            </div>
            {/* Stats + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 p-3 bg-background rounded-2xl border border-border/50 shadow-sm">
                <div className="text-center px-3">
                  <p className="text-2xl font-black">{counts.All}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center px-3">
                  <p className="text-2xl font-black text-emerald-400">{counts.Completed}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Done</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center px-3">
                  <p className="text-2xl font-black text-blue-400">{counts.Active}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <Button onClick={() => navigate("/add-project")} className="h-11 px-6 rounded-xl font-bold gap-2 bg-gradient-to-r from-primary to-blue-600 border-0 shadow-lg shadow-primary/20 hover:from-blue-600 hover:to-primary transition-all">
                    <Plus size={16} strokeWidth={3} /> New Project
                  </Button>
                )}
                {role === "admin" && (
                  <Link to="/admin/projects" className="h-11 px-5 rounded-xl border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 hover:border-primary/50 flex items-center gap-2 text-sm font-bold transition-all">
                    <TrendingUp size={14} /> Manage
                  </Link>
                )}
                <button onClick={() => fetchProjects(true)} className="h-11 w-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all" title="Refresh">
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Toolbar ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-8">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-secondary/60 rounded-2xl border border-border/50">
              {STATUS_TABS.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}>
                  {tab}
                  {counts[tab] > 0 && (
                    <span className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-primary/10 text-primary" : "bg-border/80 text-muted-foreground"}`}>{counts[tab]}</span>
                  )}
                </button>
              ))}
            </div>
            {/* Layout + Search */}
            <div className="flex items-center gap-2">
              <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/40">
                <button onClick={() => setLayout("grid")} className={`p-1.5 rounded-lg transition-all ${layout === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={15} /></button>
                <button onClick={() => setLayout("list")} className={`p-1.5 rounded-lg transition-all ${layout === "list" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}><List size={15} /></button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-56 h-9 rounded-xl text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4"><FolderGit2 className="text-muted-foreground/40" size={28} /></div>
            <p className="font-bold text-lg">No projects found</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">{searchQuery ? "Try a different search term." : "No projects match this filter."}</p>
            {canManage && <Button onClick={() => navigate("/add-project")} variant="outline" className="rounded-xl gap-2"><Plus size={14} />Create project</Button>}
          </div>
        ) : layout === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => <ProjectCard key={p._id} project={p} onClick={handleCardClick} />)}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground bg-secondary/30 rounded-xl border border-border/40">
              <div className="col-span-5">Project</div><div className="col-span-2">Status</div><div className="col-span-3">Progress</div><div className="col-span-2 text-right">Team</div>
            </div>
            {filtered.map(p => <ProjectListRow key={p._id} project={p} onClick={handleCardClick} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
