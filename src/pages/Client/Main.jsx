import React, { useState, useEffect } from "react";
import userService from "../../api/userService";
import {
  MoreVertical,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  Mail,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";

const Main = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 1. Fetch Clients from Backend
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        // Adjust endpoint if you have a specific /api/users/clients route
        const response = await userService.getUsers();

        if (response.data.status === "success") {
          // Filter only users with the role 'client'
          const clientUsers = response.data.data.filter(
            (user) => user.role === "client"
          );
          setClients(clientUsers);
        }
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  // Pagination Logic
  const totalClients = clients.length;
  const totalPages = Math.ceil(totalClients / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = clients.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentClients.map((client) => (
          <Card
            key={client._id}
            className="rounded-3xl border border-border bg-card shadow-sm p-6 flex flex-col hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <Avatar className="w-12 h-12 rounded-xl">
                <AvatarImage
                  src={
                    client.profile ||
                    `https://i.pravatar.cc/150?u=${client._id}`
                  }
                  alt={client.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {client.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreVertical size={20} />
              </Button>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1 leading-tight">
              {client.name}
            </h3>
            <p className="text-xs font-medium text-indigo-500 mb-4">
              {client.company || "Independent Client"}
            </p>

            <div className="space-y-2 mb-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-muted-foreground/60" />
                <span className="text-xs truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-muted-foreground/60" />
                <span className="text-xs">
                  {client.isVerified ? "Verified Partner" : "Standard Client"}
                </span>
              </div>
            </div>

            <hr className="border-border mb-4" />

            <div className="flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Joined
                </span>
                <span className="text-sm font-bold text-foreground">
                  {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant="secondary"
                  className="px-2 py-0.5 font-bold text-[10px]"
                >
                  {client.assignedProjects?.length || 0} Projects
                </Badge>
                <Badge
                  variant="outline"
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border-indigo-500/50 text-indigo-500 bg-indigo-500/5"
                >
                  {client.role.toUpperCase()}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalClients > itemsPerPage && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {indexOfFirstItem + 1} to{" "}
                {Math.min(indexOfLastItem, totalClients)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalClients}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-9 h-9 border-border"
            >
              <ChevronLeft size={16} />
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                onClick={() => handlePageChange(i + 1)}
                className="w-9 h-9 rounded-lg font-bold text-xs"
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-9 h-9 border-border"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
