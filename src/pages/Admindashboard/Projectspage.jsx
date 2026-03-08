/**
 * ADMIN PROJECT MANAGEMENT PAGE  (/admin/projects)
 * ---------------------------------------------------------------------------
 * 100 % visually identical to /projects.
 * Same card design, same tabs, same status colors — plus CRUD controls:
 *   - Create/Edit project (Addproject form rendered inline)
 *   - Delete with confirmation
 *   - Assign manager / developers / clients (dialog)
 *   - Monitor (ProjectMonitoring panel)
 *   - View detail (ProjectDetail embedded)
 *
 * All API calls go through projectService (GET, POST, PATCH, DELETE).
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import projectService from "../../api/projectService";
import userService from "../../api/userService";
import {
  Search, Plus, Loader2, AlertCircle, FolderGit2,
  Users, Edit3, Trash2, Eye, LayoutGrid, List,
  ArrowLeft, ShieldCheck, Zap, Target, RefreshCw,
  BarChart3, X,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import Addproject from "../Addproject/Addproject";
import ProjectMonitoring from "./ProjectMonitoring";
import ProjectDetail from "../Project/ProjectDetail";
import { getDisplayProgress } from "../../utils/projectProgress";

// ─── Shared design helpers (must mirror Product.jsx exactly) ─────────────────

const STATUS_TABS = ["All", "Active", "Completed", "In Review", "Planning", "On Hold"];

const getStatusConfig = (status = "") => {
  const s = status.toLowerCase();
  if (s === "completed") return { label: "Completed", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400", bar: "from-emerald-400 to-teal-500", pulse: false };
  if (s === "active" || s === "in-progress") return { label: "Active", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", dot: "bg-blue-400", bar: "from-blue-400 to-indigo-500", pulse: true };
  if (s === "in-review") return { label: "In Review", color: "bg-violet-500/15 text-violet-400 border-violet-500/30", dot: "bg-violet-400", bar: "from-violet-400 to-purple-500", pulse: false };
  if (s === "on-hold") return { label: "On Hold", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", dot: "bg-amber-400", bar: "from-amber-400 to-orange-400", pulse: false };
  if (s === "cancelled") return { label: "Cancelled", color: "bg-rose-500/15 text-rose-400 border-rose-500/30", dot: "bg-rose-400", bar: "from-rose-400 to-red-400", pulse: false };
  return { label: status || "Planning", color: "bg-secondary text-muted-foreground border-border/50", dot: "bg-muted-foreground/40", bar: "from-slate-400 to-gray-400", pulse: false };
};


const getPrimaryImage = (project) => {
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

// ─── Project Card (grid) — identical to public page + action buttons ─────────

const AdminProjectCard = ({ project, onView, onEdit, onDelete, onMonitor, onAssign }) => {
  const cfg = getStatusConfig(project.status);
  const progress = getDisplayProgress(project);
  return (
    <div className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Cover */}
      <div className="relative h-44 overflow-hidden bg-muted flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
        <img src={getPrimaryImage(project)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}${cfg.pulse ? " animate-pulse" : ""}`} />
          {cfg.label}
        </div>
        {project.priority && (
          <div className="absolute top-3 left-3 z-20">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border backdrop-blur-sm ${project.priority === "critical" ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
              : project.priority === "high" ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                : project.priority === "medium" ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-secondary text-muted-foreground border-border/50"
              }`}>{project.priority}</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-white/80 text-[11px] font-bold">
          <Users size={11} /><span>{project.teamMembers?.length || 0} devs</span>
        </div>
      </div>
      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-extrabold leading-tight mb-1 group-hover:text-primary transition-colors truncate">{project.title}</h3>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3 min-h-[2rem]">{project.description || "No description provided."}</p>
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map(t => (<span key={t} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-secondary rounded-full text-muted-foreground">{t}</span>))}
          </div>
        )}
        <div className="mb-3 mt-auto">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className={progress >= 80 ? "text-emerald-400" : progress >= 40 ? "text-blue-400" : "text-amber-400"}>{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${cfg.bar} transition-all duration-700`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        {/* Admin action row */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={() => onView(project)} title="View Detail"><Eye size={13} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-500/10 rounded-lg" onClick={() => onEdit(project)} title="Edit"><Edit3 size={13} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 rounded-lg" onClick={() => onDelete(project._id)} title="Delete"><Trash2 size={13} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 rounded-lg" onClick={() => onMonitor(project)} title="Monitor"><BarChart3 size={13} /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => onAssign(project)}
            className="h-7 px-3 text-[10px] font-black uppercase tracking-wider gap-1.5 rounded-lg border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary transition-colors">
            <Users size={10} /> Assign
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Project List Row (list) — identical to public + edit/delete ─────────────

const AdminListRow = ({ project, onView, onEdit, onDelete, onMonitor, onAssign }) => {
  const cfg = getStatusConfig(project.status);
  const progress = getDisplayProgress(project);
  return (
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-5 py-4 bg-card hover:bg-secondary/30 border border-border/50 rounded-2xl transition-all duration-200 hover:shadow-md hover:border-primary/15">
      <div className="col-span-4 flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/60 group-hover:border-primary/30 transition-colors">
          <img src={getPrimaryImage(project)} alt={project.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-extrabold text-sm truncate group-hover:text-primary transition-colors">{project.title}</p>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground font-bold">
            <span>{project.category || "General"}</span>
            {(project.teamMembers?.length > 0) && <><span className="opacity-30">·</span><Users size={9} /><span>{project.teamMembers.length}</span></>}
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}${cfg.pulse ? " animate-pulse" : ""}`} />{cfg.label}
        </span>
      </div>
      <div className="col-span-3 space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold">
          <span className="text-muted-foreground">Progress</span>
          <span className={progress >= 80 ? "text-emerald-400" : progress >= 40 ? "text-blue-400" : "text-amber-400"}>{progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${cfg.bar}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="col-span-3 flex items-center justify-end gap-1">
        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={() => onView(project)}><Eye size={13} /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-500/10 rounded-lg" onClick={() => onEdit(project)}><Edit3 size={13} /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 rounded-lg" onClick={() => onDelete(project._id)}><Trash2 size={13} /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 rounded-lg" onClick={() => onMonitor(project)}><BarChart3 size={13} /></Button>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" onClick={() => onAssign(project)}><Users size={13} /></Button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [layout, setLayout] = useState("grid");
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  // Assign dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignments, setAssignments] = useState({ manager: "", teamMembers: [], clients: [] });

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [projRes, userRes] = await Promise.all([
        projectService.getAllProjects(),
        userService.getUsers(),
      ]);
      setProjects(projRes.data?.data || []);
      setUsers(userRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const openAssign = (project) => {
    setSelectedProject(project);
    setAssignments({
      manager: project.manager?._id || project.manager || "",
      teamMembers: project.teamMembers?.map(t => t._id || t) || [],
      clients: project.clients?.map(c => c._id || c) || [],
    });
    setAssignOpen(true);
  };

  const saveAssign = async () => {
    try {
      await projectService.assignProject(selectedProject._id, assignments);
      toast.success("Assignments saved.");
      await fetchData(true);
      setAssignOpen(false);
    } catch {
      toast.error("Failed to save assignments.");
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = projects.filter(p =>
    (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) &&
    matchTab(p, activeTab)
  );

  const counts = STATUS_TABS.reduce((acc, tab) => {
    acc[tab] = tab === "All" ? projects.length : projects.filter(p => matchTab(p, tab)).length;
    return acc;
  }, {});

  const completedCount = projects.filter(p => (p.status || "").toLowerCase() === "completed").length;
  const activeCount = projects.filter(p => ["active", "in-progress"].includes((p.status || "").toLowerCase())).length;
  const reviewCount = projects.filter(p => (p.status || "").toLowerCase() === "in-review").length;

  // ── Sub-views ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><FolderGit2 className="text-primary" size={26} /></div>
          <Loader2 className="animate-spin text-primary absolute -bottom-1 -right-1" size={18} />
        </div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Projects</p>
      </div>
    </div>
  );


  // ── Main list view ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">

      {/* ── HERO HEADER (identical gradient treatment to public page) ── */}
      <div className="relative overflow-hidden bg-card border-b border-border/40">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1400px] mx-auto px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4">
            <Link to="/" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors">
              <ArrowLeft size={11} /> Dashboard
            </Link>
            <span className="text-muted-foreground/40 text-xs">›</span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
              <FolderGit2 size={11} /> Project Directory
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight gradient-text pb-1">Project Management</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">Synchronized delivery metrics, active development pipelines, and client asset management.</p>
            </div>

            {/* KPI + Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: "Total", value: projects.length, color: "text-foreground", bg: "bg-primary/10", Icon: FolderGit2 },
                { label: "Active", value: activeCount, color: "text-blue-400", bg: "bg-blue-500/10", Icon: Zap },
                { label: "Completed", value: completedCount, color: "text-emerald-400", bg: "bg-emerald-500/10", Icon: ShieldCheck },
                { label: "In Review", value: reviewCount, color: "text-violet-400", bg: "bg-violet-500/10", Icon: Target },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 px-4 py-3 bg-background rounded-2xl border border-border/50 shadow-sm">
                  <div className={`p-2 rounded-xl ${s.bg}`}><s.Icon size={15} className={s.color} /></div>
                  <div>
                    <p className={`text-xl font-black leading-none ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/admin/projects/new")} className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                  <Plus size={18} /> Create Project
                </Button>
                <button onClick={() => fetchData(true)} className="h-11 w-11 rounded-xl border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all" title="Refresh">
                  <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 space-y-6">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-secondary/60 rounded-2xl border border-border/50">
            {STATUS_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}>
                {tab}
                {counts[tab] > 0 && (
                  <span className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab ? "bg-primary/10 text-primary" : "bg-border/80 text-muted-foreground"}`}>{counts[tab]}</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/40">
              <button onClick={() => setLayout("grid")} className={`p-1.5 rounded-lg transition-all ${layout === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={15} /></button>
              <button onClick={() => setLayout("list")} className={`p-1.5 rounded-lg transition-all ${layout === "list" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}><List size={15} /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input placeholder="Filter projects..." className="pl-9 w-56 h-9 rounded-xl text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border/40 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4"><FolderGit2 className="text-muted-foreground/40" size={28} /></div>
            <p className="font-bold text-lg">No projects found</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">{searchQuery ? "Try a different search term." : "Create your first project to get started."}</p>
            <Button onClick={() => navigate("/admin/projects/new")} variant="outline" className="rounded-xl gap-2"><Plus size={14} />Create Project</Button>
          </div>
        ) : layout === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(p => (
              <AdminProjectCard
                key={p._id} project={p}
                onView={proj => navigate(`/admin/projects/${proj._id}`, { state: { project: proj } })}
                onEdit={proj => navigate(`/admin/projects/${proj._id}/edit`)}
                onDelete={handleDelete}
                onMonitor={proj => navigate(`/admin/projects/${proj._id}/monitor`)}
                onAssign={openAssign}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground bg-secondary/30 rounded-xl border border-border/40">
              <div className="col-span-4">Project</div><div className="col-span-2">Status</div><div className="col-span-3">Progress</div><div className="col-span-3 text-right">Operations</div>
            </div>
            {filtered.map(p => (
              <AdminListRow
                key={p._id} project={p}
                onView={proj => navigate(`/admin/projects/${proj._id}`, { state: { project: proj } })}
                onEdit={proj => navigate(`/admin/projects/${proj._id}/edit`)}
                onDelete={handleDelete}
                onMonitor={proj => navigate(`/admin/projects/${proj._id}/monitor`)}
                onAssign={openAssign}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── ASSIGN DIALOG ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="pb-4 border-b border-border/40">
            <DialogTitle className="text-base font-extrabold tracking-tight flex items-center gap-2">
              <Users size={16} className="text-primary" /> Assign Team — {selectedProject?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4 px-1">
            {/* Manager */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Manager</Label>
              <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                value={assignments.manager} onChange={e => setAssignments({ ...assignments, manager: e.target.value })}>
                <option value="">— Unassigned —</option>
                {users.filter(u => u.role === "admin" || u.role === "manager").map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
            {/* Developers */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Developer</Label>
              <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={e => {
                  if (e.target.value && !assignments.teamMembers.includes(e.target.value))
                    setAssignments({ ...assignments, teamMembers: [...assignments.teamMembers, e.target.value] });
                  e.target.value = "";
                }}>
                <option value="">Select a developer...</option>
                {users.filter(u => u.role === "developer").map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2 pt-1 min-h-[28px]">
                {assignments.teamMembers.map(id => {
                  const dev = users.find(u => u._id === id);
                  if (!dev) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary border border-border/50 rounded-full text-xs font-bold cursor-pointer hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                      onClick={() => setAssignments({ ...assignments, teamMembers: assignments.teamMembers.filter(x => x !== id) })}>
                      {dev.name} <X size={10} />
                    </span>
                  );
                })}
                {assignments.teamMembers.length === 0 && <span className="text-[11px] text-muted-foreground italic">No developers assigned.</span>}
              </div>
            </div>
            {/* Clients */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Client</Label>
              <select className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                onChange={e => {
                  if (e.target.value && !assignments.clients.includes(e.target.value))
                    setAssignments({ ...assignments, clients: [...assignments.clients, e.target.value] });
                  e.target.value = "";
                }}>
                <option value="">Select a client...</option>
                {users.filter(u => u.role === "client").map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2 pt-1 min-h-[28px]">
                {assignments.clients.map(id => {
                  const cl = users.find(u => u._id === id);
                  if (!cl) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold cursor-pointer hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                      onClick={() => setAssignments({ ...assignments, clients: assignments.clients.filter(x => x !== cl._id) })}>
                      {cl.name} <X size={10} />
                    </span>
                  );
                })}
                {assignments.clients.length === 0 && <span className="text-[11px] text-muted-foreground italic">No clients assigned.</span>}
              </div>
            </div>
            <Button onClick={saveAssign} className="w-full mt-1 rounded-xl bg-gradient-to-r from-primary to-blue-600 border-0 shadow-lg shadow-primary/20 font-bold uppercase tracking-widest h-11 text-xs">
              Save Assignments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Projects;
