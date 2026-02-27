import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  TrendingUp, TrendingDown, DollarSign, 
  Briefcase, CreditCard, Download, 
  Calendar, ArrowUpRight, Filter,
  Search, CheckCircle2, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const MOCK_REVENUE_DATA = [
  {
    _id: "rev1",
    projectName: "E-Commerce Platform",
    client: "Global Retail Inc.",
    amount: 12500.00,
    status: "Paid",
    date: "2026-02-10",
    paymentMethod: "Bank Transfer",
    category: "Development"
  },
  {
    _id: "rev2",
    projectName: "Cloud Migration",
    client: "FinFlow IO",
    amount: 8200.00,
    status: "Pending",
    date: "2026-02-20",
    paymentMethod: "Stripe",
    category: "Consulting"
  },
  {
    _id: "rev3",
    projectName: "UI/UX Redesign",
    client: "Aether AI",
    amount: 4500.00,
    status: "Paid",
    date: "2026-01-25",
    paymentMethod: "PayPal",
    category: "Design"
  }
];

const Revenuepage = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/revenue");
        setTransactions(res.data?.length > 0 ? res.data : MOCK_REVENUE_DATA);
      } catch (error) { console.error(error);
        setTransactions(MOCK_REVENUE_DATA);
      }
    };
    fetchRevenue();
  }, []);

  const stats = [
    { label: "Total Revenue", value: "$125,450", trend: "+18%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { label: "Pending Invoices", value: "$14,200", trend: "3 Items", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10" },
    { label: "Project Earnings", value: "$88,400", trend: "70% of total", icon: Briefcase, color: "text-blue-600", bg: "bg-blue-500/10" },
    { label: "Avg. Deal Size", value: "$4,200", trend: "+5%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground font-medium">Track project earnings, transaction history, and fiscal growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 gap-2"><Calendar size={18} /> Last 30 Days</Button>
          <Button className="rounded-xl h-11 px-6 gap-2 shadow-lg shadow-primary/20"><Download size={18} /> Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={22} />
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
              <h2 className="text-3xl font-black">{stat.value}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b pb-6 gap-4">
            <div>
              <CardTitle className="text-xl">Project Revenue Ledger</CardTitle>
              <CardDescription>Breakdown of earnings by individual project</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search projects..." 
                className="pl-9 h-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/30 border-b text-[11px] font-black uppercase text-muted-foreground">
                    <th className="p-5">Project & Client</th>
                    <th className="p-5">Category</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transactions.map((item) => (
                    <tr key={item._id} className="hover:bg-muted/20 transition-colors group">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.projectName}</span>
                          <span className="text-[11px] text-muted-foreground">{item.client}</span>
                        </div>
                      </td>
                      <td className="p-5 text-xs font-medium text-muted-foreground">{item.category}</td>
                      <td className="p-5 font-black text-sm">${item.amount.toLocaleString()}</td>
                      <td className="p-5">
                        <Badge className={`rounded-lg px-2 text-[10px] uppercase font-bold border-none ${
                          item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-5 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                          <ArrowUpRight size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-muted/10">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Incoming payments and audits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {transactions.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  item.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}>
                  <CreditCard size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-tight">{item.client}</p>
                  <p className="text-[11px] text-muted-foreground italic">{item.paymentMethod} • {item.date}</p>
                </div>
                <div className="text-right font-black text-sm">
                  {item.status === 'Paid' ? `+$${item.amount}` : `$${item.amount}`}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full rounded-xl mt-4 font-bold text-xs uppercase tracking-widest">
              View All Transactions
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Revenuepage;