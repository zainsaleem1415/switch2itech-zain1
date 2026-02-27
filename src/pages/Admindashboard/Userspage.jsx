import React, { useState, useEffect } from "react";
import userService from "../../api/userService";
import {
  Users, UserCheck, UserPlus, Search,
  Trash2, Edit, Shield, Mail, CheckCircle2, XCircle, Download, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

const ROLES = ["user", "admin", "client", "developer", "manager"];

const MOCK_USERS = [
  {
    _id: "u1",
    name: "Alexander Wright",
    email: "alex.w@globaltech.com",
    role: "Premium Client",
    status: "Active",
    location: "San Francisco, US",
    joinedDate: "2025-08-12",
    testimonial: "The cloud infrastructure transition was seamless. Exceptional support.",
    avatar: "https://i.pravatar.cc/150?u=u1"
  },
  {
    _id: "u2",
    name: "Sarah Jenkins",
    email: "s.jenkins@finflow.io",
    role: "Standard User",
    status: "Inactive",
    location: "London, UK",
    joinedDate: "2025-11-05",
    testimonial: null,
    avatar: "https://i.pravatar.cc/150?u=u2"
  },
  {
    _id: "u3",
    name: "Michael Chen",
    email: "m.chen@aether.ai",
    role: "Admin",
    status: "Active",
    location: "Singapore",
    joinedDate: "2024-03-20",
    testimonial: "Scalability is no longer a concern for our AI models thanks to this tool.",
    avatar: "https://i.pravatar.cc/150?u=u3"
  }
];

const Userspage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRole, setEditingRole] = useState(null); // stores user id currently being edited
  const [newRole, setNewRole] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers();
      setUsers(res.data?.data?.length >= 0 ? res.data.data : MOCK_USERS);
    } catch (err) {
      console.error(err);
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId) => {
    try {
      await userService.updateUserRole(userId, newRole);
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setEditingRole(null);
    } catch (error) {
      console.error("Failed to update user role:", error);
      alert("Failed to update user role.");
    }
  };

  const stats = [
    { label: "Total Accounts", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Admins", value: users.filter(u => u.role === 'admin').length, icon: Shield, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Developers", value: users.filter(u => u.role === 'developer').length, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Clients", value: users.filter(u => u.role === 'client').length, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-background min-h-screen animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground font-medium">Manage user identities and access levels across the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl gap-2 h-11"><Download size={18} /> Export List</Button>
          <Button className="rounded-xl gap-2 h-11 shadow-lg shadow-primary/20"><UserPlus size={18} /> Invite User</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/40 bg-card/50">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-black">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* USER MANAGEMENT SECTION */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
              <div>
                <CardTitle className="text-xl">User Directory</CardTitle>
                <CardDescription>Authentication and permission controls</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Filter by name/email..."
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
                    <tr className="bg-muted/30 border-b border-border/50 text-[11px] font-black uppercase text-muted-foreground">
                      <th className="p-5">User Profile</th>
                      <th className="p-5">Access Level</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-muted/20 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <img src={user.avatar} className="h-10 w-10 rounded-full border bg-muted" alt="" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm text-foreground">{user.name}</span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail size={10} /> {user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-2">
                            {editingRole === user._id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  className="h-8 rounded-md border bg-background px-2 text-xs"
                                  value={newRole}
                                  onChange={(e) => setNewRole(e.target.value)}
                                >
                                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <Button size="sm" variant="ghost" className="h-8 text-emerald-600 p-2" onClick={() => handleRoleUpdate(user._id)}>
                                  <Check size={16} />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-rose-600 p-2" onClick={() => setEditingRole(null)}>
                                  <XCircle size={16} />
                                </Button>
                              </div>
                            ) : (
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit uppercase ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-600' : 'bg-secondary text-secondary-foreground'}`}>{user.role}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-5">
                          <Badge className={`rounded-lg px-2 text-[10px] uppercase font-bold ${user.status === 'inactive' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                            }`}>
                            {user.status === 'inactive' ? <XCircle size={10} className="mr-1" /> : <CheckCircle2 size={10} className="mr-1" />}
                            {user.status || 'Active'}
                          </Badge>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                              onClick={() => {
                                setEditingRole(user._id);
                                setNewRole(user.role);
                              }}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:bg-rose-50"><Trash2 size={16} /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>



      </div>
    </div>
  );
};

export default Userspage;