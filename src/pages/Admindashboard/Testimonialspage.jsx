import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Star, MessageSquare, CheckCircle2,
  Clock, Award, Search, Filter,
  Trash2, Eye, EyeOff, MoreVertical,
  ThumbsUp, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const MOCK_REVIEWS = [
  {
    _id: "t1",
    clientName: "David Miller",
    company: "TechNova Solutions",
    rating: 5,
    status: "Published",
    isFeatured: true,
    content: "The implementation phase was handled with extreme professionalism. Our efficiency increased by 40% in the first quarter alone.",
    date: "2026-02-15",
    avatar: "https://i.pravatar.cc/150?u=david"
  },
  {
    _id: "t2",
    clientName: "Sophia Loren",
    company: "Creative Studio",
    rating: 4,
    status: "Pending",
    isFeatured: false,
    content: "Great tool, though the learning curve for the advanced analytics was a bit steep initially. Support was helpful.",
    date: "2026-02-22",
    avatar: "https://i.pravatar.cc/150?u=sophia"
  },
  {
    _id: "t3",
    clientName: "Marcus Thorne",
    company: "E-Commerce Giants",
    rating: 5,
    status: "Published",
    isFeatured: false,
    content: "Best-in-class performance. We've tried several competitors, but nothing matches the speed and reliability here.",
    date: "2026-01-10",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  }
];

const Testimonialspage = () => {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/testimonials", { withCredentials: true });
      setReviews(res.data?.data?.length >= 0 ? res.data.data : MOCK_REVIEWS);
    } catch (error) {
      console.error(error);
      setReviews(MOCK_REVIEWS);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleApprove = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await axios.patch(`http://localhost:5000/api/testimonials/${id}`, { isApproved: newStatus }, { withCredentials: true });
      setReviews(reviews.map(r => r._id === id ? { ...r, isApproved: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const newFeatured = !currentFeatured;
      await axios.patch(`http://localhost:5000/api/testimonials/${id}`, { isFeatured: newFeatured }, { withCredentials: true });
      setReviews(reviews.map(r => r._id === id ? { ...r, isFeatured: newFeatured } : r));
    } catch (err) {
      console.error(err);
      alert("Failed to update featured status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await axios.delete(`http://localhost:5000/api/testimonials/${id}`, { withCredentials: true });
        setReviews(reviews.filter(r => r._id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete testimonial");
      }
    }
  };

  const stats = [
    { label: "Total Reviews", value: reviews.length, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Average Rating", value: "4.8", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending Approval", value: reviews.filter(r => r.status === "Pending").length, icon: Clock, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  const filteredReviews = reviews.filter(r => {
    const matchesTab = activeTab === "All" ||
      (activeTab === "Featured" ? r.isFeatured :
        (activeTab === "Published" ? r.isApproved : !r.isApproved));
    const matchesSearch = r.authorNameOverride?.toLowerCase().includes(searchTerm.toLowerCase()) || r.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || "";
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background min-h-screen animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Proof Management</h1>
          <p className="text-muted-foreground">Moderate and curate client testimonials for the public website.</p>
        </div>
        <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 gap-2">
          <ThumbsUp size={18} /> Add New Review
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/40">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="space-y-6 pb-6 border-b bg-muted/20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
              {["All", "Published", "Pending", "Featured"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search by client name..."
                className="pl-9 h-10 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 divide-y divide-border/50">
            {filteredReviews.map((review) => (
              <div key={review._id} className="p-6 hover:bg-muted/20 transition-all group relative">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex gap-4">
                    <img src={review.authorAvatarOverride || review.author?.profile || "https://placehold.co/150"} className="h-14 w-14 rounded-2xl border-2 border-muted object-cover" alt="" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-lg">{review.authorNameOverride || review.author?.name || "Anonymous User"}</h4>
                        {review.isFeatured && (
                          <Badge className="bg-amber-500/10 text-amber-600 border-none px-2 py-0 h-5 text-[10px] font-black uppercase cursor-pointer" onClick={() => handleToggleFeatured(review._id, review.isFeatured)}>
                            <Award size={10} className="mr-1" /> Featured
                          </Badge>
                        )}
                        {!review.isFeatured && (
                          <Badge className="bg-muted text-muted-foreground border-none px-2 py-0 h-5 text-[10px] font-black uppercase cursor-pointer hover:bg-amber-500/10 hover:text-amber-600" onClick={() => handleToggleFeatured(review._id, review.isFeatured)}>
                            Feature
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{review.authorRoleOverride || review.author?.role}</p>
                      <div className="flex text-amber-400 gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} strokeWidth={3} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-2xl">
                    <p className="text-sm text-foreground/80 leading-relaxed italic">"{review.content}"</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase mt-4 tracking-widest">Received on {new Date(review.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!review.isApproved ? (
                      <Button variant="outline" size="sm" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-lg font-bold text-xs h-9" onClick={() => handleApprove(review._id, review.isApproved)}>
                        Approve
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-emerald-600 hover:text-rose-500" onClick={() => handleApprove(review._id, review.isApproved)} title="Unpublish">
                        <Eye size={18} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50 rounded-lg" onClick={() => handleDelete(review._id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Testimonialspage;