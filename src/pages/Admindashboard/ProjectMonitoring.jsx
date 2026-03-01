import React, { useState, useEffect } from 'react';
import projectService from '../../api/projectService';
import userService from '../../api/userService';
import {
  Loader2, ArrowLeft, ChevronDown, ChevronRight, CheckCircle2, Clock,
  PlayCircle, Milestone, Plus, UserPlus, Trash2, Edit3
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const selectClass = "w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all";

const ProjectMonitoring = ({ project, onBack }) => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedMilestones, setExpandedMilestones] = useState({});
  const [modulesData, setModulesData] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [tasksData, setTasksData] = useState({});

  const [allUsers, setAllUsers] = useState([]);

  // Modal State for Create & Assign Actions
  const [modal, setModal] = useState({ open: false, type: null, milestoneId: null, moduleId: null, taskId: null, entityData: null });
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (project?._id) {
      fetchMilestones();
      fetchUsers();
    }
  }, [project]);

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers();
      setAllUsers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await projectService.getMilestones(project._id);
      setMilestones(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch milestones:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (milestoneId) => {
    try {
      const res = await projectService.getModules(project._id, milestoneId);
      setModulesData(prev => ({ ...prev, [milestoneId]: res.data?.data || [] }));
    } catch (err) {
      console.error("Failed to fetch modules:", err);
    }
  };

  const fetchTasks = async (milestoneId, moduleId) => {
    try {
      const res = await projectService.getTasks(project._id, milestoneId, moduleId);
      setTasksData(prev => ({ ...prev, [moduleId]: res.data?.data || [] }));
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const toggleMilestone = async (milestoneId) => {
    const isExpanded = !!expandedMilestones[milestoneId];
    setExpandedMilestones(prev => ({ ...prev, [milestoneId]: !isExpanded }));
    if (!isExpanded && !modulesData[milestoneId]) {
      await fetchModules(milestoneId);
    }
  };

  const toggleModule = async (milestoneId, moduleId) => {
    const isExpanded = !!expandedModules[moduleId];
    setExpandedModules(prev => ({ ...prev, [moduleId]: !isExpanded }));
    if (!isExpanded && !tasksData[moduleId]) {
      await fetchTasks(milestoneId, moduleId);
    }
  };

  // --- CRUD Handlers ---

  const openModal = (type, ids = {}, defaultData = {}) => {
    setModal({ open: true, type, ...ids, entityData: defaultData });
    setFormData(defaultData);
  };
  const closeModal = () => setModal({ open: false, type: null });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const { type, milestoneId, moduleId, taskId } = modal;
      const pId = project._id;

      if (type === 'addMilestone') {
        await projectService.createMilestone(pId, formData);
        await fetchMilestones();
      }
      else if (type === 'addModule') {
        await projectService.createModule(pId, milestoneId, formData);
        await fetchModules(milestoneId);
      }
      else if (type === 'addTask') {
        await projectService.createTask(pId, milestoneId, moduleId, formData);
        await fetchTasks(milestoneId, moduleId);
      }
      else if (type === 'assignModule') {
        await projectService.assignModule(pId, milestoneId, moduleId, { assignedTo: formData.assignedTo });
        await fetchModules(milestoneId);
      }
      else if (type === 'assignTask') {
        await projectService.assignTask(pId, milestoneId, moduleId, taskId, { assignedTo: formData.assignedTo });
        await fetchTasks(milestoneId, moduleId);
      }
      else if (type === 'editMilestone') {
        await projectService.updateMilestone(pId, milestoneId, formData);
        await fetchMilestones();
      }
      else if (type === 'editModule') {
        await projectService.updateModule(pId, milestoneId, moduleId, formData);
        await fetchModules(milestoneId);
      }
      else if (type === 'editTask') {
        await projectService.updateTask(pId, milestoneId, moduleId, taskId, formData);
        await fetchTasks(milestoneId, moduleId);
      }

      closeModal();
    } catch (err) {
      console.error(`Action failed:`, err);
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (type, ids) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      const pId = project._id;
      if (type === 'milestone') {
        await projectService.deleteMilestone(pId, ids.milestoneId);
        await fetchMilestones();
      } else if (type === 'module') {
        await projectService.deleteModule(pId, ids.milestoneId, ids.moduleId);
        await fetchModules(ids.milestoneId);
      } else if (type === 'task') {
        await projectService.deleteTask(pId, ids.milestoneId, ids.moduleId, ids.taskId);
        await fetchTasks(ids.milestoneId, ids.moduleId);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed') return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2 py-0 text-[10px] uppercase font-black"><CheckCircle2 size={10} className="mr-1" /> Completed</Badge>;
    if (s === 'in-progress' || s === 'active') return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0 text-[10px] uppercase font-black animate-pulse"><PlayCircle size={10} className="mr-1" /> Active</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2 py-0 text-[10px] uppercase font-black"><Clock size={10} className="mr-1" /> Pending</Badge>;
  };

  const teamMembers = allUsers.filter(u => project.teamMembers?.some(tm => (typeof tm === 'object' ? tm._id : tm) === u._id) || u.role === 'developer');

  // --- Render Modals ---
  const renderModalContent = () => {
    if (!modal.open || !modal.type) return null;
    const isAdding = modal.type.startsWith('add');
    const isEditing = modal.type.startsWith('edit');
    const isAssigning = modal.type.startsWith('assign');

    const titlePrefix = isAdding ? "Create" : isEditing ? "Edit" : "Assign";
    const entityName = modal.type.replace(/add|edit|assign/, '');

    return (
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{titlePrefix} {entityName}</DialogTitle>
        </DialogHeader>

        {(isAdding || isEditing) && (
          <>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder={`Enter ${entityName.toLowerCase()} title`} />
            </div>
            {entityName === 'Milestone' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select className={selectClass} value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Expected Budget</Label>
                  <Input type="number" value={formData.expectedBudget || ''} onChange={e => setFormData({ ...formData, expectedBudget: e.target.value })} placeholder="Optional" />
                </div>
              </div>
            )}
            {entityName === 'Task' && (
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className={selectClass} value={formData.priority || 'medium'} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            )}

            {(entityName === 'Module' || entityName === 'Task') && (
              <div className="space-y-2">
                <Label>Status</Label>
                <select className={selectClass} value={formData.status || 'pending'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </>
        )}

        {isAssigning && (
          <div className="space-y-2">
            <Label>Assign To Developer</Label>
            <select required className={selectClass} value={formData.assignedTo || ''} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}>
              <option value="">— Select Developer —</option>
              {teamMembers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        )}

        <Button type="submit" disabled={formLoading} className="w-full mt-4 bg-primary text-primary-foreground font-bold rounded-xl h-11 shadow-md shadow-primary/20">
          {formLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
          Save Changes
        </Button>
      </form>
    );
  };

  if (!project) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Dialog for Forms */}
      <Dialog open={modal.open} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          {renderModalContent()}
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/40 pb-6 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">{project.title || project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <p className="text-muted-foreground text-sm">Monitoring System &mdash; Establish and manage hierarchical deliverables.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => openModal('addMilestone')} className="gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold border-0 shadow-lg shadow-emerald-500/20">
            <Plus size={16} /> Add Milestone
          </Button>
          <Button variant="outline" onClick={onBack} className="gap-2 rounded-xl">
            <ArrowLeft size={16} /> Exit Monitor
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-glass rounded-2xl p-6 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="font-bold text-sm">Loading hierarchy...</p>
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-card/50">
            <Milestone size={32} className="mx-auto mb-3 opacity-30 text-primary" />
            <p className="font-bold text-lg">No Milestones Initiated</p>
            <p className="text-sm mt-1 mb-4">You have not partitioned this project into structural phases yet.</p>
            <Button onClick={() => openModal('addMilestone')} variant="outline" className="rounded-xl border-dashed">Commence First Milestone</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {milestones.map(m => (
              <div key={m._id} className="border border-border/60 rounded-xl bg-card shadow-sm overflow-hidden transition-all duration-300">

                {/* Milestone Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-secondary/20 transition-colors gap-3 border-b border-border/30">
                  <div className="flex items-center gap-3" onClick={() => toggleMilestone(m._id)}>
                    <button className="text-muted-foreground hover:text-foreground">
                      {expandedMilestones[m._id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <div>
                      <h3 className="font-extrabold text-[15px]">{m.title}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase mt-0.5">
                        {m.startDate && new Date(m.startDate).toLocaleDateString()} {m.dueDate && `— ${new Date(m.dueDate).toLocaleDateString()}`}
                        {m.expectedBudget && ` | Budget: $${m.expectedBudget}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(m.status)}
                    <div className="h-6 w-px bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shadow-sm border border-border/50 hover:bg-primary hover:text-white rounded-lg" onClick={(e) => { e.stopPropagation(); openModal('addModule', { milestoneId: m._id }); }} title="Add Module">
                      <Plus size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg" onClick={(e) => { e.stopPropagation(); openModal('editMilestone', { milestoneId: m._id }, m); }}>
                      <Edit3 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDelete('milestone', { milestoneId: m._id }); }}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Modules Area */}
                {expandedMilestones[m._id] && (
                  <div className="bg-background/40 p-4 pl-[3.25rem] space-y-3">
                    {!modulesData[m._id] ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="animate-spin" size={14} /> Loading modules...</div>
                    ) : modulesData[m._id].length === 0 ? (
                      <div className="text-[11px] text-muted-foreground italic font-medium p-3 bg-secondary/30 rounded-lg">No modules encapsulated within this milestone.</div>
                    ) : (
                      modulesData[m._id].map(mod => (
                        <div key={mod._id} className="border border-border/50 rounded-xl bg-card overflow-hidden shadow-sm">

                          {/* Module Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 cursor-pointer hover:bg-secondary/40 transition-colors gap-3 border-b border-border/30">
                            <div className="flex items-center gap-3" onClick={() => toggleModule(m._id, mod._id)}>
                              {expandedModules[mod._id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              <div>
                                <span className="font-bold text-sm block">{mod.title}</span>
                                {mod.assignedTo && <Badge variant="secondary" className="text-[9px] uppercase tracking-widest px-1.5 py-0 mt-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">Mgr: {mod.assignedTo.name || 'Assigned'}</Badge>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(mod.status)}
                              <div className="h-5 w-px bg-border mx-1" />
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary shadow-sm border border-border/50 hover:bg-primary hover:text-white rounded-md" onClick={(e) => { e.stopPropagation(); openModal('addTask', { milestoneId: m._id, moduleId: mod._id }); }} title="Add Task">
                                <Plus size={13} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500 hover:bg-amber-500/10 rounded-md" onClick={(e) => { e.stopPropagation(); openModal('assignModule', { milestoneId: m._id, moduleId: mod._id }, { assignedTo: mod.assignedTo?._id || '' }); }} title="Assign Module">
                                <UserPlus size={13} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 rounded-md" onClick={(e) => { e.stopPropagation(); openModal('editModule', { milestoneId: m._id, moduleId: mod._id }, mod); }}>
                                <Edit3 size={13} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-md" onClick={(e) => { e.stopPropagation(); handleDelete('module', { milestoneId: m._id, moduleId: mod._id }); }}>
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </div>

                          {/* Tasks Area */}
                          {expandedModules[mod._id] && (
                            <div className="p-3 pl-11 space-y-2.5 bg-secondary/10 shadow-inner">
                              {!tasksData[mod._id] ? (
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Loader2 className="animate-spin" size={12} /> Loading tasks...</div>
                              ) : tasksData[mod._id].length === 0 ? (
                                <div className="text-[11px] text-muted-foreground italic">No tasks instantiated yet.</div>
                              ) : (
                                tasksData[mod._id].map(task => (
                                  <div key={task._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/40 hover:shadow-sm transition-all text-sm group">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-offset-background ${task.priority === 'critical' ? 'bg-purple-500 ring-purple-500' : task.priority === 'high' ? 'bg-rose-500 ring-rose-500' : task.priority === 'medium' ? 'bg-amber-500 ring-amber-500' : 'bg-blue-500 ring-blue-500'}`} />
                                      <div className="flex flex-col ml-1">
                                        <span className="font-bold text-foreground/90 leading-none">{task.title}</span>
                                        {task.assignedTo && <span className="text-[9px] text-muted-foreground font-black tracking-widest uppercase mt-1.5 flex items-center gap-1"><Users size={9} /> {task.assignedTo.name || 'Assigned'}</span>}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(task.status)}
                                      <div className="h-4 w-px bg-border mx-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" />
                                      <div className="flex items-center gap-0.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-amber-500 hover:bg-amber-500/10 rounded-md" onClick={() => openModal('assignTask', { milestoneId: m._id, moduleId: mod._id, taskId: task._id }, { assignedTo: task.assignedTo?._id || '' })} title="Assign Task">
                                          <UserPlus size={12} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-500 hover:bg-blue-500/10 rounded-md" onClick={() => openModal('editTask', { milestoneId: m._id, moduleId: mod._id, taskId: task._id }, task)}>
                                          <Edit3 size={12} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded-md" onClick={() => handleDelete('task', { milestoneId: m._id, moduleId: mod._id, taskId: task._id })}>
                                          <Trash2 size={12} />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectMonitoring;
