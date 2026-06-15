"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  Ticket,
  Search,
  Menu,
  X,
  ChevronRight,
  GitBranch,
  Plus,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, setSidebarOpen } from "@/store/uiSlice";
import { canManageUsers } from "@/helper/authHelper";
import { useOrganizationProfile } from "@/hooks/useOrganizationSettings";
import { UserDropdown } from "./userDropdown";
import { NotificationBell } from "@/components/notifications/notificationBell";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { ThemeToggle } from "./ThemeToggle";

/* ────────────────── Navigation config ────────────────── */

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  tourId?: string;
}

const mainNavItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, tourId: "tour-dashboard" },
  { label: "Khách hàng", href: "/customers", icon: Building2, tourId: "tour-customers" },
  { label: "Pipeline", href: "/pipeline", icon: GitBranch, tourId: "tour-pipeline" },
];

const systemNavItems: NavigationItem[] = [
  { label: "Báo cáo", href: "/reports", icon: BarChart3, tourId: "tour-reports" },
  { label: "Góp ý", href: "/feedback", icon: MessageSquare, tourId: "tour-feedback" },
  { label: "Quản lý người dùng", href: "/users", icon: Users, adminOnly: true, tourId: "tour-users" },
  { label: "Hướng dẫn sử dụng", href: "/crm-guide", icon: BookOpen, tourId: "tour-guide" },
  { label: "Cài đặt", href: "/settings", icon: Settings, adminOnly: true, tourId: "tour-settings" },
];

/* ──────────────── Page title helper ──────────────────── */

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/customers")) return "Khách hàng";
  if (pathname.startsWith("/pipeline")) return "Pipeline";
  if (pathname.startsWith("/deals")) return "Deal Detail";
  if (pathname.startsWith("/activities")) return "Hoạt động";
  if (pathname.startsWith("/tickets")) return "Tickets";
  if (pathname.startsWith("/reports")) return "Báo cáo";
  if (pathname.startsWith("/feedback")) return "Góp ý";
  if (pathname.startsWith("/users")) return "Quản lý người dùng";
  if (pathname.startsWith("/crm-guide")) return "Hướng dẫn sử dụng";
  if (pathname.startsWith("/settings")) return "Cài đặt";
  return "CRM Customer 360";
}

/* ──────────────── CTA button helper ──────────────────── */

function getPageCTA(pathname: string): { label: string; href?: string } | null {
  if (pathname.startsWith("/customers")) return { label: "Tạo khách hàng" };
  if (pathname.startsWith("/users")) return { label: "Tạo người dùng" };
  return null;
}

/* ──────────────── Component ──────────────────────────── */

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { data: orgProfile } = useOrganizationProfile();

  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);
  const [toastVisible, setToastVisible] = useState(false);

  const showComingSoonToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  }, [pathname, dispatch]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--crm-surface)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--crm-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const filterNav = (items: NavigationItem[]) =>
    items.filter((item) => !item.adminOnly || canManageUsers(user));

  const visibleMain = filterNav(mainNavItems);
  const visibleSystem = filterNav(systemNavItems);

  const pageTitle = getPageTitle(pathname);

  // User initials for sidebar footer
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Mobile overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* ══════════ Sidebar ══════════ */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-[#0F172A] border-r border-slate-800 transition-transform duration-200 ease-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
          !isSidebarOpen &&
            "md:-translate-x-full md:w-0 md:border-0 md:overflow-hidden",
        )}
      >
        {/* Sidebar header — Logo */}
        <div className="flex h-[52px] items-center gap-2.5 border-b border-slate-800 px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            {orgProfile?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={orgProfile.logoUrl}
                alt={orgProfile.name}
                className="h-7 w-7 shrink-0 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--crm-primary)] text-white text-xs font-semibold">
                {(orgProfile?.name ?? "C").charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-[13px] font-medium text-white truncate">
              {orgProfile?.name ?? "CRM Customer 360"}
            </span>
          </Link>
          <button
            className="ml-auto md:hidden p-1 rounded hover:bg-slate-800"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <X className="h-4 w-4 text-slate-400 hover:text-white" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Nhóm Chính */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Chính
            </p>
            <div className="space-y-0.5">
              {visibleMain.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-tour={item.tourId}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-[var(--crm-primary)] text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
                    )}
                  </Link>
                );
              })}

              {/* Tickets — Coming soon */}
              <button
                onClick={showComingSoonToast}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <Ticket className="h-4 w-4 shrink-0" />
                <span>Tickets</span>
                <span className="ml-auto text-[10px] font-semibold bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              </button>
            </div>
          </div>

          {/* Nhóm Hệ thống */}
          {visibleSystem.length > 0 && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Hệ thống
              </p>
              <div className="space-y-0.5">
                {visibleSystem.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tour={item.tourId}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-[var(--crm-primary)] text-white"
                          : "text-slate-300 hover:bg-slate-800 hover:text-white",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* ══════════ Main area ══════════ */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── Topbar 52px ── */}
        <header
          className="sticky top-0 z-10 flex h-[52px] items-center gap-3 border-b bg-[#0F172A] border-slate-800 px-4 md:px-6"
        >
          {/* Toggle sidebar */}
          <button
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-[18px] w-[18px] text-slate-300" />
          </button>

          {/* Page title */}
          <h1 className="text-[15px] font-medium text-white hidden sm:block">
            {pageTitle}
          </h1>

          {/* Spacer */}
          <div className="flex-1" />
          <div data-tour="dashboard-theme-toggle" className="flex items-center gap-1">

          <ThemeToggle />
          <NotificationBell />

          {/* User dropdown */}
          <UserDropdown user={user} />
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">{children}</main>
      </div>

      {/* ── Coming Soon Toast ── */}
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: toastVisible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(16px)",
          opacity: toastVisible ? 1 : 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#1E293B",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(15,23,42,0.25), 0 2px 8px rgba(15,23,42,0.15)",
            fontSize: "14px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "18px" }}>🚧</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: "2px" }}>Tính năng đang được phát triển</div>
            <div style={{ fontSize: "12px", color: "#94A3B8", fontWeight: 400 }}>Hiện tại chưa thể truy cập vào tính năng này</div>
          </div>
        </div>
      </div>
      <OnboardingTour />
    </div>
  );
}
