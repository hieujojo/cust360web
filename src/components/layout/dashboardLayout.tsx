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
  Bell,
  Menu,
  X,
  ChevronRight,
  GitBranch,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar, setSidebarOpen } from "@/store/uiSlice";
import { canManageUsers } from "@/helper/authHelper";
import { UserDropdown } from "./userDropdown";

/* ────────────────── Navigation config ────────────────── */

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const mainNavItems: NavigationItem[] = [
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Khách hàng",   href: "/customers",  icon: Building2 },
  { label: "Pipeline",     href: "/pipeline",   icon: GitBranch },
  { label: "Tickets",      href: "/tickets",    icon: Ticket },
];

const systemNavItems: NavigationItem[] = [
  { label: "Báo cáo",           href: "/reports",  icon: BarChart3 },
  { label: "Quản lý người dùng", href: "/users",    icon: Users, adminOnly: true },
  { label: "Cài đặt",           href: "/settings", icon: Settings, adminOnly: true },
];

/* ──────────────── Page title helper ──────────────────── */

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/customers")) return "Khách hàng";
  if (pathname.startsWith("/pipeline"))  return "Pipeline";
  if (pathname.startsWith("/deals"))  return "Deal Detail";
  if (pathname.startsWith("/activities")) return "Hoạt động";
  if (pathname.startsWith("/tickets"))   return "Tickets";
  if (pathname.startsWith("/reports"))   return "Báo cáo";
  if (pathname.startsWith("/users"))     return "Quản lý người dùng";
  if (pathname.startsWith("/settings"))  return "Cài đặt";
  return "CRM Customer 360";
}

/* ──────────────── CTA button helper ──────────────────── */

function getPageCTA(pathname: string): { label: string; href?: string } | null {
  if (pathname.startsWith("/customers")) return { label: "Tạo khách hàng" };
  if (pathname.startsWith("/users"))     return { label: "Tạo người dùng" };
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

  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.ui.isSidebarOpen);

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
    <div className="flex min-h-screen bg-[var(--crm-surface)]">
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
          "fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col bg-white border-r transition-transform duration-200 ease-out",
          "border-[var(--crm-border)]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
          !isSidebarOpen && "md:-translate-x-full md:w-0 md:border-0 md:overflow-hidden"
        )}
      >
        {/* Sidebar header — Logo */}
        <div className="flex h-[52px] items-center gap-2.5 border-b border-[var(--crm-border)] px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--crm-primary)] text-white text-xs font-semibold">
              C
            </div>
            <span className="text-[13px] font-medium text-gray-900">CRM Customer 360</span>
          </Link>
          <button
            className="ml-auto md:hidden p-1 rounded hover:bg-gray-100"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Nhóm Chính */}
          <div>
            <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
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
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
                      isActive
                        ? "bg-[var(--crm-primary)] text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Nhóm Hệ thống */}
          {visibleSystem.length > 0 && (
            <div>
              <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-400">
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
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-[var(--crm-primary)] text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-70" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar footer — User info */}
        <div className="border-t border-[var(--crm-border)] p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-gray-50 transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--crm-primary)] text-white text-[11px] font-semibold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-gray-900 truncate">{user.displayName}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.roleName || "User"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════ Main area ══════════ */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* ── Topbar 52px ── */}
        <header
          className="sticky top-0 z-10 flex h-[52px] items-center gap-3 border-b bg-white px-4 md:px-6"
          style={{ borderColor: "var(--crm-border)" }}
        >
          {/* Toggle sidebar */}
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-[18px] w-[18px] text-gray-500" />
          </button>

          {/* Page title */}
          <h1 className="text-[15px] font-medium text-gray-900 hidden sm:block">
            {pageTitle}
          </h1>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="h-8 w-[240px] rounded-lg border border-[var(--crm-border)] bg-[var(--crm-surface)] pl-9 pr-3 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-[var(--crm-primary)] focus:ring-1 focus:ring-[var(--crm-primary)]/20 transition-colors"
            />
          </div>

          {/* Notification bell */}
          <button
            className="relative p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Thông báo"
          >
            <Bell className="h-[18px] w-[18px] text-gray-500" />
            {/* Unread dot — TODO: wire to backend notification count */}
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--crm-danger)] ring-2 ring-white" />
          </button>

          {/* User dropdown */}
          <UserDropdown user={user} />
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
