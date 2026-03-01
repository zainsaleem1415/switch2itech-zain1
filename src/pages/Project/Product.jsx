import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import projectService from "../../api/projectService";
import { useAuth } from "../../context/ContextProvider";
import {
  Search,
  Plus,
  ExternalLink,
  Loader2,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const getProjectPrimaryImage = (project) => {
  if (Array.isArray(project?.image) && project.image.length > 0) {
    return project.image[0];
  }
  if (Array.isArray(project?.images) && project.images.length > 0) {
    return project.images[0];
  }
  if (project?.coverImage) {
    return project.coverImage;
  }
  if (project?.thumbnail) {
    return project.thumbnail;
  }
  return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000";
};

const ProductDashboard = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const canAdd = role === "admin" || role === "manager";

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();

        // Standardized data extraction
        if (response.data && response.data.data) {
          setProjects(response.data.data); // Correct setter call
        } else {
          setProjects(response.data || []); // Fallback to empty array
        }
      } catch (error) {
        console.error("Error loading projects:", error);
        setError(
          "Could not load projects. Please check the server connection."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter logic
  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  if (error)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-destructive p-4 text-center">
        <AlertCircle size={40} className="mb-4" />
        <p className="font-bold">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-background p-6 md:px-12 md:py-8 font-sans text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Project Management
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              Found {filteredProjects.length} Active Projects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 md:w-64 h-10 rounded-xl"
              />
            </div>
            {canAdd && (
              <Button
                className="h-10 px-4 font-bold rounded-xl"
                onClick={() => navigate("/add-project")}
              >
                <Plus size={16} className="mr-2" strokeWidth={3} /> New Project
              </Button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl">
            <FolderGit2
              className="text-muted-foreground mb-4 opacity-20"
              size={48}
            />
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project._id}
                onClick={() =>
                  navigate(`/projects/${project._id}`, {
                    state: { project },
                  })
                }
                className="group border-border rounded-2xl overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-card hover:-translate-y-0.5 duration-300"
              >
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <img
                    src={getProjectPrimaryImage(project)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-none uppercase text-[10px]">
                      {project.status}
                    </Badge>
                  </div>
                  {project.priority && (
                    <div className="absolute top-2 left-2">
                      <Badge
                        variant="outline"
                        className="bg-black/40 backdrop-blur-sm text-white border-white/20 uppercase text-[9px]"
                      >
                        {project.priority}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-base font-bold truncate mb-1">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-3 min-h-[2rem]">
                    {project.description || "No description provided."}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FolderGit2 size={13} />
                      <span>{project.teamMembers?.length || 0} developers</span>
                    </div>
                    <div className="h-7 w-7 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ExternalLink size={13} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDashboard;
