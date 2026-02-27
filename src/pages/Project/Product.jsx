import React, { useState, useEffect } from "react";
import projectService from "../../api/projectService";
import { Search, Plus, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import Main from "./Main";

const ProductDashboard = () => {
  const [projects, setProjects] = useState([]); // Sahi state name
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // --- FETCH DATA SECTION ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectService.getAllProjects();

        // Backend response structure: { status: "success", data: [...] }
        if (response.data && response.data.data) {
          setProjects(response.data.data); // Sahi setter call
        } else {
          setProjects(response.data); // Fallback
        }
      } catch (error) {
        console.error(error);
        console.error("Error loading projects:", error);
        setError("Projects load nahi ho sakay. Server check karein.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm("Kya aap waqai is project ko delete karna chahte hain?")
    ) {
      try {
        await projectService.deleteProject(id);
        setProjects(projects.filter((p) => p._id !== id));
        setSelectedProject(null);
      } catch (error) {
        console.error(error);
        alert("Delete fail ho gaya.");
      }
    }
  };

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
          Dobara Koshish Karein
        </Button>
      </div>
    );

  if (selectedProject) {
    return (
      <Main
        product={selectedProject}
        onBack={() => setSelectedProject(null)}
        onDelete={() => handleDelete(selectedProject._id)}
      />
    );
  }

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
              {filteredProjects.length} Active Projects Milay
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 md:w-64 h-10"
              />
            </div>
            <Button className="h-10 px-4 font-bold">
              <Plus size={16} className="mr-2" strokeWidth={3} />
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground">Koi project nahi mila.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className="group border-border rounded-2xl overflow-hidden transition-all hover:shadow-lg cursor-pointer bg-card"
              >
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <img
                    src={
                      project.coverImage ||
                      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000"
                    }
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary text-primary-foreground uppercase text-[10px]">
                      {project.status}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-bold truncate mb-1">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-4 h-8">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        Priority
                      </span>
                      <span className="text-xs font-semibold capitalize">
                        {project.priority}
                      </span>
                    </div>
                    <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <ExternalLink size={14} />
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
