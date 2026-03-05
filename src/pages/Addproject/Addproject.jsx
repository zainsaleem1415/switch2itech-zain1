import React, { useState, useEffect } from "react";
import projectService from "../../api/projectService";
import userService from "../../api/userService";
import {
  Send, Layout, Tag, AlignLeft, Loader2, AlertCircle,
  CheckCircle2, Calendar, DollarSign, Flag, Image as ImageIcon,
  Video, Plus, Trash2, HelpCircle, Users, X, ArrowLeft
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../context/ContextProvider";
import { useNavigate } from "react-router-dom";

const selectClass =
  "w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all";

const Addproject = ({ onSuccess, initialData }) => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [allUsers, setAllUsers] = useState([]);

  const [project, setProject] = useState({
    title: "",
    description: "",
    status: "planning",
    priority: "medium",
    budget: "",
    currency: "USD",
    startDate: "",
    endDate: "",
    tags: "",
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [demoVideo, setDemoVideo] = useState(null);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  // Team assignment (only for admin/manager)
  const canAssignTeam = role === "admin" || role === "manager";
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedDevs, setSelectedDevs] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  useEffect(() => {
    if (canAssignTeam) {
      userService.getUsers().then(res => setAllUsers(res.data?.data || [])).catch(() => { });
    }
  }, [canAssignTeam]);

  useEffect(() => {
    if (initialData) {
      setProject({
        title: initialData.title || initialData.name || "",
        description: initialData.description || "",
        status: initialData.status || "planning",
        priority: initialData.priority || "medium",
        budget: initialData.budget || "",
        currency: initialData.currency || "USD",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : "",
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || ""),
      });
      if (initialData.coverImage) setCoverPreview(initialData.coverImage);
      if (initialData.faqs) setFaqs(initialData.faqs.length > 0 ? initialData.faqs : [{ question: "", answer: "" }]);

      setSelectedManager(initialData.manager?._id || initialData.manager || "");
      setSelectedDevs(initialData.teamMembers?.map(m => m._id || m) || []);
      setSelectedClients(initialData.clients?.map(c => c._id || c) || []);
    }
  }, [initialData]);

  const handleChange = (e) =>
    setProject({ ...project, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleFaqChange = (index, field, value) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };
  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (i) => setFaqs(faqs.filter((_, idx) => idx !== i));

  const addDev = (e) => {
    if (e.target.value && !selectedDevs.includes(e.target.value))
      setSelectedDevs([...selectedDevs, e.target.value]);
    e.target.value = "";
  };
  const removeDev = (id) => setSelectedDevs(selectedDevs.filter(x => x !== id));

  const addClient = (e) => {
    if (e.target.value && !selectedClients.includes(e.target.value))
      setSelectedClients([...selectedClients, e.target.value]);
    e.target.value = "";
  };
  const removeClient = (id) => setSelectedClients(selectedClients.filter(x => x !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData();

    // Core fields
    Object.entries(project).forEach(([key, val]) => {
      if (key === "tags") {
        if (val) {
          val.split(",").map(t => t.trim()).filter(Boolean).forEach(t => formData.append("tags[]", t));
        }
      } else if ((key === "startDate" || key === "endDate") && val) {
        formData.append(key, new Date(val).toISOString());
      } else if (key === "budget" && val !== "") {
        formData.append(key, Number(val));
      } else if (val !== "") {
        formData.append(key, val);
      }
    });

    // Files
    if (coverImage) formData.append("coverImage", coverImage);
    if (demoVideo) formData.append("demoVideo", demoVideo);

    // FAQs
    const validFaqs = faqs.filter(f => f.question && f.answer);
    if (validFaqs.length > 0) formData.append("faqs", JSON.stringify(validFaqs));

    // Team (if admin/manager)
    if (canAssignTeam) {
      if (selectedManager) formData.append("manager", selectedManager);
      selectedDevs.forEach(id => formData.append("teamMembers[]", id));
      selectedClients.forEach(id => formData.append("clients[]", id));
    }

    try {
      const response = initialData && initialData._id
        ? await projectService.updateProject(initialData._id, formData)
        : await projectService.createProject(formData);

      if (response.data.status === "success" || response.data) {
        setStatus({ type: "success", message: `Project ${initialData ? 'updated' : 'created'} successfully! 🎉` });
        // Reset
        if (!initialData) {
          setProject({ title: "", description: "", status: "planning", priority: "medium", budget: "", currency: "USD", startDate: "", endDate: "", tags: "" });
          setCoverImage(null); setCoverPreview(null); setDemoVideo(null);
          setFaqs([{ question: "", answer: "" }]);
          setSelectedManager(""); setSelectedDevs([]); setSelectedClients([]);
        }
        if (onSuccess) onSuccess();
        else navigate(-1); // Default router back
      }
    } catch (err) {
      setStatus({ type: "error", message: err.response?.data?.message || "Something went wrong!" });
    } finally {
      setLoading(false);
    }
  };

  const managers = allUsers.filter(u => u.role === "admin" || u.role === "manager");
  const developers = allUsers.filter(u => u.role === "developer");
  const clients = allUsers.filter(u => u.role === "client");

  return (
    <div className="w-full max-w-3xl mx-auto bg-background p-2 transition-colors duration-300">

      {/* Back Navigation */}
      <div className="mb-6 flex">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">{initialData ? 'Edit Project' : 'New Project'}</h2>
        <p className="text-muted-foreground text-sm mt-1">{initialData ? 'Update the selected project configuration logic.' : 'Fill in the details below to provision a new project in the ERP system.'}</p>
      </div>

      {status.message && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-red-500/50 bg-red-500/10 text-red-600"}`}>
          {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <p className="text-sm font-semibold">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Core Info ────────────────────────────────────────────────── */}
        <fieldset className="space-y-5 p-6 rounded-2xl border border-border/60 bg-card/40">
          <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Core Information</legend>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold"><Layout size={15} className="text-primary" /> Project Title *</Label>
            <Input name="title" value={project.title} onChange={handleChange} placeholder="e.g. Website Redesign 2025" required className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold"><AlignLeft size={15} className="text-primary" /> Description</Label>
            <textarea
              name="description"
              value={project.description}
              onChange={handleChange}
              className="w-full min-h-[120px] p-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
              placeholder="Detailed project scope and objectives..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><Flag size={15} className="text-primary" /> Status</Label>
              <select name="status" value={project.status} onChange={handleChange} className={selectClass}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="in-review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Priority</Label>
              <select name="priority" value={project.priority} onChange={handleChange} className={selectClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><DollarSign size={15} className="text-primary" /> Budget</Label>
              <Input type="number" name="budget" value={project.budget} onChange={handleChange} placeholder="0" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Currency</Label>
              <select name="currency" value={project.currency} onChange={handleChange} className={selectClass}>
                {["USD", "EUR", "GBP", "PKR", "AED"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><Calendar size={15} className="text-primary" /> Start Date</Label>
              <Input type="date" name="startDate" value={project.startDate} onChange={handleChange} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><Calendar size={15} className="text-primary" /> End Date</Label>
              <Input type="date" name="endDate" value={project.endDate} onChange={handleChange} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold"><Tag size={15} className="text-primary" /> Tags <span className="text-muted-foreground font-normal text-xs">(comma-separated)</span></Label>
            <Input name="tags" value={project.tags} onChange={handleChange} placeholder="React, Node.js, UI Design" className="rounded-xl" />
          </div>
        </fieldset>

        {/* ── Media Upload ──────────────────────────────────────────────── */}
        <fieldset className="space-y-4 p-6 rounded-2xl border border-border/60 bg-card/40">
          <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Media Assets</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><ImageIcon size={15} className="text-primary" /> Cover Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer rounded-xl" />
              {coverPreview && <img src={coverPreview} alt="preview" className="mt-2 rounded-xl h-28 w-full object-cover border border-border" />}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><Video size={15} className="text-primary" /> Demo Video</Label>
              <Input type="file" accept="video/*" onChange={e => setDemoVideo(e.target.files[0])} className="cursor-pointer rounded-xl" />
              {demoVideo && <p className="text-xs text-muted-foreground mt-1">📹 {demoVideo.name}</p>}
            </div>
          </div>
        </fieldset>

        {/* ── Team Assignment (admin/manager only) ─────────────────────── */}
        {canAssignTeam && (
          <fieldset className="space-y-4 p-6 rounded-2xl border border-border/60 bg-card/40">
            <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Team Assignment</legend>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold"><Users size={15} className="text-primary" /> Project Manager</Label>
              <select className={selectClass} value={selectedManager} onChange={e => setSelectedManager(e.target.value)}>
                <option value="">— Unassigned —</option>
                {managers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Developers</Label>
              <select className={selectClass} onChange={addDev}>
                <option value="">Add developer...</option>
                {developers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedDevs.map(id => {
                  const dev = developers.find(u => u._id === id);
                  return dev ? (
                    <Badge key={id} variant="secondary" className="cursor-pointer gap-1" onClick={() => removeDev(id)}>
                      {dev.name} <X size={10} />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Clients</Label>
              <select className={selectClass} onChange={addClient}>
                <option value="">Add client...</option>
                {clients.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedClients.map(id => {
                  const cl = clients.find(u => u._id === id);
                  return cl ? (
                    <Badge key={id} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 cursor-pointer gap-1" onClick={() => removeClient(id)}>
                      {cl.name} <X size={10} />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </fieldset>
        )}

        {/* ── FAQs ─────────────────────────────────────────────────────── */}
        <fieldset className="space-y-4 p-6 rounded-2xl border border-border/60 bg-card/40">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              <HelpCircle size={14} className="inline mr-1 text-primary" /> Project FAQs
            </legend>
            <Button type="button" variant="outline" size="sm" onClick={addFaq} className="gap-1 rounded-xl h-8 text-xs">
              <Plus size={13} /> Add FAQ
            </Button>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-2 p-4 border rounded-xl bg-background/60 relative">
              <Button
                type="button" variant="ghost" size="icon"
                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 h-7 w-7"
                onClick={() => removeFaq(i)}
              >
                <Trash2 size={14} />
              </Button>
              <Input placeholder="Question" value={faq.question} onChange={e => handleFaqChange(i, "question", e.target.value)} className="rounded-xl" />
              <textarea
                placeholder="Answer"
                className="w-full p-2.5 rounded-xl border border-input bg-background text-sm focus:ring-1 focus:ring-primary outline-none resize-none min-h-[70px]"
                value={faq.answer}
                onChange={e => handleFaqChange(i, "answer", e.target.value)}
              />
            </div>
          ))}
        </fieldset>

        <Button type="submit" disabled={loading} className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 border-0 text-white">
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
          {initialData ? 'Publish Project Update' : 'Publish Project to ERP'}
        </Button>
      </form>
    </div>
  );
};

export default Addproject;
