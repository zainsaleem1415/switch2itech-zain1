import React, { useState, useEffect } from "react";
import projectService from "../../api/projectService";
import userService from "../../api/userService";
import {
  Search, Plus, Code, ExternalLink, Loader2,
  TrendingUp, BarChart3, Layers, AlertCircle,
  Globe, ShieldCheck, Zap, Target, Users, LayoutGrid, ArrowLeft,
  Building2, FolderGit2, Edit3, Trash2, Eye, List
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import Addproject from '../Addproject/Addproject';
import ProjectMonitoring from './ProjectMonitoring';
import ProjectDetail from '../Project/ProjectDetail';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [layoutStyle, setLayoutStyle] = useState("grid");

  // States for Assignment Logic
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [assignments, setAssignments] = useState({ manager: "", teamMembers: [], clients: [] });
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, userRes] = await Promise.all([
        projectService.getAllProjects(),
        userService.getUsers()
      ]);
      setProjects(projRes.data?.data || []);
      setUsers(userRes.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch projects or users:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignDialog = (project) => {
    setSelectedProject(project);
    setAssignments({
      manager: project.manager?._id || project.manager || "",
      teamMembers: project.teamMembers?.map(t => t._id || t) || [],
      clients: project.clients?.map(c => c._id || c) || []
    });
    setIsAssignDialogOpen(true);
  };

  const handleAssignSave = async () => {
    try {
      await projectService.assignProject(selectedProject._id, assignments);
      // Wait for fetch to ensure consistency, then close dialog
      await fetchData();
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error("Assignment failed", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectService.deleteProject(id);
      setProjects(projects.filter(p => p._id !== id));
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project");
    }
  };

  const activeProjects = projects.filter(p => ['active', 'in-progress'].includes(p.status?.toLowerCase())).length;
  const completedProjects = projects.filter(p => p.status?.toLowerCase() === 'completed').length;
  const inReviewProjects = projects.filter(p => p.status?.toLowerCase() === 'in-review').length;

  const stats = [
    { label: "Completed", count: completedProjects, icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Active", count: activeProjects, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "In Review", count: inReviewProjects, icon: Target, color: "text-violet-500", bg: "bg-violet-500/10" },
  ];

  const filteredProjects = projects.filter(p =>
    (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateProgress = (project) => {
    // placeholder if API doesn't return explicit progress
    return project.progress || (project.status === 'completed' ? 100 : project.status === 'in-review' ? 90 : project.status === 'active' ? 50 : 10);
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm font-bold text-muted-foreground">Loading projects...</p>
      </div>
    </div>
  );

  if (currentView === "add" || currentView === "edit") {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{currentView === "edit" ? "Edit Asset" : "Create Asset"}</h1>
            <p className="text-muted-foreground">{currentView === "edit" ? "Update project repository configuration." : "Provision a new project repository to the ecosystem."}</p>
          </div>
          <Button variant="outline" onClick={() => { setCurrentView("list"); setSelectedProject(null); fetchData(); }} className="gap-2 rounded-xl">
            <ArrowLeft size={16} /> Cancel & Return
          </Button>
        </div>
        <Addproject
          initialData={currentView === "edit" ? selectedProject : null}
          onSuccess={() => { setCurrentView("list"); setSelectedProject(null); fetchData(); }}
        />
      </div>
    );
  }

  if (currentView === "monitor" && selectedProject) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10 max-w-[1600px] mx-auto">
        <ProjectMonitoring
          project={selectedProject}
          onBack={() => { setCurrentView("list"); setSelectedProject(null); }}
        />
      </div>
    );
  }

  if (currentView === "view" && selectedProject) {
    return (
      <div className="min-h-screen bg-background w-full">
        <ProjectDetail
          projectIdFromProps={selectedProject._id}
          onBackFromProps={() => { setCurrentView("list"); setSelectedProject(null); }}
        />
      </div>
    );
  }

  const allClients = [...new Set(projects.flatMap(p => p.clients))].filter(Boolean);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-in fade-in duration-400">

      {/* 1. Header & KPI Section */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                <FolderGit2 size={12} />
                Project Directory
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text py-1">Project Overview</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Synchronized delivery metrics, active development pipelines, and client asset management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 dashboard-glass p-1.5 rounded-xl">
              {stats.map((s, idx) => (
                <div key={s.label} className={`px-4 py-2 flex items-center gap-3 ${idx !== stats.length - 1 ? 'border-r border-border/40' : ''}`}>
                  <s.icon size={18} className={s.color} />
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground leading-none">{s.label}</span>
                    <span className="text-lg font-black leading-none mt-1">{s.count}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setCurrentView("add")} className="h-12 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all border-0">
              <Plus size={18} /> New Project
            </Button>
          </div>
        </div>
      </div>

      {/* 2. STRATEGIC CLIENTS SECTION */}
      {allClients.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
          <div className="flex items-center gap-2 px-1">
            <Building2 size={16} className="text-primary" />
            <h2 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Strategic Clients</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            {allClients.slice(0, 10).map((client, i) => (
              <div
                key={i}
                className="flex items-center gap-3 pr-6 pl-2 py-2 dashboard-glass rounded-2xl hover:border-primary/40 hover:bg-secondary/20 transition-all duration-300 cursor-default group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 shadow-inner flex items-center justify-center text-primary font-black text-lg group-hover:scale-110 transition-transform">
                  {typeof client === 'object' ? (client.name?.charAt(0) || "C") : "C"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-tight group-hover:text-primary transition-colors">{typeof client === 'object' ? client.name : "Client Asset"}</span>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Verified Partner</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Grid left */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 dashboard-glass p-1 rounded-xl w-fit">
              <button
                onClick={() => setLayoutStyle("grid")}
                className={`p-1.5 rounded-lg transition-all ${layoutStyle === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayoutStyle("list")}
                className={`p-1.5 rounded-lg transition-all ${layoutStyle === "list" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="List View"
              >
                <List size={16} />
              </button>
            </div>
            <div className="relative flex-1 max-w-sm ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Filter repositories..."
                className="pl-9 h-10 rounded-xl bg-card border-border/50 focus-visible:ring-primary shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="dashboard-glass p-12 flex flex-col items-center justify-center gap-3 text-center border-dashed border-2 min-h-[300px]">
              <div className="p-4 rounded-2xl bg-muted/50">
                <AlertCircle size={32} className="text-muted-foreground/40" />
              </div>
              <p className="font-bold text-lg">No projects found</p>
              <p className="text-sm text-muted-foreground">Create a new project or adjust your search filters.</p>
              <Button onClick={() => setCurrentView("add")} variant="outline" className="mt-2 rounded-xl">
                Create Project
              </Button>
            </div>
          ) : (
            <div className={layoutStyle === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              {layoutStyle === "list" && (
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground bg-secondary/20 rounded-xl border border-border/40">
                  <div className="col-span-4">Project Name</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-3">Progress</div>
                  <div className="col-span-3 text-right">Operations</div>
                </div>
              )}
              {filteredProjects.map((project) => {
                const progress = calculateProgress(project);
                const pStatus = project.status || 'Pending';

                if (layoutStyle === "list") {
                  return (
                    <div key={project._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-5 py-4 bg-card hover:bg-secondary/40 border border-border/50 rounded-2xl transition-all group">
                      <div className="col-span-full md:col-span-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center text-primary font-black shadow-inner border border-primary/20 flex-shrink-0">
                          {project.title?.charAt(0) || "P"}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-extrabold tracking-tight truncate group-hover:text-primary transition-colors">{project.title || project.name}</span>
                          <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded w-fit mt-1 border ${pStatus.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : pStatus.toLowerCase() === 'in-progress' || pStatus.toLowerCase() === 'active' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-secondary text-muted-foreground border-border/50'}`}>
                            {pStatus}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-full md:col-span-2">
                        <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-secondary text-muted-foreground border-none">
                          {project.category || 'General'}
                        </Badge>
                      </div>
                      <div className="col-span-full md:col-span-3">
                        <div className="space-y-1.5 w-full">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest hidden md:flex">
                            <span className="text-muted-foreground">Velocity</span>
                            <span className={progress >= 80 ? 'text-emerald-500' : progress >= 40 ? 'text-blue-500' : 'text-amber-500'}>{progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden ring-1 ring-inset ring-border/50">
                            <div
                              className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${progress >= 80 ? 'from-emerald-400 to-teal-500' : progress >= 40 ? 'from-blue-400 to-primary' : 'from-amber-400 to-orange-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-span-full md:col-span-3 flex items-center justify-end gap-1.5">
                        <div className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={() => { setSelectedProject(project); setCurrentView('view'); }} title="View Details">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg" onClick={() => { setSelectedProject(project); setCurrentView('edit'); }} title="Edit Project">
                            <Edit3 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDelete(project._id)} title="Delete Project">
                            <Trash2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg" onClick={() => { setSelectedProject(project); setCurrentView('monitor'); }} title="Monitor Hierarchy">
                            <LayoutGrid size={14} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground rounded-lg hover:text-foreground"
                          onClick={() => openAssignDialog(project)}
                          title="Assign Details"
                        >
                          <Users size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={project._id} className="group overflow-hidden dashboard-glass border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden bg-muted flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                      <img
                        src={project.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000"}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 right-4 z-20">
                        <Badge className={`backdrop-blur-md border border-white/10 uppercase text-[9px] font-black px-2.5 py-1 ${pStatus.toLowerCase() === 'completed' ? 'bg-emerald-500/80 text-white' : pStatus.toLowerCase() === 'in-progress' || pStatus.toLowerCase() === 'active' ? 'bg-blue-500/80 text-white animate-pulse' : 'bg-black/60 text-white'}`}>
                          {pStatus}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/80 backdrop-blur-sm text-white shadow-lg">
                          <Code size={16} />
                        </div>
                        <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-widest bg-black/50 text-white hover:bg-black/50 border-none backdrop-blur-sm">
                          {project.category || 'General'}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors">{project.title || project.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[32px]">{project.description}</p>

                      <div className="mt-auto space-y-4 pt-5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Velocity</span>
                            <span className={progress >= 80 ? 'text-emerald-500' : progress >= 40 ? 'text-blue-500' : 'text-amber-500'}>{progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden ring-1 ring-inset ring-border/50">
                            <div
                              className={`h-full transition-all duration-1000 ease-out bg-gradient-to-r ${progress >= 80 ? 'from-emerald-400 to-teal-500' : progress >= 40 ? 'from-blue-400 to-primary' : 'from-amber-400 to-orange-500'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                          <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={() => { setSelectedProject(project); setCurrentView('view'); }} title="View Details">
                              <Eye size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg" onClick={() => { setSelectedProject(project); setCurrentView('edit'); }} title="Edit Project">
                              <Edit3 size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDelete(project._id)} title="Delete Project">
                              <Trash2 size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg" onClick={() => { setSelectedProject(project); setCurrentView('monitor'); }} title="Monitor Hierarchy">
                              <LayoutGrid size={14} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[10px] font-black uppercase tracking-wider gap-1.5 rounded-lg border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary transition-colors"
                              onClick={() => openAssignDialog(project)}
                            >
                              Assign <ExternalLink size={10} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR SECTIONS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="dashboard-glass rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border/40 bg-card/30">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <BarChart3 size={18} className="text-primary" /> Performance
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/50 to-background border border-border/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Delivery Rate</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] uppercase font-black">+14.2%</Badge>
                </div>
                <div className="flex items-end gap-1.5 h-16 relative z-10 w-full">
                  {[40, 70, 45, 90, 65, 80, 50, 60, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-colors rounded-sm group relative">
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[9px] font-bold py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                        {h}%
                      </div>
                      <div className="w-full bg-primary transition-all duration-300 rounded-sm" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[{ label: "Deployment Speed", val: "94%" }, { label: "Code Coverage", val: "88%" }].map((m, i) => (
                  <div key={i} className="flex items-center justify-between group p-3 rounded-xl border border-transparent hover:border-border/50 hover:bg-secondary/20 transition-all">
                    <span className="text-xs font-bold text-muted-foreground">{m.label}</span>
                    <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                      {m.val} <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-glass rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-border/40 bg-card/30 flex items-center justify-between">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Users size={18} className="text-violet-500" /> Recent Repos
              </h3>
              <Badge variant="secondary" className="text-[9px] uppercase font-black">{projects.length}</Badge>
            </div>
            <div className="p-0 divide-y divide-border/30">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-muted-foreground">No repositories found.</div>
              ) : (
                projects.slice(0, 5).map((p, i) => {
                  const pStatus = p.status || 'Pending';
                  return (
                    <div key={p._id} className="flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-xs font-black text-foreground border border-border/50 shadow-inner">
                          {p.title?.charAt(0) || p.name?.charAt(0) || "P"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-extrabold tracking-tight truncate w-32 md:w-40">{p.title || p.name}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-widest">{p.category || 'General'}</span>
                        </div>
                      </div>
                      <Badge className={`text-[9px] uppercase font-black tracking-widest border px-2 py-0.5 ${pStatus.toLowerCase() === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : pStatus.toLowerCase() === 'in-progress' || pStatus.toLowerCase() === 'active' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 'bg-secondary text-muted-foreground border-border/50'}`}>
                        {pStatus}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader className="pb-4 border-b border-border/50">
            <DialogTitle className="text-lg font-extrabold tracking-tight">Assign Users &mdash; {selectedProject?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-2">

            {/* Manager Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Project Manager</Label>
              <select
                className="auth-input focus:ring-primary/20"
                value={assignments.manager}
                onChange={(e) => setAssignments({ ...assignments, manager: e.target.value })}
              >
                <option value="">&mdash; Unassigned &mdash;</option>
                {users.filter(u => u.role === 'admin' || u.role === 'manager').map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>

            {/* Team Members List (Developers) */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Developer</Label>
              <select
                className="auth-input focus:ring-primary/20"
                onChange={(e) => {
                  if (e.target.value && !assignments.teamMembers.includes(e.target.value)) {
                    setAssignments({ ...assignments, teamMembers: [...assignments.teamMembers, e.target.value] });
                  }
                  e.target.value = ''; // reset after selection
                }}
              >
                <option value="">Select a Developer...</option>
                {users.filter(u => u.role === 'developer').map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 pt-1">
                {assignments.teamMembers.map(devId => {
                  const dev = users.find(u => u._id === devId);
                  if (!dev) return null;
                  return (
                    <Badge key={devId} variant="secondary" className="cursor-pointer font-bold px-2.5 py-1 gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border border-transparent transition-colors" onClick={() => {
                      setAssignments({ ...assignments, teamMembers: assignments.teamMembers.filter(id => id !== devId) });
                    }}>
                      {dev.name} <span className="text-[10px]">×</span>
                    </Badge>
                  );
                })}
                {assignments.teamMembers.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic font-semibold">No developers assigned.</span>
                )}
              </div>
            </div>

            {/* Clients List */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Client</Label>
              <select
                className="auth-input focus:ring-primary/20"
                onChange={(e) => {
                  if (e.target.value && !assignments.clients.includes(e.target.value)) {
                    setAssignments({ ...assignments, clients: [...assignments.clients, e.target.value] });
                  }
                  e.target.value = '';
                }}
              >
                <option value="">Select a Client...</option>
                {users.filter(u => u.role === 'client').map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 pt-1">
                {assignments.clients.map(clientId => {
                  const cl = users.find(u => u._id === clientId);
                  if (!cl) return null;
                  return (
                    <Badge key={clientId} variant="secondary" className="cursor-pointer font-bold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" onClick={() => {
                      setAssignments({ ...assignments, clients: assignments.clients.filter(id => id !== clientId) });
                    }}>
                      {cl.name} <span className="text-[10px]">×</span>
                    </Badge>
                  );
                })}
                {assignments.clients.length === 0 && (
                  <span className="text-[10px] text-muted-foreground italic font-semibold">No clients assigned.</span>
                )}
              </div>
            </div>

            <Button onClick={handleAssignSave} className="w-full mt-3 rounded-xl bg-gradient-to-r from-primary to-blue-600 border-0 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest h-11">
              Save Assignments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;