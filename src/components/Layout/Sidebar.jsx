import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  MessageSquare,
  Package,
  LifeBuoy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/ContextProvider";
import authService from "../../api/authService";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading, setAuthenticated, setUser, setRole } = useAuth();

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

  // Helper: Get Initials for Fallback
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Only show menu items allowed for the current role
  const mainMenu = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["admin", "manager", "developer", "client", "user"] },
    { icon: Briefcase, label: "Projects", path: "/projects", roles: ["admin", "manager", "developer"] },
    { icon: Users, label: "Clients", path: "/clients", roles: ["admin", "manager"] },
    { icon: BarChart3, label: "Analytics", path: "/analytics", roles: ["admin"] },
    { icon: MessageSquare, label: "Testimonials", path: "/testimonials", roles: ["admin", "manager", "developer", "client", "user"] },
    { icon: Package, label: "Products", path: "/products", roles: ["admin", "manager", "developer", "client", "user"] },
  ].filter(item => item.roles.includes(role || "user"));

  const systemMenu = [
    { icon: LifeBuoy, label: "Support", path: "/support" }
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      end={item.path === "/"}
      className={({ isActive }) =>
        `relative w-full flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-300 group ${isActive
          ? "text-indigo-500 bg-indigo-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        } ${isCollapsed ? "justify-center" : "space-x-3"}`
      }
    >
      {({ isActive }) => (
        <>
          <item.icon
            className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-indigo-500" : "group-hover:text-foreground"}`}
          />

          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>

          {isActive && (
            <motion.div
              layoutId="active-pill"
              className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full"
            />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <div
      className={`h-screen flex flex-col border-r bg-card border-border shrink-0 transition-all duration-300 ease-in-out z-50 ${isCollapsed ? "w-20" : "w-72"
        }`}
    >
      {/* Header / Logo */}
      <div
        className={`h-20 flex items-center border-b border-border transition-all duration-300 ${isCollapsed ? "px-1 justify-center" : "px-6 justify-between"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden shrink-0">
          <div
            className={`bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isCollapsed ? "h-8 w-8" : "h-9 w-9"}`}
          >
            <img
              src="/Images/Logo.png"
              alt="Logo"
              className="h-5 w-5 object-contain"
            />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-extrabold tracking-tight text-foreground truncate whitespace-nowrap"
              >
                Switch2itech
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/10 rounded-lg shrink-0 transition-all ${isCollapsed ? "h-8 w-8" : "h-9 w-9"}`}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </Button>
      </div>

      {/* Menu Area */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="mb-6">
          {!isCollapsed && (
            <p className="px-4 mb-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
              Main Menu
            </p>
          )}
          <div className="space-y-1">
            {mainMenu.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </div>

        <div>
          {!isCollapsed && (
            <p className="px-4 mb-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
              System
            </p>
          )}
          <div className="space-y-1">
            {systemMenu.map((item, index) => (
              <NavItem key={index} item={item} />
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Profile Section with Backend Data */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-1">
          {loading ? (
            <div
              className={`flex flex-1 items-center gap-3 p-2 justify-center`}
            >
              <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            </div>
          ) : (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-1 items-center gap-3 p-2 rounded-2xl transition-all duration-300 overflow-hidden ${isActive
                  ? "bg-indigo-500/10 border-indigo-500/20 border"
                  : "bg-secondary/30 hover:bg-secondary/50 border border-transparent"
                } ${isCollapsed ? "justify-center" : ""}`
              }
            >
              <div className="relative shrink-0">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage
                    src={user?.profile || ""}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-indigo-500 text-white text-xs font-bold">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-bold text-foreground truncate">
                    {user?.name || "Unknown User"}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-tighter text-indigo-500 truncate leading-none mt-0.5">
                    {role || "Guest"}
                  </p>
                </motion.div>
              )}
            </NavLink>
          )}

          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
