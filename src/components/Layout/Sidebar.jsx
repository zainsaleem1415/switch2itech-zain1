import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LayoutDashboard, Briefcase, Users, BarChart3,
  MessageSquare, Package, LifeBuoy, LogOut,
  PanelLeftClose, PanelLeftOpen, Loader2,
  Settings, ShieldCheck, DollarSign, Star,
} from "lucide-react";
import { useAuth } from "../../context/ContextProvider";
import authService from "../../api/authService";
import logoUrl from "/Images/Logo.png";

/* ── NavItem must be defined OUTSIDE Sidebar so React doesn't treat it
   as a new component type on every render (which causes full remount,
   logo flicker, and dozens of redundant Logo.png requests). ────────────── */
const NavItem = ({ item, isCollapsed }) => (
  <NavLink
    to={item.path}
    end={item.path === "/"}
    className={({ isActive }) =>
      `relative w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200 group
      ${isActive
        ? "text-primary bg-primary/10"
        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
      } ${isCollapsed ? "justify-center" : "gap-3"}`
    }
  >
    {({ isActive }) => (
      <>
        <item.icon
          className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? "text-primary" : "group-hover:text-foreground"
            }`}
        />

        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 w-0.5 h-4 bg-primary rounded-r-full"
          />
        )}
      </>
    )}
  </NavLink>
);

const getInitials = (name) => {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const MAIN_MENU = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["admin", "manager", "developer"] },
  { icon: Briefcase, label: "Projects", path: "/projects", roles: ["admin", "manager", "developer"] },
  { icon: Users, label: "Clients", path: "/clients", roles: ["admin", "manager", "developer", "client", "user"] },
  { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["admin"] },
  { icon: MessageSquare, label: "Testimonials", path: "/testimonials", roles: ["admin", "manager", "developer", "client", "user"] },
  { icon: Package, label: "Products", path: "/products", roles: ["admin", "manager", "developer", "client", "user"] },
];

const ADMIN_MENU = [
  { icon: Briefcase, label: "Manage Projects", path: "/admin/projects" },
  { icon: Package, label: "Manage Products", path: "/admin/products" },
  { icon: Users, label: "Manage Users", path: "/admin/users" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Star, label: "Testimonials", path: "/admin/testimonials" },
  { icon: DollarSign, label: "Revenue", path: "/admin/revenue" },
];

const SYSTEM_MENU = [{ icon: LifeBuoy, label: "Support", path: "/support" }];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading, setAuthenticated, setUser, setRole } = useAuth();

  const mainMenu = MAIN_MENU.filter((item) => item.roles.includes(role || "user"));

  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuthenticated(false);
      setUser(null);
      setRole(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div
      className={`h-screen flex flex-col border-r bg-card border-border shrink-0 transition-all duration-300 ease-in-out z-50 ${isCollapsed ? "w-[68px]" : "w-64"
        }`}
    >
      {/* ── Logo / Header ───────────────────────────────────────── */}
      <div
        className={`h-16 flex items-center border-b border-border transition-all duration-300 ${isCollapsed ? "px-0 justify-center" : "px-5 justify-between"
          }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden shrink-0">
          {/* Logo — static img; no state reads here so it never remounts */}
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logoUrl} alt="Logo" className="h-5 w-5 object-contain" />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-black tracking-tight text-foreground truncate whitespace-nowrap"
              >
                Switch2itech
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg shrink-0"
          >
            <PanelLeftClose size={16} />
          </Button>
        )}
      </div>

      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="h-10 w-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors border-b border-border"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* ── Navigation ──────────────────────────────────────────── */}
      <ScrollArea className="flex-1 px-2.5 py-4">
        <div className="space-y-5">
          <div>
            {!isCollapsed && (
              <p className="px-3.5 mb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em]">
                Main Menu
              </p>
            )}
            <div className="space-y-0.5">
              {mainMenu.map((item, i) => (
                <NavItem key={i} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>

          {role === "admin" && (
            <div>
              {!isCollapsed && (
                <p className="px-3.5 mb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em] flex items-center gap-1.5">
                  <ShieldCheck size={10} className="text-primary opacity-70" />
                  Management
                </p>
              )}
              <div className="space-y-0.5">
                {ADMIN_MENU.map((item) => (
                  <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
                ))}
              </div>
            </div>
          )}

          <div>
            {!isCollapsed && (
              <p className="px-3.5 mb-2 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em]">
                System
              </p>
            )}
            <div className="space-y-0.5">
              {SYSTEM_MENU.map((item) => (
                <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* ── User Profile Block ──────────────────────────────────── */}
      <div className="p-3 border-t border-border space-y-1">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-1 items-center gap-2.5 px-2 py-2 rounded-xl transition-all duration-200 overflow-hidden min-w-0
                ${isActive
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary/60 border border-transparent"
                } ${isCollapsed ? "justify-center flex-none" : ""}`
              }
            >
              <div className="relative shrink-0">
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src={user?.profile || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-black">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-background rounded-full" />
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-bold text-foreground truncate leading-none">
                    {user?.name || "Unknown"}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary truncate mt-0.5">
                    {role || "Guest"}
                  </p>
                </motion.div>
              )}
            </NavLink>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
