import React, { useState, useEffect } from "react";
import productService from "../../api/productService";
import {
  Search,
  Plus,
  Loader2,
  Video,
  Image as ImageIcon,
  MessageSquareMore,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import Main from "./Main";

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        // Handling both { status: 'success', data: [...] } and direct array
        const fetchedData = response.data.data || response.data;
        setProducts(Array.isArray(fetchedData) ? fetchedData : []);
      } catch (error) {
        console.error(error);
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter((p) => p._id !== id));
        setSelectedProduct(null);
      } catch (error) {
        console.error(error);
        alert("Delete failed.");
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted-foreground font-medium animate-pulse">
            Syncing Inventory...
          </p>
        </div>
      </div>
    );

  if (selectedProduct) {
    return (
      <Main
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onDelete={() => handleDelete(selectedProduct._id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Digital Inventory
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">
              {filteredProducts.length} Products in Repository
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-6 bg-card border-border rounded-xl w-64 shadow-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button className="flex items-center gap-2 bg-primary px-6 py-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              <Plus size={18} /> New Product
            </Button>
          </div>
        </div>

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
              onClick={() => setSelectedProduct(product)}
              className="group bg-card border-border rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-2 hover:border-primary/40 shadow-sm"
            >
              {/* Media Preview Section */}
              <div className="relative h-60 w-full overflow-hidden bg-muted">
                <img
                  src={
                    product.thumbnail ||
                    (product.image && product.image[0]) ||
                    "https://placehold.co/600x400?text=No+Preview"
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={product.name}
                />

                {/* Media Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.video?.length > 0 && (
                    <Badge className="bg-black/60 backdrop-blur-md text-white border-none px-3 py-1">
                      <Video size={12} className="mr-1.5" /> Video Demo
                    </Badge>
                  )}
                  {product.image?.length > 0 && (
                    <Badge className="bg-white/90 backdrop-blur-md text-black border-none px-3 py-1 font-bold">
                      <ImageIcon size={12} className="mr-1.5" />{" "}
                      {product.image.length} Assets
                    </Badge>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary text-primary-foreground font-black uppercase text-[10px] px-4 py-1 rounded-full shadow-lg">
                    {product.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {product.name}
                  </h3>
                  {product.faqs?.length > 0 && (
                    <div
                      className="flex items-center text-muted-foreground gap-1"
                      title={`${product.faqs.length} FAQs available`}
                    >
                      <MessageSquareMore size={16} />
                      <span className="text-xs font-bold">
                        {product.faqs.length}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed">
                  {product.desc}
                </p>

                {/* Tech Stack Mapping */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.techStack?.slice(0, 4).map((tech, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1 bg-secondary/50 text-[10px] font-bold uppercase tracking-wider"
                    >
                      {tech}
                    </Badge>
                  ))}
                  {product.techStack?.length > 4 && (
                    <span className="text-[10px] font-bold text-muted-foreground self-center">
                      +{product.techStack.length - 4} more
                    </span>
                  )}
                </div>

                {/* Footer Section: Client & Metadata */}
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">
                      Primary Client
                    </span>
                    <span className="text-sm font-bold text-foreground/90">
                      {product.clients && product.clients.length > 0
                        ? product.clients[0].name
                        : "Public Resource"}
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-secondary/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Layers size={18} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;
