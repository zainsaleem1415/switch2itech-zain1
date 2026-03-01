import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Briefcase, CheckCircle2, Clock, Users, Plus, Loader2,
    FolderGit2, Milestone, AlertCircle, ChevronDown, ChevronRight,
    UserPlus, X, Search, ExternalLink, Zap, TrendingUp, CalendarDays,
    LayoutGrid, Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useAuth } from '../../context/ContextProvider';
import projectService from '../../api/projectService';
import userService from '../../api/userService';

const statusBadge = (status) => {
    const map = {
        completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
        active: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        'in-progress': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
        pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
        review: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    };
    return map[status?.toLowerCase()] || 'bg-secondary text-muted-foreground border-border/40';
};

const statusDot = (status) => {
    const map = {
        completed: 'bg-emerald-500',
        active: 'bg-blue-500 animate-pulse',
        'in-progress': 'bg-blue-500 animate-pulse',
        pending: 'bg-amber-400',
        review: 'bg-violet-500',
    };
    return map[status?.toLowerCase()] || 'bg-muted-foreground';
};

const progressGradient = (p) => {
    if (p >= 80) return 'from-emerald-400 to-teal-500';
    if (p >= 50) return 'from-blue-400 to-primary';
    return 'from-amber-400 to-orange-500';
};

