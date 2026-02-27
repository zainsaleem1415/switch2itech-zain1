import React, { useState } from "react";
import projectService from "../../api/projectService";
import {
  Send,
  Layout,
  Tag,
  AlignLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  Flag,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  HelpCircle,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const Addproject = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // State for text inputs
  const [project, setProject] = useState({
    title: "",
    description: "",
    status: "planning",
    priority: "medium",
    budget: 0,
    currency: "USD",
    startDate: "",
    endDate: "",
    tags: "",
  });

  // State for Files
  const [coverImage, setCoverImage] = useState(null);
  const [demoVideo, setDemoVideo] = useState(null);

  // State for FAQs (Array of objects)
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  // FAQ Handlers
  const handleFaqChange = (index, field, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    // Using FormData for File Uploads
    const formData = new FormData();

    // Append standard fields
    Object.keys(project).forEach((key) => {
      if (key === "tags") {
        if (project.tags) {
          const tagArray = project.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
          tagArray.forEach((tag) => formData.append("tags[]", tag));
        }
      } else if (key === "startDate" || key === "endDate") {
        if (project[key]) {
          formData.append(key, new Date(project[key]).toISOString());
        }
      } else {
        formData.append(key, project[key]);
      }
    });

    // Append Files
    if (coverImage) formData.append("coverImage", coverImage);
    if (demoVideo) formData.append("demoVideo", demoVideo);

    // Append FAQs as a stringified array (Backend needs to JSON.parse this)
    const validFaqs = faqs.filter(f => f.question && f.answer);
    if (validFaqs.length > 0) {
      formData.append("faqs", JSON.stringify(validFaqs));
    }

    try {
      const response = await projectService.createProject(formData);

      if (response.data.status === "success") {
        setStatus({
          type: "success",
          message: "Project created successfully!",
        });
        // Optional: Reset form here
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong!";
      setStatus({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-background p-2 transition-colors duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">
          New Project Details
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Sahi data fill karein taake ERP system update ho sake.
        </p>
      </div>

      {status.message && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === "success" ? "border-green-500/50 bg-green-500/10 text-green-600" : "border-red-500/50 bg-red-500/10 text-red-600"}`}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <p className="text-sm font-semibold">{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold">
            <Layout size={16} className="text-primary" /> Project Title
          </Label>
          <Input
            name="title"
            value={project.title}
            onChange={handleChange}
            placeholder="e.g. Website Redesign"
            required
          />
        </div>

        {/* Media Uploads (New) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <ImageIcon size={16} className="text-primary" /> Cover Image
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Video size={16} className="text-primary" /> Demo Video
            </Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setDemoVideo(e.target.files[0])}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Flag size={16} className="text-primary" /> Status
            </Label>
            <select
              name="status"
              value={project.status}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              Priority
            </Label>
            <select
              name="priority"
              value={project.priority}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Budget & Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <DollarSign size={16} className="text-primary" /> Budget
            </Label>
            <Input
              type="number"
              name="budget"
              value={project.budget}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Tag size={16} className="text-primary" /> Tags (comma separated)
            </Label>
            <Input
              name="tags"
              value={project.tags}
              onChange={handleChange}
              placeholder="React, Node, UI"
            />
          </div>
        </div>

        {/* Dates Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Calendar size={16} className="text-primary" /> Start Date
            </Label>
            <Input
              type="date"
              name="startDate"
              value={project.startDate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-bold">
              <Calendar size={16} className="text-primary" /> End Date
            </Label>
            <Input
              type="date"
              name="endDate"
              value={project.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-bold">
            <AlignLeft size={16} className="text-primary" /> Project Description
          </Label>
          <textarea
            name="description"
            value={project.description}
            onChange={handleChange}
            className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Detailed scope..."
            required
          />
        </div>

        {/* FAQ Section (New) */}
        <div className="space-y-4 border-t pt-6">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 font-bold text-lg">
              <HelpCircle size={18} className="text-primary" /> Project FAQs
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFaq}
              className="flex items-center gap-1"
            >
              <Plus size={14} /> Add FAQ
            </Button>
          </div>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="space-y-3 p-4 border rounded-xl bg-muted/20 relative"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                onClick={() => removeFaq(index)}
              >
                <Trash2 size={16} />
              </Button>
              <Input
                placeholder="Question"
                value={faq.question}
                onChange={(e) =>
                  handleFaqChange(index, "question", e.target.value)
                }
              />
              <textarea
                placeholder="Answer"
                className="w-full p-2 rounded-md border bg-background text-sm outline-none focus:ring-1 focus:ring-primary"
                value={faq.answer}
                onChange={(e) =>
                  handleFaqChange(index, "answer", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-6 text-lg font-bold"
        >
          {loading ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            <Send className="mr-2" />
          )}
          Publish to ERP
        </Button>
      </form>
    </div>
  );
};

export default Addproject;
