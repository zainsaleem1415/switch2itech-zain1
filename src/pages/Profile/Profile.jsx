import React, { useState, useEffect } from "react";
import authService from "../../api/authService";
import {
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Camera,
  Edit3,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Clock,
  Briefcase,
  Award,
} from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const Profile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.data.status === "success") {
          setUser(response.data.data);
          console.log(response.data.data)
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="h-[60vh] w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!user)
    return <p className="p-10 text-center">User not found. Please log in.</p>;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "UI";

  return (
    <div className="max-w-4xl px-6 py-10 transition-all duration-300">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-indigo-500" size={24} />
            Account Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as{" "}
            <span className="font-bold text-indigo-500">{user.role}</span>
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 shadow-lg shadow-indigo-500/20 transition-all">
              <KeyRound size={16} className="mr-2" />
              Reset Password
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle>Update Security</DialogTitle>
              <DialogDescription>
                Change your password to keep your account safe.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="w-full rounded-xl bg-indigo-500 font-bold py-6"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-12">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
          <Avatar className="h-32 w-32 border-2 border-border/50 relative z-10 bg-background shadow-sm">
            <AvatarImage src={user.profile} alt={user.name} />
            <AvatarFallback className="bg-indigo-500 text-white text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full h-9 w-9 shadow-lg border-2 border-background z-20"
          >
            <Camera size={14} />
          </Button>
        </div>

        {/* User Details */}
        <div className="flex-1 pt-2 w-full">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-extrabold text-foreground tracking-tighter">
                {user.name}
              </h2>
              {user.isVerified && (
                <CheckCircle
                  size={20}
                  className="text-blue-500 fill-blue-500/10"
                  title="Verified Account"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-indigo-500 text-white border-none px-3 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-widest">
                {user.role}
              </Badge>
              {user.lastLogin && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-medium flex items-center gap-1"
                >
                  <Clock size={10} /> Last Login:{" "}
                  {new Date(user.lastLogin).toLocaleDateString()}
                </Badge>
              )}
            </div>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 pt-8 border-t border-border/40">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Mail size={12} /> Email Address
              </p>
              <p className="text-sm font-semibold text-foreground">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Building2 size={12} /> Organization
              </p>
              <p className="text-sm font-semibold text-foreground">
                {user.company || "Not Specified"}
              </p>
            </div>

            {/* Role Specific Section: Projects/Skills */}
            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Briefcase size={12} /> Assigned Projects
              </p>
              <p className="text-sm font-semibold text-foreground">
                {user.assignedProjects?.length > 0
                  ? `${user.assignedProjects.length} Active Projects`
                  : "No Projects Yet"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Award size={12} /> Expertise
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-secondary px-2 py-0.5 rounded"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-semibold">General Staff</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