/* ── Metric Card ─────────────────────────────────────────────────── */
const MetricCard = ({ icon: Icon, label, value, gradient, ring, badge, bg }) => (
    <div className={`metric-card ring-1 ${ring}`}>
        <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-md mb-4`}>
            <Icon size={18} className="text-white" />
        </div>
        <h3 className="text-2xl font-black tracking-tight tabular-nums">{value}</h3>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
        <div className={`inline-flex items-center gap-1 mt-3 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${badge}`}>
            <TrendingUp size={8} /> Live
        </div>
    </div>
);

/* ── Main Component ──────────────────────────────────────────────── */
const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedProject, setExpandedProject] = useState(null);
    const [milestones, setMilestones] = useState({});

    const [assignDialog, setAssignDialog] = useState({ open: false, project: null });
    const [assignments, setAssignments] = useState({ manager: '', teamMembers: [], clients: [] });
    const [addMilestoneDialog, setAddMilestoneDialog] = useState({ open: false, project: null });
    const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', dueDate: '', status: 'pending' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projRes, userRes] = await Promise.all([
                    projectService.getAllProjects(),
                    userService.getUsers(),
                ]);
                const myProjects = (projRes.data?.data || []).filter(
                    p => (p.manager?._id || p.manager) === user?._id
                );
                setProjects(myProjects);
                setAllUsers(userRes.data?.data || []);
            } catch (err) {
                console.error('Manager dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    const loadMilestones = async (projectId) => {
        if (milestones[projectId]) return;
        try {
            const res = await projectService.getMilestones(projectId);
            setMilestones(prev => ({ ...prev, [projectId]: res.data?.data || [] }));
        } catch {
            setMilestones(prev => ({ ...prev, [projectId]: [] }));
        }
    };

    const toggleProject = (id) => {
        if (expandedProject === id) { setExpandedProject(null); return; }
        setExpandedProject(id);
        loadMilestones(id);
    };

    const handleAssignSave = async () => {
        try {
            await projectService.assignProject(assignDialog.project._id, assignments);
            setProjects(prev => prev.map(p => p._id === assignDialog.project._id ? { ...p, ...assignments } : p));
            setAssignDialog({ open: false, project: null });
        } catch (err) { console.error('Assignment failed:', err); }
    };

    const openAssignDialog = (project) => {
        setAssignments({
            manager: project.manager?._id || project.manager || '',
            teamMembers: project.teamMembers?.map(t => t._id || t) || [],
            clients: project.clients?.map(c => c._id || c) || [],
        });
        setAssignDialog({ open: true, project });
    };

    const handleAddMilestone = async () => {
        try {
            await projectService.createMilestone(addMilestoneDialog.project._id, milestoneForm);
            delete milestones[addMilestoneDialog.project._id];
            await loadMilestones(addMilestoneDialog.project._id);
            setAddMilestoneDialog({ open: false, project: null });
            setMilestoneForm({ title: '', description: '', deadline: '', status: 'pending' });
        } catch (err) { console.error('Add milestone failed:', err); }
    };

    const active = projects.filter(p => ['active', 'in-progress'].includes(p.status?.toLowerCase())).length;
    const completed = projects.filter(p => p.status?.toLowerCase() === 'completed').length;
    const totalMembers = [...new Set(projects.flatMap(p => p.teamMembers?.map(t => t._id || t) || []))].length;
    const filtered = projects.filter(p => (p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg shadow-primary/30">
                        <LayoutGrid size={22} className="text-white" />
                    </div>
                    <Loader2 className="absolute -top-1 -right-1 animate-spin text-primary" size={18} />
                </div>
                <p className="text-sm font-bold text-muted-foreground">Loading workspace…</p>
            </div>
        </div>
    );

    const now = new Date();
    const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-in fade-in duration-400">

            {/* ── Hero Header ────────────────────────────────────────────── */}
            <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
                <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold">
                                <Sparkles size={10} />
                                Manager Workspace
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">
                            {greeting}, {user?.name?.split(' ')[0]} 👋
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            You have <span className="font-bold text-foreground">{active} active</span> project{active !== 1 ? 's' : ''} in progress.
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/add-project')}
                        className="gap-2 rounded-xl shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300 border-0"
                    >
                        <Plus size={15} /> New Project
                    </Button>
                </div>
            </div>

            {/* ── Metric Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={Briefcase} label="Total Projects" value={projects.length}
                    gradient="from-blue-500 to-blue-600" ring="ring-blue-500/20"
                    badge="bg-blue-500/10 text-blue-600" />
                <MetricCard icon={Zap} label="Active" value={active}
                    gradient="from-emerald-500 to-teal-600" ring="ring-emerald-500/20"
                    badge="bg-emerald-500/10 text-emerald-600" />
                <MetricCard icon={CheckCircle2} label="Completed" value={completed}
                    gradient="from-violet-500 to-purple-600" ring="ring-violet-500/20"
                    badge="bg-violet-500/10 text-violet-600" />
                <MetricCard icon={Users} label="Team Members" value={totalMembers}
                    gradient="from-orange-500 to-amber-500" ring="ring-orange-500/20"
                    badge="bg-orange-500/10 text-orange-600" />
            </div>

            {/* ── Project List ─────────────────────────────────────────────── */}
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <FolderGit2 size={15} className="text-primary" />
                        </div>
                        My Projects
                        <span className="text-xs font-bold text-muted-foreground bg-secondary rounded-lg px-2 py-0.5">{filtered.length}</span>
                    </h2>
                    <div className="relative w-60">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search projects…"
                            className="pl-8 h-9 rounded-xl bg-card text-sm border-border/50"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filtered.length === 0 && (
                    <div className="dashboard-glass p-12 flex flex-col items-center gap-3 text-center border-dashed">
                        <div className="p-4 rounded-2xl bg-muted/50">
                            <AlertCircle size={28} className="text-muted-foreground/40" />
                        </div>
                        <p className="font-semibold text-muted-foreground">No projects found.</p>
                        <Button onClick={() => navigate('/add-project')} variant="outline" size="sm" className="mt-1 gap-1 rounded-xl">
                            <Plus size={13} /> Create your first project
                        </Button>
                    </div>
                )}

                <div className="space-y-3">
                    {filtered.map(project => {
                        const progress = project.progress || 0;
                        const isExpanded = expandedProject === project._id;
                        const projectMilestones = milestones[project._id] || [];

                        return (
                            <div key={project._id} className="dashboard-glass overflow-hidden group">
                                {/* Left accent border by status */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusDot(project.status).includes('blue') ? 'bg-blue-500' : statusDot(project.status).includes('emerald') ? 'bg-emerald-500' : statusDot(project.status).includes('violet') ? 'bg-violet-500' : 'bg-amber-400'} rounded-l-2xl opacity-70`} />

                                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 pl-6">
                                    {/* Thumbnail */}
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-violet-500/20 border border-border/30 flex-shrink-0">
                                        <img
                                            src={project.coverImage || `https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400`}
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

                                        {/* Progress */}
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
                                        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs rounded-xl border-border/50 hover:border-primary/40" onClick={() => openAssignDialog(project)}>
                                            <UserPlus size={12} /> Assign
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-1 h-8 text-xs rounded-xl border-border/50 hover:border-primary/40" onClick={() => setAddMilestoneDialog({ open: true, project })}>
                                            <Milestone size={12} /> Milestone
                                        </Button>
                                        <Button size="sm" className="gap-1 h-8 text-xs rounded-xl bg-gradient-to-r from-primary to-blue-600 shadow-sm shadow-primary/20 border-0" onClick={() => navigate(`/projects/${project._id}`)}>
                                            <ExternalLink size={12} /> Open
                                        </Button>
                                        <button
                                            onClick={() => toggleProject(project._id)}
                                            className="flex items-center gap-1 h-8 px-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                                        >
                                            {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                        </button>
                                    </div>
                                </div>

                                {/* ── Expanded milestones ────────────────── */}
                                {isExpanded && (
                                    <div className="border-t border-border/30 bg-muted/20 px-6 py-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-3">
                                            <Milestone size={11} className="text-primary" /> Milestones ({projectMilestones.length})
                                        </p>
                                        {projectMilestones.length === 0 ? (
                                            <p className="text-xs text-muted-foreground italic">No milestones yet.</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {projectMilestones.map(ms => (
                                                    <div key={ms._id} className="flex items-center justify-between bg-card border border-border/30 rounded-xl px-4 py-2.5 hover:border-primary/20 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ms.status === 'completed' ? 'bg-emerald-500' : 'bg-primary animate-pulse'}`} />
                                                            <div>
                                                                <span className="text-sm font-semibold">{ms.title}</span>
                                                                {ms.deadline && (
                                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                                        <CalendarDays size={9} /> {new Date(ms.deadline).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Badge className={`text-[10px] border ${statusBadge(ms.status)}`}>{ms.status || 'pending'}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Assign Dialog ─────────────────────────────────────────── */}
            <Dialog open={assignDialog.open} onOpenChange={open => setAssignDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold">Assign Team — {assignDialog.project?.title || assignDialog.project?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-3">
                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase tracking-wider">Project Manager</Label>
                            <select
                                className="auth-input"
                                value={assignments.manager}
                                onChange={e => setAssignments({ ...assignments, manager: e.target.value })}
                            >
                                <option value="">— Unassigned —</option>
                                {allUsers.filter(u => u.role === 'admin' || u.role === 'manager').map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase tracking-wider">Add Developer</Label>
                            <select
                                className="auth-input"
                                onChange={e => {
                                    if (e.target.value && !assignments.teamMembers.includes(e.target.value))
                                        setAssignments({ ...assignments, teamMembers: [...assignments.teamMembers, e.target.value] });
                                    e.target.value = '';
                                }}
                            >
                                <option value="">Select developer…</option>
                                {allUsers.filter(u => u.role === 'developer').map(u => (
                                    <option key={u._id} value={u._id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {assignments.teamMembers.map(id => {
                                    const dev = allUsers.find(u => u._id === id);
                                    return dev ? (
                                        <Badge key={id} variant="secondary" className="cursor-pointer gap-1 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                                            onClick={() => setAssignments({ ...assignments, teamMembers: assignments.teamMembers.filter(x => x !== id) })}>
                                            {dev.name} <X size={9} />
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase tracking-wider">Add Client</Label>
                            <select
                                className="auth-input"
                                onChange={e => {
                                    if (e.target.value && !assignments.clients.includes(e.target.value))
                                        setAssignments({ ...assignments, clients: [...assignments.clients, e.target.value] });
                                    e.target.value = '';
                                }}
                            >
                                <option value="">Select client…</option>
                                {allUsers.filter(u => u.role === 'client').map(u => (
                                    <option key={u._id} value={u._id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {assignments.clients.map(id => {
                                    const cl = allUsers.find(u => u._id === id);
                                    return cl ? (
                                        <Badge key={id} className="bg-primary/10 text-primary cursor-pointer gap-1 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                                            onClick={() => setAssignments({ ...assignments, clients: assignments.clients.filter(x => x !== id) })}>
                                            {cl.name} <X size={9} />
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>

                        <Button onClick={handleAssignSave} className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 border-0 shadow-md shadow-primary/20">Save Assignments</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Add Milestone Dialog ───────────────────────────────────── */}
            <Dialog open={addMilestoneDialog.open} onOpenChange={open => setAddMilestoneDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-extrabold">Add Milestone — {addMilestoneDialog.project?.title || addMilestoneDialog.project?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-3">
                        {[
                            { label: 'Title', key: 'title', type: 'text', placeholder: 'Milestone title…' },
                            { label: 'Description', key: 'description', type: 'text', placeholder: 'Short description…' },
                            { label: 'Deadline', key: 'deadline', type: 'date', placeholder: '' },
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <Label className="font-bold text-xs uppercase tracking-wider">{label}</Label>
                                <input
                                    type={type}
                                    className="auth-input"
                                    placeholder={placeholder}
                                    value={milestoneForm[key]}
                                    onChange={e => setMilestoneForm({ ...milestoneForm, [key]: e.target.value })}
                                />
                            </div>
                        ))}

                        <div className="space-y-1.5">
                            <Label className="font-bold text-xs uppercase tracking-wider">Status</Label>
                            <select
                                className="auth-input"
                                value={milestoneForm.status}
                                onChange={e => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                            >
                                {['pending', 'in-progress', 'review', 'completed'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <Button
                            onClick={handleAddMilestone}
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 border-0 shadow-md shadow-primary/20"
                            disabled={!milestoneForm.title}
                        >
                            Create Milestone
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ManagerDashboard;
