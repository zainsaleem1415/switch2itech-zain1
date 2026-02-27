import React, { useState } from "react";
import productService from "../../api/productService";
import {
    Send, Package, AlignLeft, Loader2, AlertCircle, CheckCircle2,
    DollarSign, Tag, Image as ImageIcon, Video, Plus, Trash2, HelpCircle, LayoutGrid, Layers, Hexagon
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const Addproduct = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    // State for text inputs
    const [product, setProduct] = useState({
        name: "",
        desc: "",
        category: "Software",
        price: 0,
        stock: 0,
        sku: "",
        techStack: "",
        status: "Active"
    });

    // State for Files
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);

    // State for FAQs (Array of objects)
    const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleMultipleFilesChange = (e, setter) => {
        setter(Array.from(e.target.files));
    };

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

        const formData = new FormData();

        Object.keys(product).forEach((key) => {
            if (key === "techStack") {
                if (product.techStack) {
                    const techArray = product.techStack.split(",").map((t) => t.trim()).filter(Boolean);
                    techArray.forEach((t) => formData.append("techStack[]", t));
                }
            } else {
                formData.append(key, product[key]);
            }
        });

        if (thumbnail) formData.append("thumbnail", thumbnail);
        images.forEach(img => formData.append("image", img));
        videos.forEach(vid => formData.append("video", vid));

        const validFaqs = faqs.filter(f => f.question && f.answer);
        if (validFaqs.length > 0) {
            formData.append("faqs", JSON.stringify(validFaqs));
        }

        try {
            const response = await productService.createProduct(formData);

            if (response.data.status === "success" || response.data) {
                setStatus({
                    type: "success",
                    message: "Product cataloged successfully!",
                });
                setProduct({
                    name: "", desc: "", category: "Software", price: 0, stock: 0, sku: "", techStack: "", status: "Active"
                });
                setImages([]); setVideos([]); setThumbnail(null); setFaqs([{ question: "", answer: "" }]);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Something went wrong!";
            setStatus({ type: "error", message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-card rounded-2xl border p-8 shadow-sm">
            <div className="mb-8 border-b pb-6">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                    New Product Catalog
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Add a new digital asset to the inventory list.
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Core details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold">
                            <Package size={16} className="text-primary" /> Product Name
                        </Label>
                        <Input
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            placeholder="e.g. Enterprise CRM System"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold">
                            <Tag size={16} className="text-primary" /> SKU
                        </Label>
                        <Input
                            name="sku"
                            value={product.sku}
                            onChange={handleChange}
                            placeholder="e.g. SFT-CRM-101"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold">
                            <DollarSign size={16} className="text-primary" /> Price
                        </Label>
                        <Input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold">
                            <Layers size={16} className="text-primary" /> Stock
                        </Label>
                        <Input
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold">
                            <LayoutGrid size={16} className="text-primary" /> Category
                        </Label>
                        <select
                            name="category"
                            value={product.category}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Accessories">Accessories</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 font-bold">
                            Status
                        </Label>
                        <select
                            name="status"
                            value={product.status}
                            onChange={handleChange}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        >
                            <option value="Active">Active</option>
                            <option value="Discontinued">Discontinued</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                        <Hexagon size={16} className="text-primary" /> Tech Stack (comma separated)
                    </Label>
                    <Input
                        name="techStack"
                        value={product.techStack}
                        onChange={handleChange}
                        placeholder="React, Node.js, MongoDB"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold">
                        <AlignLeft size={16} className="text-primary" /> Description
                    </Label>
                    <textarea
                        name="desc"
                        value={product.desc}
                        onChange={handleChange}
                        className="w-full min-h-[120px] p-3 rounded-md border border-input bg-background"
                        placeholder="Detailed product information..."
                        required
                    />
                </div>

                {/* Media Uploads */}
                <div className="space-y-4 border-t pt-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">Media Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ImageIcon size={16} className="text-primary" /> Thumbnail
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setThumbnail(e.target.files[0])}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ImageIcon size={16} className="text-primary" /> Support Images
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleMultipleFilesChange(e, setImages)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Video size={16} className="text-primary" /> Demo Videos
                            </Label>
                            <Input
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={(e) => handleMultipleFilesChange(e, setVideos)}
                            />
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 font-bold text-lg">
                            <HelpCircle size={18} className="text-primary" /> Product FAQs
                        </Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFaq}
                            className="gap-1"
                        >
                            <Plus size={14} /> Add FAQ
                        </Button>
                    </div>
                    <div className="grid gap-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 border rounded-xl bg-muted/20 relative">
                                <div className="flex-1 space-y-3">
                                    <Input
                                        placeholder="Question"
                                        value={faq.question}
                                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Answer"
                                        value={faq.answer}
                                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => removeFaq(index)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
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
                    Publish Product
                </Button>
            </form>
        </div>
    );
};

export default Addproduct;
