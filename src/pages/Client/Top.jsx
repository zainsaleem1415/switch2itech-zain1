import React, { useState, useEffect } from "react";
import userService from "../../api/userService";
import projectService from "../../api/projectService";
import { Search, Star, StarHalf, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";

const Top = ({ onSearch }) => {
  // Added onSearch prop for functionality
  const [counts, setCounts] = useState({ clients: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetching both users and projects
        const [userRes, projectRes] = await Promise.all([
          userService.getUsers(),
          projectService.getAllProjects()
        ]);

        if (
          userRes.data.status === "success" &&
          projectRes.data.status === "success"
        ) {
          // Filter users to count only those with role 'client'
          const clientCount = userRes.data.data.filter(
            (u) => u.role === "client"
          ).length;
          // Count only projects that are not 'cancelled'
          const activeProjectCount = projectRes.data.data.filter(
            (p) => p.status === "active"
          ).length;

          setCounts({
            clients: clientCount,
            projects: activeProjectCount,
          });
        }
      } catch (err) {
        console.error("Error fetching top stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: "Total clients",
      value: loading ? "..." : counts.clients.toLocaleString(),
      imgUrl: "/Images/Client/People.png",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Projects",
      value: loading ? "..." : counts.projects.toLocaleString(),
      subtext: "Ongoing",
      imgUrl: "/Images/Client/Office.png",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Client satisfaction",
      value: "4.8",
      subtext: "",
      imgUrl: "/Images/Client/Star.png",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-border bg-card shadow-sm flex items-center p-6 rounded-3xl transition-all duration-300"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center shrink-0`}
            >
              <img
                src={stat.imgUrl}
                alt={stat.label}
                className="w-8 h-8 object-contain"
              />
            </div>

            <div className="flex flex-col justify-center ml-4">
              <p className="text-sm font-medium text-muted-foreground leading-tight mb-1">
                {stat.label}
              </p>
              <div className="flex items-end gap-2">
                <h2 className="text-2xl font-bold text-foreground leading-none">
                  {stat.value}
                </h2>

                {stat.label === "Client satisfaction" && (
                  <div className="flex items-center gap-0.5 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="fill-amber-400 text-amber-400"
                      />
                    ))}
                    <StarHalf
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  </div>
                )}

                {stat.subtext && (
                  <span className="text-xs font-medium text-muted-foreground mb-0.5 whitespace-nowrap">
                    {stat.subtext}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search by name, company or email..."
          onChange={(e) => onSearch(e.target.value)}
          className="bg-card border-border rounded-2xl py-6 pl-12 pr-4 text-sm shadow-sm transition-all"
        />
      </div>
    </div>
  );
};

export default Top;
