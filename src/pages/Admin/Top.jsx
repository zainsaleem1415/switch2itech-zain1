import React, { useState, useEffect } from "react";
import projectService from "../../api/projectService";
import productService from "../../api/productService";
import userService from "../../api/userService";
import testimonialService from "../../api/testimonialService";
import {
  Monitor,
  Package,
  Users,
  Star,
  CircleDollarSign,
  TrendingUp,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import ProjectPage from "../Admindashboard/Projectspage";
import Productpage from "../Admindashboard/Productpage";
import Userspage from "../Admindashboard/Userspage";
import Testimonialspage from "../Admindashboard/Testimonialspage";
import Revenuepage from "../Admindashboard/Revenuepage";

const Top = ({ currentView, setCurrentView }) => {
  const [data, setData] = useState({
    projects: 0,
    products: 0,
    clients: 0,
    testimonials: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch all dashboard counts from Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, prodRes, userRes, testRes] = await Promise.all([
          projectService.getAllProjects(),
          productService.getAllProducts(),
          userService.getUsers(),
          testimonialService.getTestimonials(),
        ]);

        // Calculate Revenue from Project Budgets
        const totalRevenue = projRes.data.data.reduce(
          (sum, proj) => sum + (proj.budget || 0),
          0
        );

        // Consider all users for the Manage Users tab
        const userCount = userRes.data.data.length;

        setData({
          projects: projRes.data.data.length,
          products: prodRes.data.data.length,
          users: userCount,
          testimonials: testRes.data.data.length,
          revenue: totalRevenue,
        });
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentView === "overview") {
      fetchDashboardData();
    }
  }, [currentView]);

  const stats = [
    {
      id: "projects",
      title: "Total Projects",
      value: loading ? "..." : data.projects,
      label: "Live",
      icon: <Monitor className="w-6 h-6 text-blue-500" />,
      labelColor: "text-emerald-600 bg-emerald-500/10",
    },
    {
      id: "products",
      title: "Total Products",
      value: loading ? "..." : data.products,
      label: "Stock",
      icon: <Package className="w-6 h-6 text-indigo-500" />,
      labelColor: "text-blue-600 bg-blue-500/10",
    },
    {
      id: "users",
      title: "Manage Users",
      value: loading ? "..." : data.users,
      label: "All Users",
      icon: <Users className="w-6 h-6 text-orange-500" />,
      labelColor: "text-emerald-600 bg-emerald-500/10",
    },
    {
      id: "testimonials",
      title: "Testimonials",
      value: loading ? "..." : data.testimonials,
      label: "Verified",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      labelColor: "text-amber-600 bg-amber-500/10",
    },
    {
      id: "revenue",
      title: "Total Revenue",
      value: loading ? "..." : `$${data.revenue.toLocaleString()}`,
      label: "Growth",
      icon: <CircleDollarSign className="w-6 h-6 text-emerald-500" />,
      labelColor: "text-emerald-600 bg-emerald-500/10",
    },
  ];

  const BackButton = () => (
    <button
      onClick={() => setCurrentView("overview")}
      className="flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all mb-6"
    >
      <ArrowLeft size={16} /> Back to Dashboard
    </button>
  );

  // View Switcher Logic
  const renderView = () => {
    switch (currentView) {
      case "projects":
        return (
          <>
            <BackButton />
            <ProjectPage />
          </>
        );
      case "products":
        return (
          <>
            <BackButton />
            <Productpage />
          </>
        );
      case "users":
        return (
          <>
            <BackButton />
            <Userspage />
          </>
        );
      case "testimonials":
        return (
          <>
            <BackButton />
            <Testimonialspage />
          </>
        );
      case "revenue":
        return (
          <>
            <BackButton />
            <Revenuepage />
          </>
        );
      default:
        return null;
    }
  };

  if (currentView !== "overview") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {renderView()}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time stats from Switch2iTech ERP
          </p>
        </div>
        {loading && <Loader2 className="animate-spin text-primary" size={24} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            onClick={() => setCurrentView(stat.id)}
            className="cursor-pointer transition-all duration-300 group rounded-2xl border-border/50 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 active:scale-95"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-xl bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                  {stat.icon}
                </div>
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg ${stat.labelColor}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-extrabold mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Top;
