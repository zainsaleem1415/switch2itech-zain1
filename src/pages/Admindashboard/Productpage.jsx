import React, { useState, useEffect } from "react";
import productService from "../../api/productService";
import {
  Package, Users, Edit3, Trash2, Plus,
  Search, Filter, MoreVertical, AlertCircle,
  CheckCircle2, RefreshCcw, Download, History,
  ArrowUpRight, BarChart3, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import Addproduct from "../Addproduct/Addproduct";

const MOCK_PRODUCTS = [
  {
    _id: "p1",
    name: "Quantum Series Laptop",
    category: "Hardware",
    price: "1,499.00",
    stock: 24,
    sku: "PRD-QS-001",
    status: "Active",
    lastUpdated: "2 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop"
  },
  {
    _id: "p2",
    name: "Nebula OS Enterprise",
    category: "Software",
    price: "2,499.00",
    stock: 150,
    sku: "SFT-NB-992",
    status: "Active",
    lastUpdated: "5 hours ago",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop"
  },
  {
    _id: "p3",
    name: "Aero Mechanical Keyboard",
    category: "Peripherals",
    price: "159.00",
    stock: 8,
    sku: "ACC-AR-551",
    status: "Low Stock",
    lastUpdated: "1 day ago",
    imageUrl: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000&auto=format&fit=crop"
  },
  {
    _id: "p4",
    name: "Titan Graphics Module",
    category: "Hardware",
    price: "899.00",
    stock: 0,
    sku: "PRD-TG-404",
    status: "Out of Stock",
    lastUpdated: "Just now",
    imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1000&auto=format&fit=crop"
  },
  {
    _id: "p5",
    name: "Streamer Mic Pro",
    category: "Audio",
    price: "249.00",
    stock: 45,
    sku: "AUD-MP-102",
    status: "Active",
    lastUpdated: "3 days ago",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000&auto=format&fit=crop"
  }
];

const Productpage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentView, setCurrentView] = useState("list");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        setProducts(res.data?.length > 0 ? res.data : MOCK_PRODUCTS);
      } catch (err) {
        setProducts(MOCK_PRODUCTS);
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
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        console.error("Failed to delete product:", err);
        alert("Failed to delete product.");
      }
    }
  };

  const stats = [
    { label: "Total Assets", value: products.length, trend: "+12%", icon: Package, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Total Buyers", value: "1,284", trend: "+5.4%", icon: Users, color: "text-purple-600", bg: "bg-purple-500/10" },
    { label: "Inventory Value", value: "$428k", trend: "+18%", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Critical Stock", value: products.filter(p => p.stock < 10).length, trend: "-2", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-500/10" },
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "All" || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  if (currentView === "add") {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-10 space-y-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Create Hardware / Software Asset</h1>
            <p className="text-muted-foreground">Provision a new product entry to the catalog ecosystem.</p>
          </div>
          <Button variant="outline" onClick={() => { setCurrentView("list"); fetchProducts(); }} className="gap-2 rounded-xl">
            <ChevronRight className="rotate-180" size={16} /> Cancel & Return
          </Button>
        </div>
        <Addproduct />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background min-h-screen max-w-[1600px] mx-auto animate-in fade-in duration-700">

      {/* SECTION: BREADCRUMBS & HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Admin</span> <ChevronRight size={14} /> <span>Inventory</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Product Catalog</h1>
          <p className="text-muted-foreground max-w-xl">
            Enterprise-grade management system for product deployment, licensing, and SKU lifecycle tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 rounded-xl gap-2 font-semibold">
            <Download size={18} /> Export CSV
          </Button>
          <Button onClick={() => setCurrentView("add")} className="h-11 px-8 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20">
            <Plus size={18} /> Create Product
          </Button>
        </div>
      </div>

      {/* SECTION: PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/40 hover:bg-card transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <h2 className="text-3xl font-black">{stat.value}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SECTION: MAIN DATA GRID */}
      <Card className="border-border/50 shadow-2xl shadow-black/5 overflow-hidden">
        <CardHeader className="space-y-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit">
              {["All", "Hardware", "Software", "Audio"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                <Input
                  placeholder="Search by SKU or Name..."
                  className="pl-9 h-11 rounded-xl bg-muted/50 focus:bg-background transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl"><Filter size={18} /></Button>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl"><History size={18} /></Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-y border-border/50">
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Product Identifier</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Classification</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Stock Status</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-muted-foreground">Market Price</th>
                  <th className="p-5 text-[11px] font-black uppercase tracking-wider text-muted-foreground text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-muted/20 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all">
                          <img src={product.imageUrl} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base leading-none text-foreground">{product.name}</span>
                          <span className="text-[11px] font-mono text-muted-foreground mt-1.5 uppercase tracking-tighter">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <Badge variant="secondary" className="rounded-lg px-2.5 py-0.5 font-bold text-[10px] uppercase">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="p-5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between w-24 text-[10px] font-bold uppercase">
                          <span className="text-muted-foreground">Level</span>
                          <span className={product.stock < 10 ? 'text-rose-500' : 'text-emerald-500'}>{product.stock} Units</span>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ${product.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(product.stock, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">${product.price}</span>
                        <span className="text-[10px] text-muted-foreground font-medium italic">Incl. Tax</span>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-500 hover:bg-blue-500/10 rounded-lg">
                          <Edit3 size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-500/10 rounded-lg" onClick={() => handleDelete(product._id)}>
                          <Trash2 size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                          <MoreVertical size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FOOTER: PAGINATION PLACEHOLDER */}
          <div className="p-5 border-t border-border/50 flex items-center justify-between bg-muted/10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Showing {filteredProducts.length} of {products.length} Assets
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold px-4 rounded-lg">Previous</Button>
              <Button variant="outline" size="sm" className="h-8 text-xs font-bold px-4 rounded-lg">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Productpage;