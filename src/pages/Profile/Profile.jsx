import React, { useState, useEffect, useRef } from "react";
import authService from "../../api/authService";
import userService from "../../api/userService";
import toast from "react-hot-toast";
import {
  Mail, Phone, Building2, ShieldCheck, Camera,
  KeyRound, Eye, EyeOff, Loader2, CheckCircle,
  Clock, Briefcase, Award, MapPin, User, Edit3, X, Save
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const ROLE_COLOR = {
  admin: 'bg-red-500/10 text-red-600 border-red-500/25',
  manager: 'bg-blue-500/10 text-blue-600 border-blue-500/25',
  developer: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25',
  client: 'bg-amber-500/10 text-amber-600 border-amber-500/25',
  user: 'bg-secondary text-muted-foreground border-border',
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/40 shadow-sm">
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80">
      <Icon size={12} className="text-primary" /> {label}
    </p>
    <p className="text-sm font-semibold text-foreground">{value || 'Not specified'}</p>
  </div>
);

const EditRow = ({ icon: Icon, label, name, value, onChange, placeholder, disabled = false }) => (
  <div className="space-y-1.5 p-2 rounded-xl bg-secondary/20 border border-border/40">
    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground ml-1">
      <Icon size={12} className="text-primary" /> {label}
    </p>
    <Input
      name={name}
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`h-9 text-sm font-medium ${disabled ? 'bg-muted opacity-60 cursor-not-allowed' : 'bg-background focus-visible:ring-primary'}`}
    />
  </div>
);

const Profile = () => {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Auth / Password States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response.data.status === "success") {
        setUser(response.data.data);
        setEditForm({
          name: response.data.data.name || '',
          company: response.data.data.company || '',
          phoneNo: response.data.data.phoneNo || '',
          address: response.data.data.address || '',
          skills: response.data.data.skills?.join(', ') || ''
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async () => {
    try {
      setIsSaving(true);
      const payload = { ...editForm, skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean) };
      await userService.updateProfile(payload);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      await fetchProfile(); // refresh data
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile', file);

    const uploadPromise = userService.updateProfile(formData).then(() => fetchProfile());

    toast.promise(uploadPromise, {
      loading: 'Uploading new profile picture...',
      success: 'Avatar updated!',
      error: 'Failed to upload avatar.'
    });
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.newPassword) {
      return toast.error("Please provide a new password.");
    }
    try {
      setIsUpdatingPassword(true);
      await userService.updateProfile({ password: passwordForm.newPassword });
      toast.success("Password secured!");
      setIsPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error("Failed to update password", err);
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={36} />
    </div>
  );

  if (!user) return (
    <div className="h-[60vh] flex items-center justify-center text-muted-foreground text-sm">
      User not found. Please log in again.
    </div>
  );

  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 animate-in fade-in duration-400 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <ShieldCheck size={28} className="text-primary" /> Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal details, security, and display preferences.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto gap-2 rounded-xl border-primary/20 hover:border-primary/50 text-foreground transition-all text-xs sm:text-sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <X size={15} /> : <Edit3 size={15} />}
            {isEditing ? "Cancel Edit" : "Edit Details"}
          </Button>

          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto gap-2 rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary border-0 transition-all text-xs sm:text-sm">
                <KeyRound size={15} /> Change Password
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Update Security</DialogTitle>
                <DialogDescription>Change your password to keep your account secure.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      className="pr-10"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handlePasswordSubmit} disabled={isUpdatingPassword} className="w-full rounded-xl">
                  {isUpdatingPassword ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  Save Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-8">
        {/* Hero banner */}
        <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
          {/* Top gradient bar */}
          <div className="h-32 bg-gradient-to-br from-primary/80 via-blue-600 to-indigo-800 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iMSIvPjwvZz48L3N2Zz4=')]" />
          </div>

          <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-6 relative">
            {/* Avatar overlapping banner */}
            <div className="relative -mt-16 flex-shrink-0 group">
              <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-card shadow-xl bg-card transition-transform group-hover:scale-105 duration-300">
                <AvatarImage src={user.profile} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 h-9 w-9 bg-primary border-4 border-card rounded-full flex items-center justify-center shadow-lg text-primary-foreground hover:bg-primary/90 transition-all hover:scale-110"
                title="Change Profile Picture"
              >
                <Camera size={14} />
              </button>

              <span className="absolute top-2 right-2 h-4 w-4 bg-emerald-500 border-2 border-card rounded-full shadow-sm" title="Online" />
            </div>

            {/* Name + badges */}
            <div className="flex-1 mt-4 md:mt-0 pt-2 flex flex-col justify-end">
              {isEditing ? (
                <div className="max-w-xs mb-3">
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    className="text-2xl font-extrabold h-12 bg-background/50 backdrop-blur"
                    placeholder="Your Full Name"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-extrabold tracking-tight text-foreground">{user.name}</h2>
                  {user.isVerified && (
                    <CheckCircle size={22} className="text-primary fill-primary/10 drop-shadow-sm" title="Verified account" />
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className={`border font-black uppercase tracking-widest px-3 py-1 ${ROLE_COLOR[user.role] || ROLE_COLOR.user}`}>
                  {user.role}
                </Badge>
                {user.lastLogin && (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 rounded-lg px-2.5 py-1 bg-secondary/30">
                    <Clock size={11} /> Activity: {new Date(user.lastLogin).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 md:mt-2 self-start flex-shrink-0">
                <Button onClick={handleProfileSubmit} disabled={isSaving} className="gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 border-0 h-11 px-6 font-bold">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Details
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
            <h3 className="text-base font-extrabold flex items-center gap-2 tracking-tight">
              <User size={18} className="text-primary" /> Profile Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <EditRow icon={Mail} label="Email Address (Locked)" name="email" value={user.email} disabled={true} />

            {isEditing ? (
              <>
                <EditRow icon={Building2} label="Organization" name="company" value={editForm.company} onChange={handleEditChange} placeholder="Company Name" />
                <EditRow icon={Phone} label="Phone Number" name="phoneNo" value={editForm.phoneNo} onChange={handleEditChange} placeholder="+1 (555) 000-0000" />
                <EditRow icon={MapPin} label="Address" name="address" value={editForm.address} onChange={handleEditChange} placeholder="City, Country" />
                <EditRow icon={Award} label="Expertise & Skills" name="skills" value={editForm.skills} onChange={handleEditChange} placeholder="React, Node.js, Design (Comma separated)" />
              </>
            ) : (
              <>
                <InfoRow icon={Building2} label="Organization" value={user.company} />
                <InfoRow icon={Phone} label="Phone Number" value={user.phoneNo} />
                <InfoRow icon={MapPin} label="Address" value={user.address} />
                <div className="space-y-1.5 p-3 rounded-xl bg-card border border-border/40 shadow-sm col-span-1 md:col-span-2">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/80 mb-2">
                    <Award size={12} className="text-primary" /> Expertise & Skillsets
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.length > 0 ? user.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-[11px] font-extrabold bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20">
                        {skill}
                      </Badge>
                    )) : (
                      <span className="text-sm font-semibold text-muted-foreground">No specific skills listed.</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <InfoRow icon={Briefcase} label="Active Allocations" value={user.assignedProjects?.length > 0 ? `${user.assignedProjects.length} Managed Repositories` : 'No active projects linked.'} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
