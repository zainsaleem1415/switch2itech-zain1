import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Edit3, Save, X, Plus, Trash2, Loader2,
    Briefcase, Calendar, DollarSign, Users, Tag, Flag,
    Milestone, Layers, ListTodo, HelpCircle, UserPlus,
    CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight,
    Image as ImageIcon, Video, Link2, MoreHorizontal, UserCheck,
    RefreshCw, ShieldAlert
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import { useAuth } from '../../context/ContextProvider';
import projectService from '../../api/projectService';
import userService from '../../api/userService';

// ── Helpers ─────────────────────────────────────────────────────────────────
const statusColors = {
    planning: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
    active: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    'on-hold': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    'in-review': 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    cancelled: 'bg-red-500/15 text-red-600 border-red-500/30',
    pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    'in-progress': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    todo: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
    done: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    blocked: 'bg-red-500/15 text-red-600 border-red-500/30',
};

const priorityColors = {
    low: 'bg-slate-500/15 text-slate-600',
    medium: 'bg-blue-500/15 text-blue-600',
    high: 'bg-orange-500/15 text-orange-600',
    critical: 'bg-red-500/15 text-red-600',
};

const fmt = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const getProjectImages = (project) => {
    const images = [];

    if (Array.isArray(project?.image) && project.image.length > 0) {
        images.push(...project.image);
    } else if (Array.isArray(project?.images) && project.images.length > 0) {
        images.push(...project.images);
    } else if (project?.coverImage) {
        images.push(project.coverImage);
    } else if (project?.thumbnail) {
        images.push(project.thumbnail);
    }

    if (images.length === 0) {
        images.push('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200');
    }

    return images;
};
// ── Inline editable field ─────────────────────────────────────────────────────
const EditableField = ({ label, value, onSave, canEdit, type = 'text', options }) => {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(value || '');

    const commit = () => { onSave(val); setEditing(false); };
    const cancel = () => { setVal(value || ''); setEditing(false); };

    if (!canEdit) return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            <p className="text-sm font-medium">{value || <span className="italic text-muted-foreground/50">Not set</span>}</p>
        </div>
    );

    return (
        <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    {options ? (
                        <select
                            className="flex-1 h-8 px-2 rounded-lg border border-border bg-card text-sm"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                        >
                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    ) : type === 'textarea' ? (
                        <textarea
                            className="flex-1 p-2 rounded-lg border border-border bg-card text-sm resize-none min-h-[80px]"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                        />
                    ) : (
                        <Input
                            type={type}
                            className="flex-1 h-8 text-sm"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                        />
                    )}
                    <Button size="icon" className="h-8 w-8 bg-emerald-600 hover:bg-emerald-700" onClick={commit}><Save size={13} /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancel}><X size={13} /></Button>
                </div>
            ) : (
                <div className="flex items-center gap-2 group">
                    <span className="text-sm font-medium">{value || <span className="italic text-muted-foreground/50">Click to edit</span>}</span>
                    <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80">
                        <Edit3 size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold flex items-center gap-2">
            {React.createElement(icon, { size: 16, className: 'text-primary' })} {title}
        </h3>
        {action}
    </div>
);

