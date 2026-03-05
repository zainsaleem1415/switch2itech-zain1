import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/ContextProvider";
import {
    Briefcase, Package, Users, BarChart3, Star, DollarSign
} from "lucide-react";

const ADMIN_LINKS = [
    { icon: Briefcase, label: "Projects", path: "/admin/projects" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Star, label: "Testimonials", path: "/admin/testimonials" },
    { icon: DollarSign, label: "Revenue", path: "/admin/revenue" },
];

const AdminNav = () => {
    const { role } = useAuth();
    if (role !== "admin") return null;

    return (
        <div className="w-full flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {ADMIN_LINKS.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
          ${isActive
                            ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/60"
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.icon
                                size={13}
                                className={isActive ? "text-primary" : "text-muted-foreground"}
                            />
                            {item.label}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    );
};

export default AdminNav;
