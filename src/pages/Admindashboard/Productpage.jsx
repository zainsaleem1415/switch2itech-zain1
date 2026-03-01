import React, { useState, useEffect } from "react";
import productService from "../../api/productService";
import { toast } from 'react-hot-toast';
import {
  Package, Users, Edit3, Trash2, Plus,
  Search, Filter, MoreVertical, AlertCircle,
  Loader2, History, ArrowLeft, BarChart3, ChevronRight,
  TrendingUp, Box, Eye, LayoutGrid, List
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import Addproduct from "../Addproduct/Addproduct";
import Main from "../Product/Main";

const Productpage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentView, setCurrentView] = useState("list");
  const [layoutStyle, setLayoutStyle] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAllProducts();
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        console.error("Failed to delete product:", err);
        toast.error("Failed to delete product.");
      }
    }
  };

  const inventoryValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);
  const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;

  const stats = [
    { label: "Total Assets", value: products.length, trend: "+12%", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Buyers", value: "1,284", trend: "+5.4%", icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Inventory Value", value: `$${(inventoryValue / 1000).toFixed(1)}k`, trend: "+18%", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Critical Stock", value: lowStockCount, trend: "-2", icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  if (currentView === "add" || currentView === "edit") {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">{currentView === "edit" ? "Edit Asset" : "Create Asset"}</h1>
            <p className="text-muted-foreground">{currentView === "edit" ? "Modify catalog item properties." : "Provision a new product entry to the catalog ecosystem."}</p>
          </div>
          <Button variant="outline" onClick={() => { setCurrentView("list"); setSelectedProduct(null); fetchProducts(); }} className="gap-2 rounded-xl">
            <ArrowLeft size={16} /> Cancel & Return
          </Button>
        </div>
        <Addproduct
          initialData={currentView === "edit" ? selectedProduct : null}
          onSuccess={() => { setCurrentView("list"); setSelectedProduct(null); fetchProducts(); }}
        />
      </div>
    );
  }

  if (currentView === "view" && selectedProduct) {
    return (
      <div className="min-h-screen bg-background w-full">
        <Main
          product={selectedProduct}
          onBack={() => { setCurrentView("list"); setSelectedProduct(null); }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-in fade-in duration-400">

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                <Box size={12} />
                Inventory
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text py-1">Product Catalog</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Enterprise-grade management system for product deployment, licensing, and SKU lifecycle tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setCurrentView("add")} className="h-11 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-primary hover:from-primary hover:to-indigo-600 border-0 transition-all">
              <Plus size={18} /> Create Product
            </Button>
          </div>
        </div>
      </div>

      {/* SECTION: PERFORMANCE METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="metric-card ring-1 ring-border/50 bg-card/40 hover:bg-card">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest">
                {stat.trend}
              </Badge>
            </div>
            <h2 className="text-3xl font-black tabular-nums">{stat.value}</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* SECTION: MAIN DATA GRID */}
      <div className="dashboard-glass rounded-2xl overflow-hidden border-border/50 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-5 border-b border-border/40 bg-card/30">
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl w-fit border border-border/50">
            {["All", "Web Apps", "Mobile Apps", "APIs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/40">
              <button
                onClick={() => setLayoutStyle("list")}
                className={`p-1.5 rounded-lg transition-all ${layoutStyle === "list" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setLayoutStyle("grid")}
                className={`p-1.5 rounded-lg transition-all ${layoutStyle === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
              <Input
                placeholder="Search by SKU or Name..."
                className="pl-9 h-10 rounded-xl bg-background border-border/50 focus-visible:ring-primary shadow-sm text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background"><Filter size={16} /></Button>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-background"><History size={16} /></Button>
          </div>
        </div>

        {layoutStyle === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary/20 border-b border-border/40">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Product Identifier</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Classification</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Stock Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Market Price</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading && filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold">
                      <Loader2 className="animate-spin inline mr-2" size={16} /> Fetching Catalog...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-bold italic">
                      No products found in the catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-secondary/30 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden border border-border/60 shadow-sm group-hover:border-primary/50 transition-all">
                            <img
                              src={product.thumbnail || product.image?.[0] || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000"}
                              alt=""
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-sm leading-none text-foreground">{product.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">{product.sku || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="rounded-lg px-2.5 py-1 font-black text-[9px] uppercase tracking-widest border border-border/50">
                          {product.category || 'Uncategorized'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 w-24">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-muted-foreground">Level</span>
                            <span className={(product.stock || 0) < 10 ? 'text-rose-500' : 'text-emerald-500'}>{(product.stock || 0)} Units</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden ring-1 ring-inset ring-border/50">
                            <div
                              className={`h-full transition-all duration-1000 ${(product.stock || 0) < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(product.stock || 0, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground">${product.price || 0}</span>
                          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">MSRP</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10 rounded-lg" onClick={() => { setSelectedProduct(product); setCurrentView('view'); }} title="View Product">
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg" onClick={() => { setSelectedProduct(product); setCurrentView('edit'); }} title="Edit Product">
                            <Edit3 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDelete(product._id)}>
                            <Trash2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                            <MoreVertical size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-muted/20">
            {loading && filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground font-bold">
                <Loader2 className="animate-spin inline mr-2" size={16} /> Fetching Catalog...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground font-bold italic">
                No products found in the catalog.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img
                      src={product.thumbnail || product.image?.[0] || "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000"}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className="bg-black/60 backdrop-blur-sm text-white border-0 text-[10px] uppercase tracking-widest px-2.5 py-1">
                        ${product.price || 0}
                      </Badge>
                      <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground border-0 text-[10px] uppercase tracking-widest px-2.5 py-1">
                        {product.category || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-extrabold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em]">{product.sku || 'N/A'}</div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{product.desc || 'No description available for this item.'}</p>
                    <div className="flex items-center gap-1.5 mb-5 w-full">
                      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full ${(product.stock || 0) < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(product.stock || 0, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">{(product.stock || 0)} Units</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg px-2" onClick={() => { setSelectedProduct(product); setCurrentView('view'); }}>
                        <Eye size={13} /> View
                      </Button>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-500/10 rounded-lg" onClick={() => { setSelectedProduct(product); setCurrentView('edit'); }}>
                          <Edit3 size={13} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDelete(product._id)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Productpage;