// ── Milestone Card ────────────────────────────────────────────────────────────
const MilestoneCard = ({ ms, projectId, canEdit, canAssign, allUsers, onUpdated }) => {
    const [expanded, setExpanded] = useState(false);
    const [modules, setModules] = useState([]);
    const [loadingModules, setLoadingModules] = useState(false);
    const [editStatus, setEditStatus] = useState(false);
    const [newStatus, setNewStatus] = useState(ms.status || 'pending');

    // Add module dialog
    const [addModDlg, setAddModDlg] = useState(false);
    const [modForm, setModForm] = useState({ name: '', description: '', status: 'pending', dueDate: '' });

    // Assign dialog
    const [assignDlg, setAssignDlg] = useState(false);
    const [assignUser, setAssignUser] = useState(ms.assignedTo?._id || ms.assignedTo || '');

    const loadModules = useCallback(async () => {
        if (modules.length > 0) return;
        setLoadingModules(true);
        try {
            const res = await projectService.getModules(projectId, ms._id);
            setModules(res.data?.data || []);
        } catch { setModules([]); }
        finally { setLoadingModules(false); }
    }, [projectId, ms._id, modules.length]);

    const toggle = () => {
        setExpanded(p => !p);
        if (!expanded) loadModules();
    };

    const saveStatus = async () => {
        try {
            await projectService.updateMilestone(projectId, ms._id, { status: newStatus });
            onUpdated();
            setEditStatus(false);
        } catch (e) { console.error(e); }
    };

    const saveAssign = async () => {
        try {
            await projectService.assignMilestone(projectId, ms._id, { assignedTo: assignUser });
            onUpdated();
            setAssignDlg(false);
        } catch (e) { console.error(e); }
    };

    const addModule = async () => {
        try {
            await projectService.createModule(projectId, ms._id, modForm);
            const res = await projectService.getModules(projectId, ms._id);
            setModules(res.data?.data || []);
            setAddModDlg(false);
            setModForm({ name: '', description: '', status: 'pending', dueDate: '' });
        } catch (e) { console.error(e); }
    };

    return (
        <div className="border border-border/50 rounded-2xl overflow-hidden bg-card">
            {/* Milestone Row */}
            <div className="flex items-center gap-3 px-5 py-4">
                <button onClick={toggle} className="text-muted-foreground hover:text-foreground transition-colors">
                    {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{ms.title}</span>
                        {ms.dueDate && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={9} /> {fmt(ms.dueDate)}
                            </span>
                        )}
                    </div>
                    {ms.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ms.description}</p>}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {editStatus && canEdit ? (
                        <div className="flex items-center gap-1">
                            <select
                                className="h-7 px-2 rounded-lg border text-xs bg-card"
                                value={newStatus}
                                onChange={e => setNewStatus(e.target.value)}
                            >
                                {['pending', 'in-progress', 'completed', 'on-hold'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <Button size="icon" className="h-7 w-7 bg-emerald-600" onClick={saveStatus}><Save size={11} /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditStatus(false)}><X size={11} /></Button>
                        </div>
                    ) : (
                        <Badge
                            className={`text-[10px] border cursor-pointer ${statusColors[ms.status] || 'bg-secondary'}`}
                            onClick={() => canEdit && setEditStatus(true)}
                        >
                            {ms.status || 'pending'}
                        </Badge>
                    )}
                    {canAssign && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Assign" onClick={() => setAssignDlg(true)}>
                            <UserCheck size={13} />
                        </Button>
                    )}
                    {canEdit && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={() => setAddModDlg(true)} title="Add Module">
                            <Plus size={13} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Modules */}
            {expanded && (
                <div className="border-t border-border/40 bg-muted/20 px-6 py-4 space-y-2">
                    {loadingModules && <div className="flex justify-center py-2"><Loader2 className="animate-spin text-primary" size={18} /></div>}
                    {!loadingModules && modules.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No modules yet.</p>
                    )}
                    {modules.map(mod => (
                        <ModuleRow
                            key={mod._id}
                            mod={mod}
                            projectId={projectId}
                            milestoneId={ms._id}
                            canEdit={canEdit}
                            canAssign={canAssign}
                            allUsers={allUsers}
                            onUpdated={() => loadModules()}
                        />
                    ))}
                </div>
            )}

            {/* Assign Milestone Dialog */}
            <Dialog open={assignDlg} onOpenChange={setAssignDlg}>
                <DialogContent className="sm:max-w-sm rounded-2xl">
                    <DialogHeader><DialogTitle>Assign Milestone</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <Label className="text-xs font-bold uppercase tracking-wider">Assign To</Label>
                        <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={assignUser} onChange={e => setAssignUser(e.target.value)}>
                            <option value="">— Unassigned —</option>
                            {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                        </select>
                        <Button onClick={saveAssign} className="w-full rounded-xl">Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Module Dialog */}
            <Dialog open={addModDlg} onOpenChange={setAddModDlg}>
                <DialogContent className="sm:max-w-sm rounded-2xl">
                    <DialogHeader><DialogTitle>Add Module to {ms.title}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Module Name *</Label>
                            <Input className="rounded-xl" placeholder="e.g. Authentication" value={modForm.name} onChange={e => setModForm({ ...modForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Description</Label>
                            <Input className="rounded-xl" placeholder="Brief description" value={modForm.description} onChange={e => setModForm({ ...modForm, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Status</Label>
                                <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={modForm.status} onChange={e => setModForm({ ...modForm, status: e.target.value })}>
                                    {['pending', 'in-progress', 'in-review', 'completed'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Due Date</Label>
                                <Input type="date" className="rounded-xl" value={modForm.dueDate} onChange={e => setModForm({ ...modForm, dueDate: e.target.value })} />
                            </div>
                        </div>
                        <Button onClick={addModule} className="w-full rounded-xl" disabled={!modForm.name}>Create Module</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ── Module Row ────────────────────────────────────────────────────────────────
const ModuleRow = ({ mod, projectId, milestoneId, canEdit, canAssign, allUsers, onUpdated }) => {
    const [tasks, setTasks] = useState([]);
    const [showTasks, setShowTasks] = useState(false);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [editStatus, setEditStatus] = useState(false);
    const [newStatus, setNewStatus] = useState(mod.status || 'pending');
    const [addTaskDlg, setAddTaskDlg] = useState(false);
    const [assignDlg, setAssignDlg] = useState(false);
    const [assignUser, setAssignUser] = useState(mod.assignedTo?._id || mod.assignedTo || '');
    const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', estimatedHours: 0 });

    const loadTasks = async () => {
        setLoadingTasks(true);
        try {
            const res = await projectService.getTasks(projectId, milestoneId, mod._id);
            setTasks(res.data?.data || []);
        } catch { setTasks([]); }
        finally { setLoadingTasks(false); }
    };

    const toggle = () => {
        setShowTasks(p => !p);
        if (!showTasks && tasks.length === 0) loadTasks();
    };

    const saveStatus = async () => {
        try {
            await projectService.updateModule(projectId, milestoneId, mod._id, { status: newStatus });
            onUpdated();
            setEditStatus(false);
        } catch (e) { console.error(e); }
    };

    const saveAssign = async () => {
        try {
            await projectService.assignModule(projectId, milestoneId, mod._id, { assignedTo: assignUser });
            onUpdated();
            setAssignDlg(false);
        } catch (e) { console.error(e); }
    };

    const addTask = async () => {
        try {
            await projectService.createTask(projectId, milestoneId, mod._id, taskForm);
            await loadTasks();
            setAddTaskDlg(false);
            setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', estimatedHours: 0 });
        } catch (e) { console.error(e); }
    };

    const updateTaskStatus = async (task, status) => {
        try {
            await projectService.updateTask(projectId, milestoneId, mod._id, task._id, { status });
            await loadTasks();
        } catch (e) { console.error(e); }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await projectService.deleteTask(projectId, milestoneId, mod._id, taskId);
            setTasks(t => t.filter(x => x._id !== taskId));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="border border-border/30 rounded-xl bg-background/60">
            {/* Module Header */}
            <div className="flex items-center gap-2 px-4 py-3">
                <button onClick={toggle} className="text-muted-foreground hover:text-foreground transition-colors">
                    {showTasks ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                <span className="text-sm font-semibold flex-1 min-w-0 truncate">{mod.name || mod.title}</span>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {editStatus ? (
                        <div className="flex items-center gap-1">
                            <select className="h-6 px-1.5 rounded-lg border text-xs bg-card" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                {['pending', 'in-progress', 'in-review', 'completed'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <Button size="icon" className="h-6 w-6 bg-emerald-600" onClick={saveStatus}><Save size={10} /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditStatus(false)}><X size={10} /></Button>
                        </div>
                    ) : (
                        <Badge
                            className={`text-[9px] border cursor-pointer ${statusColors[mod.status] || 'bg-secondary'}`}
                            onClick={() => canEdit && setEditStatus(true)}
                        >
                            {mod.status || 'pending'}
                        </Badge>
                    )}
                    {canAssign && (
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setAssignDlg(true)} title="Assign">
                            <UserCheck size={11} />
                        </Button>
                    )}
                    {(canEdit) && (
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-primary" onClick={() => setAddTaskDlg(true)} title="Add Task">
                            <Plus size={11} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Tasks */}
            {showTasks && (
                <div className="border-t border-border/30 px-4 py-3 space-y-2">
                    {loadingTasks && <Loader2 className="animate-spin text-primary" size={16} />}
                    {!loadingTasks && tasks.length === 0 && <p className="text-xs text-muted-foreground italic">No tasks yet.</p>}
                    {tasks.map(task => (
                        <div key={task._id} className="flex items-center gap-2 group">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'done' || task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-blue-500 animate-pulse' : task.status === 'blocked' ? 'bg-red-500' : 'bg-amber-400'}`} />
                            <span className="text-xs font-medium flex-1 truncate">{task.title}</span>
                            {task.dueDate && <span className="text-[10px] text-muted-foreground hidden sm:inline">{fmt(task.dueDate)}</span>}
                            <select
                                className="h-6 px-1.5 rounded-lg border text-[10px] bg-card opacity-0 group-hover:opacity-100 transition-opacity"
                                value={task.status || 'todo'}
                                onChange={e => updateTaskStatus(task, e.target.value)}
                                disabled={!canEdit}
                            >
                                {['todo', 'in-progress', 'in-review', 'done', 'blocked'].map(s => <option key={s}>{s}</option>)}
                            </select>
                            <Badge className={`text-[9px] border ${statusColors[task.status] || 'bg-secondary'}`}>{task.status || 'todo'}</Badge>
                            {canEdit && (
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTask(task._id)}>
                                    <Trash2 size={10} />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Assign Module Dialog */}
            <Dialog open={assignDlg} onOpenChange={setAssignDlg}>
                <DialogContent className="sm:max-w-sm rounded-2xl">
                    <DialogHeader><DialogTitle>Assign Module — {mod.name || mod.title}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={assignUser} onChange={e => setAssignUser(e.target.value)}>
                            <option value="">— Unassigned —</option>
                            {allUsers.filter(u => u.role === 'developer' || u.role === 'manager' || u.role === 'admin').map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                        <Button onClick={saveAssign} className="w-full rounded-xl">Save</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Task Dialog */}
            <Dialog open={addTaskDlg} onOpenChange={setAddTaskDlg}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader><DialogTitle>Add Task — {mod.name || mod.title}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Title *</Label>
                            <Input className="rounded-xl" placeholder="Task title..." value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Description</Label>
                            <Input className="rounded-xl" placeholder="Description..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Status</Label>
                                <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                                    {['todo', 'in-progress', 'in-review', 'done', 'blocked'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Priority</Label>
                                <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                                    {['low', 'medium', 'high', 'critical'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Due Date</Label>
                                <Input type="date" className="rounded-xl" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Est. Hours</Label>
                                <Input type="number" className="rounded-xl" value={taskForm.estimatedHours} onChange={e => setTaskForm({ ...taskForm, estimatedHours: Number(e.target.value) })} />
                            </div>
                        </div>
                        <Button onClick={addTask} className="w-full rounded-xl" disabled={!taskForm.title}>Create Task</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ProjectDetail = ({ projectIdFromProps, onBackFromProps }) => {
    const { id: paramId } = useParams();
    const id = projectIdFromProps || paramId;
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useAuth();
    const clickedProject = location.state?.project || null;

    const [project, setProject] = useState(clickedProject);
    const [milestones, setMilestones] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Assign dialog (project-level)
    const [assignDlg, setAssignDlg] = useState(false);
    const [assignments, setAssignments] = useState({ manager: '', teamMembers: [], clients: [] });

    // Add milestone dialog
    const [addMsDlg, setAddMsDlg] = useState(false);
    const [msForm, setMsForm] = useState({ title: '', description: '', status: 'pending', dueDate: '', order: 0 });

    // Role permissions
    const isAdmin = role === 'admin';
    const isManager = role === 'manager';
    const isDeveloper = role === 'developer';
    const canEdit = isAdmin || isManager;
    const canAssign = isAdmin || isManager;
    const canDelete = isAdmin;
    const projectImages = getProjectImages(project);
    const primaryImage = projectImages[0];

    // ── Fetch data ──────────────────────────────────────────────────────────
    const fetchProject = useCallback(async () => {
        try {
            const [projRes, msRes] = await Promise.all([
                projectService.getProjectById(id),
                projectService.getMilestones(id),
            ]);
            const apiProject = projRes.data?.data || null;
            setProject(apiProject ? { ...(clickedProject || {}), ...apiProject } : clickedProject);
            setMilestones(msRes.data?.data || []);
        } catch (e) {
            setError('Failed to load project.');
            console.error(e);
        }
    }, [id, clickedProject]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchProject();
            if (canAssign) {
                try {
                    const userRes = await userService.getUsers();
                    setAllUsers(userRes.data?.data || []);
                } catch { /* ignore */ }
            }
            setLoading(false);
        };
        init();
    }, [id, canAssign, fetchProject]);

    // ── Update a single project field ────────────────────────────────────────
    const updateField = async (field, value) => {
        try {
            setSaving(true);
            await projectService.updateProject(id, { [field]: value });
            setProject(p => ({ ...p, [field]: value }));
        } catch (e) {
            console.error('Update failed:', e);
        } finally {
            setSaving(false);
        }
    };

    // ── Update tags (comma-separated string → array) ─────────────────────────
    const updateTags = async (str) => {
        const arr = str.split(',').map(t => t.trim()).filter(Boolean);
        await updateField('tags', arr);
    };

    // ── Assign project ───────────────────────────────────────────────────────
    const openAssign = () => {
        setAssignments({
            manager: project?.manager?._id || project?.manager || '',
            teamMembers: project?.teamMembers?.map(t => t._id || t) || [],
            clients: project?.clients?.map(c => c._id || c) || [],
        });
        setAssignDlg(true);
    };

    const saveAssign = async () => {
        try {
            await projectService.assignProject(id, assignments);
            await fetchProject();
            setAssignDlg(false);
        } catch (e) { console.error(e); }
    };

    // ── Add milestone ────────────────────────────────────────────────────────
    const addMilestone = async () => {
        try {
            await projectService.createMilestone(id, msForm);
            const res = await projectService.getMilestones(id);
            setMilestones(res.data?.data || []);
            setAddMsDlg(false);
            setMsForm({ title: '', description: '', status: 'pending', dueDate: '', order: 0 });
        } catch (e) { console.error(e); }
    };

    // ── Delete project ───────────────────────────────────────────────────────
    const deleteProject = async () => {
        if (!window.confirm(`Delete project "${project?.title}"? This cannot be undone.`)) return;
        try {
            await projectService.deleteProject(id);
            navigate('/projects');
        } catch (e) { console.error(e); }
    };

    // ── Loading / error states ───────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={40} />
        </div>
    );

    if (error || !project) return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
            <AlertCircle size={40} className="text-destructive" />
            <p className="text-muted-foreground font-semibold">{error || 'Project not found.'}</p>
            <Button variant="outline" onClick={() => navigate('/projects')}>Go Back</Button>
        </div>
    );

    const progress = project.progress || 0;

    return (
        <div className="min-h-screen bg-background overflow-y-auto">
            {/* Cover Image Banner */}
            <div className="relative h-48 md:h-64 w-full overflow-hidden bg-muted">
                <img
                    src={primaryImage}
                    alt={project.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Back button */}
                <button
                    onClick={() => {
                        if (onBackFromProps) onBackFromProps();
                        else navigate(-1);
                    }}
                    className="absolute top-4 left-6 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                {/* Status badge */}
                <div className="absolute top-4 right-6 flex items-center gap-2">
                    {saving && <Loader2 className="animate-spin text-white" size={16} />}
                    <Badge className={`text-xs border ${statusColors[project.status] || 'bg-secondary'} bg-black/50 backdrop-blur-sm text-white border-white/30`}>
                        {project.status || 'planning'}
                    </Badge>
                </div>

                {/* Project title over banner */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
                        {project.title}
                    </h1>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {project.priority && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${priorityColors[project.priority]} bg-black/40 text-white`}>
                                {project.priority} priority
                            </span>
                        )}
                        {project.tags?.map(tag => (
                            <span key={tag} className="text-[10px] font-semibold text-white/70 bg-white/10 px-2 py-0.5 rounded-lg">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        <span>Overall Progress</span>
                        <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Action Buttons (admin/manager) */}
                {(canEdit || canAssign) && (
                    <div className="flex flex-wrap gap-3">
                        {canAssign && (
                            <Button variant="outline" className="gap-2 rounded-xl" onClick={openAssign}>
                                <UserPlus size={15} /> Assign Team
                            </Button>
                        )}
                        {canEdit && (
                            <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setAddMsDlg(true)}>
                                <Plus size={15} /> Add Milestone
                            </Button>
                        )}
                        {canDelete && (
                            <Button variant="outline" className="gap-2 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10" onClick={deleteProject}>
                                <Trash2 size={15} /> Delete Project
                            </Button>
                        )}
                    </div>
                )}

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Main Info */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Overview Card */}
                        <Card className="rounded-2xl border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Briefcase size={16} className="text-primary" /> Project Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                <EditableField
                                    label="Title"
                                    value={project.title}
                                    onSave={v => updateField('title', v)}
                                    canEdit={canEdit}
                                />
                                <EditableField
                                    label="Description"
                                    value={project.description}
                                    onSave={v => updateField('description', v)}
                                    canEdit={canEdit}
                                    type="textarea"
                                />
                                <div className="grid grid-cols-2 gap-5">
                                    <EditableField
                                        label="Status"
                                        value={project.status}
                                        onSave={v => updateField('status', v)}
                                        canEdit={canEdit}
                                        options={['planning', 'active', 'on-hold', 'in-review', 'completed', 'cancelled']}
                                    />
                                    <EditableField
                                        label="Priority"
                                        value={project.priority}
                                        onSave={v => updateField('priority', v)}
                                        canEdit={canEdit}
                                        options={['low', 'medium', 'high', 'critical']}
                                    />
                                </div>
                                <EditableField
                                    label="Tags (comma-separated)"
                                    value={project.tags?.join(', ')}
                                    onSave={updateTags}
                                    canEdit={canEdit}
                                />
                            </CardContent>
                        </Card>

                        {/* Timeline & Budget Card */}
                        <Card className="rounded-2xl border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar size={16} className="text-primary" /> Timeline & Budget
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-5">
                                <EditableField
                                    label="Start Date"
                                    value={project.startDate ? project.startDate.substring(0, 10) : ''}
                                    onSave={v => updateField('startDate', v)}
                                    canEdit={canEdit}
                                    type="date"
                                />
                                <EditableField
                                    label="End Date"
                                    value={project.endDate ? project.endDate.substring(0, 10) : ''}
                                    onSave={v => updateField('endDate', v)}
                                    canEdit={canEdit}
                                    type="date"
                                />
                                <EditableField
                                    label="Budget"
                                    value={project.budget != null ? String(project.budget) : ''}
                                    onSave={v => updateField('budget', Number(v))}
                                    canEdit={canEdit}
                                    type="number"
                                />
                                <EditableField
                                    label="Currency"
                                    value={project.currency}
                                    onSave={v => updateField('currency', v)}
                                    canEdit={canEdit}
                                    options={['USD', 'EUR', 'GBP', 'PKR', 'AED']}
                                />
                            </CardContent>
                        </Card>

                        {/* Milestones Section */}
                        <div>
                            <SectionHeader
                                icon={Milestone}
                                title={`Milestones (${milestones.length})`}
                                action={canEdit && (
                                    <Button size="sm" variant="outline" className="gap-1 rounded-xl h-8 text-xs" onClick={() => setAddMsDlg(true)}>
                                        <Plus size={13} /> Add
                                    </Button>
                                )}
                            />
                            {milestones.length === 0 ? (
                                <div className="border-2 border-dashed border-border/50 rounded-2xl p-10 text-center">
                                    <Milestone size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground font-medium">No milestones yet.</p>
                                    {canEdit && (
                                        <Button size="sm" variant="outline" className="mt-4 gap-1" onClick={() => setAddMsDlg(true)}>
                                            <Plus size={13} /> Create First Milestone
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {milestones.map(ms => (
                                        <MilestoneCard
                                            key={ms._id}
                                            ms={ms}
                                            projectId={id}
                                            canEdit={canEdit}
                                            canAssign={canAssign}
                                            allUsers={allUsers}
                                            onUpdated={fetchProject}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Media Links */}
                        {(projectImages.length > 0 || project.demoVideo) && (
                            <Card className="rounded-2xl border-border/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Link2 size={16} className="text-primary" /> Media
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-3">
                                    {projectImages.map((imageUrl, index) => (
                                        <a key={`${imageUrl}-${index}`} href={imageUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline bg-primary/10 px-3 py-2 rounded-lg">
                                            <ImageIcon size={13} /> {index === 0 ? 'Cover Image' : `Image ${index + 1}`}
                                        </a>
                                    ))}
                                    {project.demoVideo && (
                                        <a href={project.demoVideo} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline bg-primary/10 px-3 py-2 rounded-lg">
                                            <Video size={13} /> Demo Video
                                        </a>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT: Sidebar Info */}
                    <div className="space-y-6">

                        {/* Team Card */}
                        <Card className="rounded-2xl border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2"><Users size={16} className="text-primary" /> Team</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Manager */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Manager</p>
                                    {project.manager ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                {(project.manager.name || 'M').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{project.manager.name || 'Assigned'}</p>
                                                <p className="text-[10px] text-muted-foreground">{project.manager.email || ''}</p>
                                            </div>
                                        </div>
                                    ) : <p className="text-xs text-muted-foreground italic">No manager assigned</p>}
                                </div>

                                {/* Developers */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                        Developers ({project.teamMembers?.length || 0})
                                    </p>
                                    {project.teamMembers?.length ? (
                                        <div className="space-y-2">
                                            {project.teamMembers.map((m, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                                                        {(m.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium">{m.name || m}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-xs text-muted-foreground italic">No developers assigned</p>}
                                </div>

                                {/* Clients */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                        Clients ({project.clients?.length || 0})
                                    </p>
                                    {project.clients?.length ? (
                                        <div className="space-y-2">
                                            {project.clients.map((c, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                        {(c.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-medium">{c.name || c}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-xs text-muted-foreground italic">No clients linked</p>}
                                </div>

                                {canAssign && (
                                    <Button size="sm" variant="outline" className="w-full gap-1 rounded-xl" onClick={openAssign}>
                                        <UserPlus size={13} /> Edit Team
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Info Card */}
                        <Card className="rounded-2xl border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2"><Flag size={16} className="text-primary" /> Quick Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {[
                                    { label: 'Created', value: fmt(project.createdAt) },
                                    { label: 'Updated', value: fmt(project.updatedAt) },
                                    { label: 'Start', value: fmt(project.startDate) },
                                    { label: 'End', value: fmt(project.endDate) },
                                    { label: 'Budget', value: project.budget != null ? `${project.currency || 'USD'} ${Number(project.budget).toLocaleString()}` : '—' },
                                    { label: 'Milestones', value: milestones.length },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
                                        <span className="text-xs font-semibold">{item.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* FAQs Card */}
                        {project.faqs?.length > 0 && (
                            <Card className="rounded-2xl border-border/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2"><HelpCircle size={16} className="text-primary" /> FAQs</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {project.faqs.map((faq, i) => (
                                        <div key={i} className="border-b border-border/40 pb-3 last:border-0 last:pb-0">
                                            <p className="text-xs font-bold text-foreground mb-1">Q: {faq.question}</p>
                                            <p className="text-xs text-muted-foreground">A: {faq.answer}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Role notice for developer */}
                        {isDeveloper && (
                            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                                <ShieldAlert size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-700">You can update task statuses and module statuses but cannot assign or delete items.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Assign Project Dialog ─────────────────────────────────────────── */}
            <Dialog open={assignDlg} onOpenChange={setAssignDlg}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader><DialogTitle>Assign Team to "{project.title}"</DialogTitle></DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Project Manager</Label>
                            <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={assignments.manager} onChange={e => setAssignments({ ...assignments, manager: e.target.value })}>
                                <option value="">— Unassigned —</option>
                                {allUsers.filter(u => u.role === 'admin' || u.role === 'manager').map(u => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Add Developer</Label>
                            <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" onChange={e => {
                                if (e.target.value && !assignments.teamMembers.includes(e.target.value))
                                    setAssignments({ ...assignments, teamMembers: [...assignments.teamMembers, e.target.value] });
                                e.target.value = '';
                            }}>
                                <option value="">Select developer...</option>
                                {allUsers.filter(u => u.role === 'developer').map(u => (
                                    <option key={u._id} value={u._id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {assignments.teamMembers.map(devId => {
                                    const dev = allUsers.find(u => u._id === devId);
                                    return dev ? (
                                        <Badge key={devId} variant="secondary" className="cursor-pointer gap-1" onClick={() =>
                                            setAssignments({ ...assignments, teamMembers: assignments.teamMembers.filter(x => x !== devId) })
                                        }>{dev.name} <X size={10} /></Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Add Client</Label>
                            <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" onChange={e => {
                                if (e.target.value && !assignments.clients.includes(e.target.value))
                                    setAssignments({ ...assignments, clients: [...assignments.clients, e.target.value] });
                                e.target.value = '';
                            }}>
                                <option value="">Select client...</option>
                                {allUsers.filter(u => u.role === 'client').map(u => (
                                    <option key={u._id} value={u._id}>{u.name}</option>
                                ))}
                            </select>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {assignments.clients.map(cId => {
                                    const cl = allUsers.find(u => u._id === cId);
                                    return cl ? (
                                        <Badge key={cId} className="bg-blue-100 text-blue-800 cursor-pointer gap-1" onClick={() =>
                                            setAssignments({ ...assignments, clients: assignments.clients.filter(x => x !== cId) })
                                        }>{cl.name} <X size={10} /></Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                        <Button onClick={saveAssign} className="w-full rounded-xl">Save Assignments</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Add Milestone Dialog ─────────────────────────────────────────── */}
            <Dialog open={addMsDlg} onOpenChange={setAddMsDlg}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader><DialogTitle>Add Milestone</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Title *</Label>
                            <Input className="rounded-xl" placeholder="e.g. Sprint 1 – Core Features" value={msForm.title} onChange={e => setMsForm({ ...msForm, title: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Description</Label>
                            <Input className="rounded-xl" placeholder="What does this milestone cover?" value={msForm.description} onChange={e => setMsForm({ ...msForm, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Status</Label>
                                <select className="w-full h-10 px-3 rounded-xl border bg-card text-sm" value={msForm.status} onChange={e => setMsForm({ ...msForm, status: e.target.value })}>
                                    {['pending', 'in-progress', 'completed', 'on-hold'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-wider">Due Date</Label>
                                <Input type="date" className="rounded-xl" value={msForm.dueDate} onChange={e => setMsForm({ ...msForm, dueDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase tracking-wider">Order (Sprint #)</Label>
                            <Input type="number" className="rounded-xl" value={msForm.order} onChange={e => setMsForm({ ...msForm, order: Number(e.target.value) })} />
                        </div>
                        <Button onClick={addMilestone} className="w-full rounded-xl" disabled={!msForm.title}>Create Milestone</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectDetail;
