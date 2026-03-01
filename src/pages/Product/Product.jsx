import React, { useState, useEffect } from "react";
import productService from "../../api/productService";
import {
  Search,
  Loader2,
  Video,
  ChevronRight,
  AlertCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import Main from "./Main";

// --- SHADCN IMPORT ---
// Using relative path to ensure it works with your current project structure
import { Button } from "../../components/ui/button";

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- VIEW MODE STATE ---
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        const fetchedData = response.data?.data || response.data || [];
        setProducts(Array.isArray(fetchedData) ? fetchedData : []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to sync inventory.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary mb-2" size={32} />
        <p className="text-sm font-medium text-muted-foreground">
          Loading Inventory...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-center px-4">
        <AlertCircle size={40} className="text-destructive mb-4" />
        <p className="font-semibold text-muted-foreground">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 font-bold"
        >
          Retry
        </Button>
      </div>
    );

  if (selectedProduct) {
    return (
      <Main
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onDelete={() => {
          setProducts(products.filter((p) => p._id !== selectedProduct._id));
          setSelectedProduct(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-border pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              Digital Inventory
            </h1>
            {/* <p className="text-muted-foreground text-sm font-medium">
               {filteredProducts.length} Products
            </p> */}
          </div>

          <div className="flex items-center gap-3">
            {/* SEARCH */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64 transition-all"
              />
            </div>

            {/* --- VIEW TOGGLE --- */}
            <div className="flex bg-muted/50 p-1 rounded-lg border border-border shadow-sm">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"} // Change 'secondary' to 'default'
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`h-8 w-8 transition-all ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background"
                }`}
              >
                <LayoutGrid size={16} />
              </Button>

              <Button
                variant={viewMode === "list" ? "default" : "ghost"} // Change 'secondary' to 'default'
                size="icon"
                onClick={() => setViewMode("list")}
                className={`h-8 w-8 transition-all ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background"
                }`}
              >
                <List size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* PRODUCTS DISPLAY */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-medium bg-card/50">
            No items found matching your search.
          </div>
        ) : viewMode === "grid" ? (
          /* --- GRID LAYOUT --- */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  <img
                    src={
                      product.thumbnail ||
                      (product.image && product.image[0]) ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
                    }
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={product.name}
                  />
                  <div className="absolute top-3 left-3">
                    {product.video?.length > 0 && (
                      <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-md">
                        <Video size={10} /> Video
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-3 right-3 bg-white/90 text-slate-900 text-[10px] px-3 py-1 rounded-full shadow-sm font-bold uppercase border border-slate-100">
                    {product.category || "General"}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <ChevronRight
                      size={18}
                      className="text-muted-foreground group-hover:translate-x-1 transition-all"
                    />
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-6 h-16 leading-relaxed">
                    {product.desc ||
                      "Detailed product specs are currently being updated."}
                  </p>
                  <div className="flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">
                        Status
                      </span>
                      <span
                        className={`text-xs font-bold ${product.status === "Out of Stock" ? "text-destructive" : "text-green-600"}`}
                      >
                        {product.status || "In Stock"}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">
                        Stock
                      </span>
                      <span className="text-xs font-bold text-foreground">
                        {product.stock || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- LIST LAYOUT --- */
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer bg-card border border-border rounded-xl p-4 flex items-center gap-6 hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={
                      product.thumbnail ||
                      (product.image && product.image[0]) ||
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-bold text-muted-foreground uppercase tracking-tighter">
                      {product.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {product.desc}
                  </p>
                </div>
                <div className="hidden md:flex flex-col items-end gap-1 w-32">
                  <span
                    className={`text-xs font-bold ${product.status === "Out of Stock" ? "text-destructive" : "text-green-600"}`}
                  >
                    {product.status || "In Stock"}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-black">
                    Qty: {product.stock || "0"}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-muted-foreground group-hover:translate-x-1 transition-transform"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
