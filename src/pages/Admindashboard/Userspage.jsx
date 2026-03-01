import React, { useState, useEffect } from "react"
import userService from "../../api/userService"
import {
  Users, UserCheck, UserPlus, Search,
  Trash2, Edit, Shield, Mail, CheckCircle2, XCircle, Download, Check
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

const ROLES = ["user", "admin", "client", "developer", "manager"]

const ROLE_BADGE = {
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  developer: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  client: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  user: "bg-secondary text-muted-foreground border-border/50",
}

const Userspage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingRole, setEditingRole] = useState(null)
  const [newRole, setNewRole] = useState("")

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userService.getUsers()
      setUsers(res.data?.data || [])
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleRoleUpdate = async (userId) => {
    try {
      await userService.updateUserRole(userId, newRole)
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u))
      setEditingRole(null)
    } catch {
      console.error("Failed to update user role")
    }
  }

  const handleDelete = async (userId) => {
    // Currently we don't have a delete tool in the API docs for users, so simulate or implement if available
    console.warn("Delete user is not explicitly outlined in API docs, usually requires admin privileges.");
    alert("Delete functionality pending API support.");
  };

  const stats = [
    { label: "Total Accounts", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Admins", value: users.filter(u => u.role === "admin").length, icon: Shield, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Developers", value: users.filter(u => u.role === "developer").length, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Clients", value: users.filter(u => u.role === "client").length, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ]

  const filtered = users.filter(u =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-in fade-in duration-400">

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-[10px] font-black uppercase tracking-widest">
                <Shield size={12} />
                Access Control
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text py-1">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Manage identities, access levels, and role-based permissions across the entire platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-11 px-5 rounded-xl gap-2 font-bold hover:bg-secondary/80">
              <Download size={16} /> Export
            </Button>
            <Button className="h-11 px-6 rounded-xl font-bold gap-2 shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-indigo-600 hover:to-violet-600 border-0">
              <UserPlus size={16} /> Invite User
            </Button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="metric-card ring-1 ring-border/50 bg-card/40">
            <div className={`inline-flex p-3 rounded-xl ${s.bg} mb-4`}>
              <s.icon size={20} className={s.color} />
            </div>
            <h3 className="text-3xl font-black tracking-tight tabular-nums">{loading ? "—" : s.value}</h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="dashboard-glass rounded-2xl overflow-hidden border-border/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-5 border-b border-border/40 bg-card/30">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">System Directory</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Showing {filtered.length} registered users</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              placeholder="Search by name or email…"
              className="pl-9 h-10 rounded-xl text-sm bg-background border-border/50 focus-visible:ring-primary shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/20 border-b border-border/40 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/80">
                <th className="px-6 py-4">User Profile</th>
                <th className="px-6 py-4">Access Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading && filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-bold">
                   {/* <Loader2 className="animate-spin inline mr-2" size={16} /> Loading Directory...*/}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground font-bold italic">
                    No users matched your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user._id} className="group hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={user.profile || `https://i.pravatar.cc/150?u=${user._id}`}
                          className="h-10 w-10 rounded-xl border border-border/60 object-cover shadow-sm group-hover:border-primary/50 transition-colors"
                          alt=""
                        />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm">{user.name}</span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                            <Mail size={10} /> {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingRole === user._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="h-8 rounded-lg border border-primary bg-background px-2 text-xs font-bold w-full uppercase tracking-widest text-primary focus:ring-0"
                            value={newRole}
                            onChange={e => setNewRole(e.target.value)}
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10 rounded-lg shrink-0" onClick={() => handleRoleUpdate(user._id)}>
                            <Check size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-lg shrink-0" onClick={() => setEditingRole(null)}>
                            <XCircle size={16} />
                          </Button>
                        </div>
                      ) : (
                        <Badge className={`border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md ${ROLE_BADGE[user.role] || ROLE_BADGE.user}`}>
                          {user.role || 'user'}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md flex items-center w-fit gap-1.5 ${user.status?.toLowerCase() === "inactive" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                        {user.status?.toLowerCase() === "inactive" ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
                        {user.status || "Active"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-[10px] font-black uppercase tracking-wider gap-1.5 rounded-lg border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                          onClick={() => { setEditingRole(user._id); setNewRole(user.role || 'user') }}
                        >
                          <Edit size={12} /> Change Role
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Userspage