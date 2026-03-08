import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/ContextProvider';


// Layout & Auth
import Layout from './components/Layout/Layout';
import ProtectedRoutes from './components/ProtectedRoutes';
import RequestAuth from './components/RequestAuth';
import { RoleGuard } from './context/ContextProvider';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

// Lazy-loaded page components — each gets its own JS chunk.
// The browser only downloads a page's code when the user first navigates to it.
const Overview = lazy(() => import('./pages/Admin/Overview'));
const Team = lazy(() => import('./pages/Team/Team'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Project = lazy(() => import('./pages/Project/Product'));
const Client = lazy(() => import('./pages/Client/Client'));
const Testimonials = lazy(() => import('./pages/Testimonials/Testimonials'));
const Addproject = lazy(() => import('./pages/Addproject/Addproject'));
const Editproject = lazy(() => import('./pages/Addproject/Editproject'));
const ProjectMonitoring = lazy(() => import('./pages/Admindashboard/ProjectMonitoring'));
const Addproduct = lazy(() => import('./pages/Addproduct/Addproduct'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Product = lazy(() => import('./pages/Product/Product'));
const ProductDetail = lazy(() => import('./pages/Product/Main'));
const ProjectDetail = lazy(() => import('./pages/Project/ProjectDetail'));
const Support = lazy(() => import('./pages/Support/Support'));
const Signin = lazy(() => import('./pages/Signin/Signin'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const OtpVerification = lazy(() => import('./pages/OtpVerification/OtpVerification'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Profile= lazy(()=>import('./pages/Profile/Profile'))
// Admin Management pages
const AdminProjects = lazy(() => import('./pages/Admindashboard/Projectspage'));
const AdminUsers = lazy(() => import('./pages/Admindashboard/Userspage'));
const AdminProducts = lazy(() => import('./pages/Admindashboard/Productpage'));
const AdminTestimonials = lazy(() => import('./pages/Admindashboard/Testimonialspage'));
const AdminRevenue = lazy(() => import('./pages/Admindashboard/Revenuepage'));

/** Full-screen structural skeleton shown while a lazy chunk is loading */
const PageSkeleton = () => (
  <div className="h-screen w-full bg-background flex overflow-hidden">
    {/* Sidebar Skeleton (hidden on small screens) */}
    <div className="w-64 h-full border-r border-border shrink-0 bg-card p-5 hidden md:flex flex-col gap-6">
      <div className="h-10 bg-muted rounded-xl w-4/5 animate-pulse" />
      <div className="space-y-2 mt-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-11 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="mt-auto h-16 bg-muted/30 rounded-xl animate-pulse" />
    </div>
    {/* Main Content Skeleton */}
    <div className="flex-1 p-2 sm:p-4 md:p-8 space-y-6 md:space-y-8 flex flex-col">
      {/* Hero Header Skeleton */}
      <div className="h-32 bg-muted/30 rounded-2xl animate-pulse border border-border/50" />
      {/* Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted/20 rounded-2xl animate-pulse border border-border/40" />
        ))}
      </div>
      {/* Main Content Area Skeleton */}
      <div className="flex-1 bg-card/20 border border-border/50 rounded-2xl animate-pulse" />
    </div>
  </div>
);

const App = () => {
  const { authenticated, loading } = useAuth();

  // Loading gate: wait for session verification before rendering any routes.
  // This prevents the /login flash when the user is already authenticated.
  if (loading) return <PageSkeleton />;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }}>
        {(t) => (
          <ToastBar toast={t} style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
            {({ icon, message }) => (
              <div className="relative overflow-hidden flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-black text-slate-900 dark:text-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-200 dark:border-white/10 pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 pointer-events-none" />
                <div className="relative z-10 flex items-center shadow-sm rounded-full shrink-0">
                  {icon}
                </div>
                <div className="relative z-10 text-sm font-extrabold tracking-tight leading-snug">
                  {message}
                </div>
                {t.type !== 'loading' && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="relative z-10 ml-2 p-1.5 rounded-full text-slate-400 hover:text-slate-900 dark:text-white/40 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shrink-0"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                )}
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
      <Routes>
        {/* ── PROTECTED ROUTES ─────────────────────────────────────────── */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="support" element={<Support />} />
            <Route path="profile" element={<Profile />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="products" element={<Product />} />

            {/* Admin Management only */}
            <Route path="admin/projects" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><AdminProjects /></RoleGuard>} />
            {/* Admin Projects & related deep links */}
            <Route path="admin/projects/new" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><Addproject /></RoleGuard>} />
            <Route path="admin/projects/:id" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><ProjectDetail isAdmin /></RoleGuard>} />
            <Route path="admin/projects/:id/edit" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><Editproject /></RoleGuard>} />
            <Route path="admin/projects/:id/monitor" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><ProjectMonitoring /></RoleGuard>} />
            <Route path="admin/users" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><AdminUsers /></RoleGuard>} />
            <Route path="admin/products" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><AdminProducts /></RoleGuard>} />
            <Route path="admin/products/:id" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><ProductDetail isAdmin /></RoleGuard>} />
            <Route path="admin/products/:id/edit" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><Addproduct /></RoleGuard>} />
            <Route path="admin/testimonials" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><AdminTestimonials /></RoleGuard>} />
            <Route path="admin/revenue" element={<RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}><AdminRevenue /></RoleGuard>} />

            {/* Admin only */}
            <Route
              path="analytics"
              element={
                <RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}>
                  <Analytics />
                </RoleGuard>
              }
            />

            {/* Manager / Admin routes */}
            <Route
              path="projects"
              element={
                <RoleGuard allowedRoles={["admin", "manager", "developer"]} fallback={<NotFound />}>
                  <Project />
                </RoleGuard>
              }
            />
            <Route
              path="add-project"
              element={
                <RoleGuard allowedRoles={["admin", "manager"]} fallback={<Navigate to="/" />}>
                  <Addproject />
                </RoleGuard>
              }
            />
            <Route
              path="projects/:id"
              element={
                <RoleGuard allowedRoles={["admin", "manager", "developer"]} fallback={<NotFound />}>
                  <ProjectDetail />
                </RoleGuard>
              }
            />
            <Route
              path="products/:id"
              element={
                <RoleGuard allowedRoles={["admin", "manager", "developer", "user"]} fallback={<NotFound />}>
                  <ProductDetail />
                </RoleGuard>
              }
            />
            <Route
              path="add-product"
              element={
                <RoleGuard allowedRoles={["admin"]} fallback={<Navigate to="/" />}>
                  <Addproduct />
                </RoleGuard>
              }
            />
            <Route
              path="team"
              element={
                <RoleGuard allowedRoles={["admin", "manager", "developer"]} fallback={<NotFound />}>
                  <Team />
                </RoleGuard>
              }
            />
            <Route
              path="clients"
              element={
                <RoleGuard allowedRoles={["admin", "manager", "developer", "client", "user"]} fallback={<NotFound />}>
                  <Client />
                </RoleGuard>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── AUTH ROUTES (redirect to dashboard if already logged in) ─── */}
        <Route element={<RequestAuth />}>
          <Route path="/login" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
