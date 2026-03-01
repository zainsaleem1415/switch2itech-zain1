import React, { useState, useEffect } from "react"
import userService from "../../api/userService"
import {
  Users, UserCheck, UserPlus, Search, Shield
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

const Userspage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userService.getUsers()
      const allUsers = res.data?.data || []
      const clientsOnly = allUsers.filter(
        (u) => (u.role || "").toLowerCase() === "client"
      )
      setUsers(clientsOnly)
    } catch (err) {
      console.error("Failed to fetch users:", err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const stats = [
    { label: "Total Clients", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Clients", value: users.filter(u => (u.status || "Active") !== "Inactive").length, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Inactive Clients", value: users.filter(u => u.status === "Inactive").length, icon: Shield, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "With Company", value: users.filter(u => !!u.company).length, icon: UserPlus, color: "text-amber-500", bg: "bg-amber-500/10" },
  ]

  const filtered = users.filter(u =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.company || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 animate-in fade-in duration-400">
      
      {/* Header Section */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-card">
        <div className="relative px-8 py-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 text-[10px] font-black uppercase tracking-widest w-fit mb-3">
              <Shield size={12} /> System Admin
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Client Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Client information directory.</p>
          </div>
          <Button className="rounded-xl font-bold gap-2 shadow-lg shadow-primary/20" disabled>
            <UserPlus size={18} /> Client Only View
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
            <div className={`inline-flex p-3 rounded-xl ${s.bg} mb-4`}>
              <s.icon size={20} className={s.color} />
            </div>
            <h3 className="text-3xl font-black tracking-tight">{loading ? "—" : s.value}</h3>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Management Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-5 border-b border-border/40">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input 
              placeholder="Search by name, email, or company..." 
              className="pl-9 h-11 rounded-xl bg-muted/30 border-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4 font-black">Member Profile</th>
                <th className="px-6 py-4 font-black">Company</th>
                <th className="px-6 py-4 font-black">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map(user => (
                <tr key={user._id} className="group hover:bg-muted/20 transition-all">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl border-2 border-border/40 overflow-hidden shadow-sm">
                        <img src={user.profile || `https://i.pravatar.cc/150?u=${user._id}`} alt="" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{user.name}</span>
                        <span className="text-[11px] text-muted-foreground font-medium">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-foreground">
                      {user.company || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border ${user.status === "Inactive" ? "bg-red-500/10 text-red-600 border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"}`}>
                       {user.status || "Active"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Userspage
