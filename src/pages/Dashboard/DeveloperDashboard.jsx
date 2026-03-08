import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, CheckCircle2, Clock, Loader2,
    FolderGit2, Milestone, ListTodo,
    AlertCircle, ChevronDown, ChevronRight,
    Zap, CalendarDays, ExternalLink, TrendingUp,
    Code2, Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/ContextProvider';
import projectService from '../../api/projectService';
import { getDisplayProgress } from '../../utils/projectProgress';

const statusBadge = (status) => {
    const map = {
        completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
        active: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        'in-progress': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
        review: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
        done: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    };
    return map[status?.toLowerCase()] || 'bg-secondary text-muted-foreground border-border/40';
};

const taskDot = (status) => {
    const map = {
        completed: 'bg-emerald-500',
        done: 'bg-emerald-500',
        'in-progress': 'bg-primary animate-pulse',
        active: 'bg-primary animate-pulse',
        pending: 'bg-amber-400',
        review: 'bg-purple-500',
    };
    return map[status?.toLowerCase()] || 'bg-muted-foreground';
};

const progressGradient = (p) => {
    if (p >= 80) return 'from-emerald-400 to-teal-500';
    if (p >= 50) return 'from-blue-400 to-primary';
    return 'from-amber-400 to-orange-500';
};

