import { Button } from "../../admin/components/button";
import { Input } from "../../admin/components/input";
import {
  Bell,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/posts", label: "Quản lý bài viết", icon: FileText },
  { path: "/admin/moderation", label: "Kiểm duyệt", icon: ShieldAlert },
  { path: "/admin/accounts", label: "Quản lý tài khoản", icon: Users },
];

const PAGE_META = {
  "/admin/dashboard": {
    title: "Tổng quan hệ thống",
    subtitle: "Theo dõi hoạt động nền tảng theo thời gian thực",
  },
  "/admin/posts": {
    title: "Quản lý bài viết",
    subtitle: "Tạo, cập nhật, lọc và quản trị toàn bộ tài liệu",
  },
  "/admin/moderation": {
    title: "Hàng chờ kiểm duyệt",
    subtitle: "Xử lý các bài viết đang chờ duyệt nhanh chóng",
  },
  "/admin/accounts": {
    title: "Quản lý tài khoản",
    subtitle: "Phân quyền và khóa/mở khóa người dùng",
  },
};

const ALLOWED_PATHS_BY_ROLE = {
  admin: ["/admin/dashboard", "/admin/posts", "/admin/moderation", "/admin/accounts"],
  moderator: ["/admin/dashboard", "/admin/moderation"],
};

const SidebarContent = ({ navItems, onNavigate, userRole }) => (
  <div className="flex h-full flex-col p-4" data-testid="admin-sidebar-content">
    <div className="mb-8 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-3">
      <div className="rounded-lg bg-cyan-500/20 p-2 text-cyan-300" data-testid="admin-logo-icon">
        <Sparkles className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm text-slate-400" data-testid="admin-logo-caption">
          EduShare
        </p>
        <p className="text-base font-semibold text-cyan-300" data-testid="admin-logo-title">
          Control Center
        </p>
        <p className="text-xs capitalize text-slate-500" data-testid="admin-user-role">
          {userRole || "student"}
        </p>
      </div>
    </div>

    <nav className="space-y-2" data-testid="admin-sidebar-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            data-testid={`sidebar-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.4)]"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  </div>
);

export default function AdminLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserRole("");
        setAuthLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "users"), where("uid", "==", user.uid), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setUserRole(data.role || "student");
        } else {
          setUserRole("student");
        }
      } catch (error) {
        console.error("Lỗi lấy role người dùng", error);
        setUserRole("student");
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredNavItems = useMemo(() => {
    if (userRole === "admin") return NAV_ITEMS;

    if (userRole === "moderator") {
      return NAV_ITEMS.filter(
        (item) =>
          item.path === "/admin/dashboard" ||
          item.path === "/admin/moderation"
      );
    }

    return [];
  }, [userRole]);

  const allowedPaths = useMemo(() => {
    return ALLOWED_PATHS_BY_ROLE[userRole] || [];
  }, [userRole]);

  const currentMeta = useMemo(() => {
    return PAGE_META[location.pathname] ?? PAGE_META["/admin/dashboard"];
  }, [location.pathname]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-300">
        Đang tải quyền truy cập...
      </div>
    );
  }

  if (!allowedPaths.includes(location.pathname)) {
    if (allowedPaths.length > 0) {
      return <Navigate to={allowedPaths[0]} replace />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-300">
        Bạn không có quyền truy cập khu vực quản trị.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020617] text-slate-100" data-testid="admin-layout">
      <div className="pointer-events-none absolute inset-0 admin-grid-bg opacity-15" />
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-600/15 blur-[110px]" />

      <aside
        className="glass-panel-strong fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/10 lg:block"
        data-testid="admin-desktop-sidebar"
      >
        <SidebarContent navItems={filteredNavItems} userRole={userRole} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" data-testid="admin-mobile-sidebar-overlay">
          <button
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            data-testid="mobile-sidebar-close-overlay"
          />
          <aside className="glass-panel-strong relative z-10 h-full w-72 border-r border-white/15">
            <div className="flex items-center justify-end p-4">
              <Button
                variant="ghost"
                className="text-slate-200 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
                data-testid="mobile-sidebar-close-button"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <SidebarContent
              navItems={filteredNavItems}
              userRole={userRole}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="relative z-10 lg:pl-72">
        <header
          className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8"
          data-testid="admin-topbar"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-100 text-glow md:text-3xl" data-testid="topbar-page-title">
                {currentMeta.title}
              </h1>
              <p className="text-sm text-slate-400" data-testid="topbar-page-subtitle">
                {currentMeta.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 lg:hidden"
                onClick={() => setMobileOpen(true)}
                data-testid="mobile-sidebar-open-button"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden min-w-[280px] items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1 md:flex">
                <Search className="h-4 w-4 text-slate-500" />
                <Input
                  readOnly
                  value="Tìm kiếm chức năng quản trị..."
                  className="cyber-input h-8 border-0 bg-transparent px-0 text-xs text-slate-400"
                  data-testid="topbar-search-input"
                />
              </div>

              <Button
                variant="ghost"
                className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                data-testid="topbar-notification-button"
              >
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="route-fade p-4 md:p-6 lg:p-8" data-testid="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}