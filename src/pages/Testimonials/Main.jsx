import React, { useState, useEffect } from "react";
import testimonialService from "../../api/testimonialService";
import {
  Pencil,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareOff,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";

const Main = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Increased for a better grid feel



  // 1. Fetch Testimonials from BE
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await testimonialService.getTestimonials();
        const data = response.data.data || response.data;
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Delete Handler
  const handleDelete = async (id) => {
    if (window.confirm("Delete this testimonial?")) {
      try {
        await testimonialService.deleteTestimonial(id);
        setTestimonials(testimonials.filter((t) => t._id !== id));
      } catch (error) {
        console.error(error);
        alert("Failed to delete");
      }
    }
  };

  // Pagination Logic
  const totalItems = testimonials.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = testimonials.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const TestimonialCard = ({ item }) => {
    // Logic to handle Author info (User Object vs Overrides)
    const displayName =
      item.authorNameOverride || item.author?.name || "Anonymous";
    const displayRole =
      item.authorRoleOverride ||
      (item.author?.role === "client" ? "Client" : "User");
    const displayAvatar =
      item.authorAvatarOverride ||
      item.author?.profile ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;
    const displayDate = new Date(item.createdAt).toLocaleDateString();

    return (
      <Card className="bg-card rounded-3xl border border-border shadow-sm p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-md mb-6 min-h-[260px]">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <Avatar className="w-12 h-12 rounded-full border border-border">
                <AvatarImage
                  src={displayAvatar}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h4 className="font-bold text-foreground text-sm leading-tight">
                  {displayName}
                </h4>
                <p className="text-[11px] text-indigo-500 font-bold leading-tight mt-0.5">
                  {displayRole}
                </p>
                <p className="text-[10px] text-muted-foreground/60 leading-tight uppercase mt-1 tracking-wider">
                  {displayDate}
                </p>
              </div>
            </div>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < item.rating ? "#fbbf24" : "none"}
                  stroke={i < item.rating ? "#fbbf24" : "currentColor"}
                  className={
                    i < item.rating
                      ? "text-amber-400"
                      : "text-muted-foreground/20"
                  }
                />
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-6 italic">
            "{item.content}"
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
          <Badge
            variant={item.isApproved ? "success" : "outline"}
            className={`px-3 py-0.5 font-bold text-[10px] uppercase tracking-tighter ${!item.isApproved && "bg-orange-500/10 text-orange-500 border-none"}`}
          >
            {item.isApproved ? "Published" : "Pending"}
          </Badge>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary hover:bg-primary/10"
            >
              <Pencil size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleDelete(item._id)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading)
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm font-medium text-muted-foreground">
          Loading testimonials...
        </p>
      </div>
    );

  if (testimonials.length === 0)
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl opacity-50">
        <MessageSquareOff size={40} className="mb-2" />
        <p className="font-bold">No testimonials found</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-12 pb-10">
      {/* Dynamic Masonry-style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6">
        {currentItems.map((item) => (
          <TestimonialCard key={item._id} item={item} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <div className="flex flex-col">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalItems}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 border-border"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                onClick={() => handlePageChange(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-bold ${currentPage === i + 1 ? "bg-primary text-white" : ""}`}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="w-9 h-9 border-border"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
