import React, { useState, useEffect } from "react";
import productService from "../../api/productService";
import userService from "../../api/userService";
import {
    Send, Package, AlignLeft, Loader2, AlertCircle, CheckCircle2,
    Tag, Image as ImageIcon, Video, Plus, Trash2, HelpCircle,
    LayoutGrid, Hexagon, Users, X, Code
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../context/ContextProvider";

const selectClass =
    "w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all";

const Addproduct = ({ onSuccess, initialData }) => {
    const { role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [allClients, setAllClients] = useState([]);

    const [product, setProduct] = useState({
        name: "",
        desc: "",
        category: "",
        techStack: "",
    });

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [videos, setVideos] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

    // Client linking (admin only)
    const isAdmin = role === "admin";
    const [selectedClients, setSelectedClients] = useState([]);

    useEffect(() => {
        if (isAdmin) {
            userService.getUsers().then(res => {
                setAllClients((res.data?.data || []).filter(u => u.role === "client"));
            }).catch(() => { });
        }
    }, [isAdmin]);

    useEffect(() => {
        if (initialData) {
            setProduct({
                name: initialData.name || "",
                desc: initialData.desc || initialData.description || "",
                category: initialData.category || "",
                techStack: Array.isArray(initialData.techStack) ? initialData.techStack.join(', ') : (initialData.techStack || ""),
            });
            if (initialData.faqs) setFaqs(initialData.faqs.length > 0 ? initialData.faqs : [{ question: "", answer: "" }]);
            setSelectedClients(initialData.clients?.map(c => c._id || c) || []);
        }
    }, [initialData]);

    const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files);
        setImagePreviews(files.map(f => URL.createObjectURL(f)));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        setThumbnail(file);
        if (file) setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleFaqChange = (i, field, val) => {
        const updated = [...faqs];
        updated[i][field] = val;
        setFaqs(updated);
    };
    const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
    const removeFaq = (i) => setFaqs(faqs.filter((_, idx) => idx !== i));

    const addClient = (e) => {
        if (e.target.value && !selectedClients.includes(e.target.value))
            setSelectedClients([...selectedClients, e.target.value]);
        e.target.value = "";
    };
    const removeClient = (id) => setSelectedClients(selectedClients.filter(x => x !== id));

    const reset = () => {
        setProduct({ name: "", desc: "", category: "", techStack: "" });
        setImages([]); setImagePreviews([]); setVideos([]);
        setThumbnail(null); setThumbnailPreview(null);
        setFaqs([{ question: "", answer: "" }]);
        setSelectedClients([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        const formData = new FormData();

        // Core fields
        formData.append("name", product.name);
        formData.append("desc", product.desc);
        formData.append("category", product.category);

        // Tech stack: comma-separated → array
        if (product.techStack) {
            product.techStack.split(",").map(t => t.trim()).filter(Boolean).forEach(t => formData.append("techStack[]", t));
        }

        // Clients (admin only)
        selectedClients.forEach(id => formData.append("clients[]", id));

        // Media
        if (thumbnail) formData.append("thumbnail", thumbnail);
        images.forEach(img => formData.append("image", img));
        videos.forEach(vid => formData.append("video", vid));

        // FAQs
        const validFaqs = faqs.filter(f => f.question && f.answer);
        if (validFaqs.length > 0) formData.append("faqs", JSON.stringify(validFaqs));

        try {
            const response = initialData && initialData._id
                ? await productService.updateProduct(initialData._id, formData)
                : await productService.createProduct(formData);

            if (response.data.status === "success" || response.data) {
                setStatus({ type: "success", message: `Product ${initialData ? 'updated' : 'created'} successfully! 🎉` });
                if (!initialData) reset();
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setStatus({ type: "error", message: err.response?.data?.message || "Something went wrong!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-background p-2 transition-colors duration-300">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">{initialData ? 'Edit Product' : 'New Product'}</h2>
                <p className="text-muted-foreground text-sm mt-1">{initialData ? 'Update the catalog entry attributes below.' : 'Add a new digital product or service to the catalog.'}</p>
            </div>

            {status.message && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === "success" ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600" : "border-red-500/50 bg-red-500/10 text-red-600"}`}>
                    {status.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="text-sm font-semibold">{status.message}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Core Info ──────────────────────────────────────────────────── */}
                <fieldset className="space-y-5 p-6 rounded-2xl border border-border/60 bg-card/40">
                    <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Core Information</legend>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold"><Package size={15} className="text-primary" /> Product Name *</Label>
                        <Input name="name" value={product.name} onChange={handleChange} placeholder="e.g. Enterprise CRM System" required className="rounded-xl" />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold"><LayoutGrid size={15} className="text-primary" /> Category *</Label>
                        <Input name="category" value={product.category} onChange={handleChange} placeholder="e.g. SaaS, ERP, Mobile App..." required className="rounded-xl" />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold"><AlignLeft size={15} className="text-primary" /> Description *</Label>
                        <textarea
                            name="desc"
                            value={product.desc}
                            onChange={handleChange}
                            required
                            className="w-full min-h-[120px] p-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                            placeholder="Comprehensive product description..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold"><Code size={15} className="text-primary" /> Tech Stack <span className="text-muted-foreground font-normal text-xs">(comma-separated)</span></Label>
                        <Input name="techStack" value={product.techStack} onChange={handleChange} placeholder="React, Node.js, MongoDB, AWS" className="rounded-xl" />
                    </div>
                </fieldset>

                {/* ── Media Upload ─────────────────────────────────────────────── */}
                <fieldset className="space-y-4 p-6 rounded-2xl border border-border/60 bg-card/40">
                    <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Media Assets</legend>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Thumbnail */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold"><ImageIcon size={15} className="text-primary" /> Thumbnail</Label>
                            <Input type="file" accept="image/*" onChange={handleThumbnailChange} className="cursor-pointer rounded-xl" />
                            {thumbnailPreview && <img src={thumbnailPreview} alt="thumbnail" className="mt-2 rounded-xl h-20 w-full object-cover border border-border" />}
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold"><ImageIcon size={15} className="text-primary" /> Gallery Images</Label>
                            <Input type="file" accept="image/*" multiple onChange={handleImagesChange} className="cursor-pointer rounded-xl" />
                            {imagePreviews.length > 0 && (
                                <div className="flex gap-1 flex-wrap mt-1">
                                    {imagePreviews.slice(0, 3).map((src, i) => (
                                        <img key={i} src={src} alt={`img-${i}`} className="h-14 w-14 object-cover rounded-lg border border-border" />
                                    ))}
                                    {imagePreviews.length > 3 && <div className="h-14 w-14 rounded-lg border bg-muted flex items-center justify-center text-xs font-bold">+{imagePreviews.length - 3}</div>}
                                </div>
                            )}
                        </div>

                        {/* Videos */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 font-bold"><Video size={15} className="text-primary" /> Demo Videos</Label>
                            <Input type="file" accept="video/*" multiple onChange={e => setVideos(Array.from(e.target.files))} className="cursor-pointer rounded-xl" />
                            {videos.length > 0 && <p className="text-xs text-muted-foreground mt-1">📹 {videos.length} video(s) selected</p>}
                        </div>
                    </div>
                </fieldset>

                {/* ── Client Linking (admin only) ───────────────────────────────── */}
                {isAdmin && (
                    <fieldset className="space-y-4 p-6 rounded-2xl border border-border/60 bg-card/40">
                        <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2"><Users size={13} className="inline mr-1 text-primary" /> Link Clients</legend>
                        <select className={selectClass} onChange={addClient}>
                            <option value="">Add client...</option>
                            {allClients.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {selectedClients.map(id => {
                                const cl = allClients.find(u => u._id === id);
                                return cl ? (
                                    <Badge key={id} className="bg-blue-100 text-blue-800 cursor-pointer gap-1" onClick={() => removeClient(id)}>
                                        {cl.name} <X size={10} />
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </fieldset>
                )}

                {/* ── FAQs ─────────────────────────────────────────────────────── */}
                <fieldset className="space-y-4 p-6 rounded-2xl border border-border/60 bg-card/40">
                    <div className="flex items-center justify-between">
                        <legend className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                            <HelpCircle size={14} className="inline mr-1 text-primary" /> Product FAQs
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

                <Button type="submit" disabled={loading} className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-primary text-white border-0 transition-all hover:scale-[1.01]">
                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Send className="mr-2" size={18} />}
                    {initialData ? 'Publish Update to Catalog' : 'Publish Product to Catalog'}
                </Button>
            </form>
        </div>
    );
};

export default Addproduct;