/* ── Metric Card ─────────────────────────────────────────────────── */
const MetricCard = ({ icon: Icon, label, value, gradient, ring, badge }) => (
    <div className={`metric-card ring-1 ${ring}`}>
        <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-4`}>
            <Icon size={18} className="text-white" />
        </div>
        <h3 className="text-2xl font-black tracking-tight tabular-nums">{value}</h3>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
        <div className={`inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${badge}`}>
            <TrendingUp size={8} /> Active
        </div>
    </div>
);

/* ── Main ────────────────────────────────────────────────────────── */
const DeveloperDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedProject, setExpandedProject] = useState(null);
    const [milestonesMap, setMilestonesMap] = useState({});
    const [tasksMap, setTasksMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await projectService.getAllProjects();
                const mine = (res.data?.data || []).filter(p =>
                    p.teamMembers?.some(m => (m._id || m) === user?._id)
                );
                setProjects(mine);
            } catch (err) {
                console.error('Developer dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const loadProjectDetails = async (projectId) => {
        if (milestonesMap[projectId]) return;
        try {
            const msRes = await projectService.getMilestones(projectId);
            const msList = msRes.data?.data || [];
            setMilestonesMap(prev => ({ ...prev, [projectId]: msList }));

            const collected = [];
            for (const ms of msList) {
                try {
                    const modRes = await projectService.getModules(projectId, ms._id);
                    const modules = modRes.data?.data || [];
                    for (const mod of modules) {
                        try {
                            const taskRes = await projectService.getTasks(projectId, ms._id, mod._id);
                            (taskRes.data?.data || [])
                                .filter(t => t.assignedTo === user?._id || t.assignedTo?._id === user?._id)
                                .forEach(t => collected.push({ ...t, _milestoneTitle: ms.title, _moduleTitle: mod.title }));
                        } catch { /* ignore */ }
                    }
                } catch { /* ignore */ }
            }
            setTasksMap(prev => ({ ...prev, [projectId]: collected }));
        } catch {
            setMilestonesMap(prev => ({ ...prev, [projectId]: [] }));
        }
    };

    const toggleProject = (id) => {
        if (expandedProject === id) { setExpandedProject(null); return; }
        setExpandedProject(id);
        loadProjectDetails(id);
    };

    const active = projects.filter(p => ['active', 'in-progress'].includes(p.status?.toLowerCase())).length;
    const completed = projects.filter(p => p.status?.toLowerCase() === 'completed').length;
    const allTasks = Object.values(tasksMap).flat();
    const doneTasks = allTasks.filter(t => ['completed', 'done'].includes(t.status?.toLowerCase())).length;

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Code2 size={22} className="text-white" />
                    </div>
                    <Loader2 className="absolute -top-1 -right-1 animate-spin text-violet-500" size={18} />
                </div>
                <p className="text-sm font-bold text-muted-foreground">Loading your workspace…</p>
            </div>
        </div>
    );

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
    const taskCompletionPct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 space-y-8 animate-in fade-in duration-400">

            {/* ── Hero Header ────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-700 text-xs font-bold">
                                <Sparkles size={10} />
                                Developer Workspace
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
                            {greeting}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            You have <span className="font-bold text-foreground">{projects.length} project{projects.length !== 1 ? 's' : ''}</span> assigned to you.
                        </p>
                    </div>

                    {/* Task completion ring */}
                    {allTasks.length > 0 && (
                        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-violet-500/5 border border-violet-500/15">
                            <div className="relative w-14 h-14">
                                <svg width="56" height="56" className="-rotate-90">
                                    <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(270 60% 50% / 0.15)" strokeWidth="5" />
                                    <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(270 60% 50%)" strokeWidth="5"
                                        strokeDasharray={`${(taskCompletionPct / 100) * 138.2} 138.2`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-black">{taskCompletionPct}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Tasks Done</p>
                                <p className="text-sm font-extrabold">{doneTasks} / {allTasks.length}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Metric Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={Briefcase} label="Assigned Projects" value={projects.length}
                    gradient="from-blue-500 to-blue-600" ring="ring-blue-500/20"
                    badge="bg-blue-500/10 text-blue-600" />
                <MetricCard icon={Zap} label="Active" value={active}
                    gradient="from-emerald-500 to-teal-600" ring="ring-emerald-500/20"
                    badge="bg-emerald-500/10 text-emerald-600" />
                <MetricCard icon={CheckCircle2} label="Completed" value={completed}
                    gradient="from-violet-500 to-purple-600" ring="ring-violet-500/20"
                    badge="bg-violet-500/10 text-violet-600" />
                <MetricCard icon={ListTodo} label="Tasks Done" value={`${doneTasks}/${allTasks.length}`}
                    gradient="from-orange-500 to-amber-500" ring="ring-orange-500/20"
                    badge="bg-orange-500/10 text-orange-600" />
            </div>

            {/* ── Projects ─────────────────────────────────────────────────── */}
            <div className="space-y-5">
                <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-violet-500/10">
                        <FolderGit2 size={15} className="text-violet-600" />
                    </div>
                    My Assigned Projects
                    <span className="text-xs font-bold text-muted-foreground bg-secondary rounded-lg px-2 py-0.5">{projects.length}</span>
                </h2>

                {projects.length === 0 && (
                    <div className="dashboard-glass p-12 flex flex-col items-center gap-3 text-center border-dashed">
                        <div className="p-4 rounded-2xl bg-muted/50">
                            <AlertCircle size={28} className="text-muted-foreground/40" />
                        </div>
                        <p className="font-semibold text-muted-foreground">No projects assigned to you yet.</p>
                        <p className="text-xs text-muted-foreground">Your manager will assign projects to you shortly.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {projects.map(project => {
                        const progress = getDisplayProgress(project);
                        const isExpanded = expandedProject === project._id;
                        const msList = milestonesMap[project._id] || [];
                        const myTasks = tasksMap[project._id] || [];

                        return (
                            <div key={project._id} className="dashboard-glass overflow-hidden group">
                                {/* Left accent */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-blue-500 rounded-l-2xl opacity-60 group-hover:opacity-100 transition-opacity" />

                                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 pl-6">
                                    {/* Thumbnail */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-border/30 flex-shrink-0">
                                        <img
                                            src={project.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400'}
                                            alt={project.title || project.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-extrabold text-sm group-hover:text-primary transition-colors">{project.title || project.name}</h3>
                                            <Badge className={`text-[10px] border ${statusBadge(project.status)}`}>{project.status || 'Pending'}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description || 'No description.'}</p>
                                        <div className="mt-2.5 space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                                                <span>Progress</span>
                                                <span className={progress >= 80 ? 'text-emerald-600' : progress >= 50 ? 'text-primary' : 'text-amber-600'}>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${progressGradient(progress)} rounded-full transition-all duration-700 shadow-sm`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <Button size="sm" className="gap-1 h-8 text-xs rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 border-0 shadow-sm shadow-violet-500/20" onClick={() => navigate(`/projects/${project._id}`)}>
                                            <ExternalLink size={12} /> Open
                                        </Button>
                                        <button
                                            onClick={() => toggleProject(project._id)}
                                            className="flex items-center gap-1 h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                                        >
                                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                            {isExpanded ? 'Hide' : 'Details'}
                                        </button>
                                    </div>
                                </div>

                                {/* ── Expanded ────────────────────────────── */}
                                {isExpanded && (
                                    <div className="border-t border-border/30 bg-muted/20 px-6 py-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">

                                        {/* Milestones */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                <Milestone size={11} className="text-emerald-600" /> Milestones ({msList.length})
                                            </p>
                                            {msList.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No milestones for this project.</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {msList.map(ms => (
                                                        <div key={ms._id} className="flex items-center gap-2.5 bg-card border border-border/30 rounded-xl px-4 py-2.5 hover:border-primary/20 transition-colors">
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ms.status === 'completed' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold truncate">{ms.title}</p>
                                                                {ms.deadline && (
                                                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                        <CalendarDays size={9} /> {new Date(ms.deadline).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Badge className={`text-[10px] border flex-shrink-0 ${statusBadge(ms.status)}`}>{ms.status || 'pending'}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* My Tasks */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                <ListTodo size={11} className="text-violet-600" /> My Tasks ({myTasks.length})
                                            </p>
                                            {myTasks.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">No tasks assigned to you in this project.</p>
                                            ) : (
                                                <div className="space-y-1.5">
                                                    {myTasks.map(task => (
                                                        <div key={task._id} className="flex items-start gap-3 bg-card border border-border/30 rounded-xl px-4 py-3 hover:border-primary/20 transition-colors">
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${taskDot(task.status)}`} />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold truncate">{task.title}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                    {task._milestoneTitle && <span>{task._milestoneTitle}</span>}
                                                                    {task._moduleTitle && <span> › {task._moduleTitle}</span>}
                                                                </p>
                                                            </div>
                                                            {task.deadline && (
                                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 flex-shrink-0 mt-0.5">
                                                                    <Clock size={9} /> {new Date(task.deadline).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                            <Badge className={`text-[10px] border flex-shrink-0 ${statusBadge(task.status)}`}>
                                                                {task.status || 'pending'}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default DeveloperDashboard;
