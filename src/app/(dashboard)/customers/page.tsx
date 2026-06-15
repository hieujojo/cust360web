"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Plus, Building2, TrendingUp, TrendingDown } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useCustomers, useCustomerSearch, useCustomer360, useCustomerStats } from "@/hooks/useCustomers";
import { canDeleteCustomer, canChangeCustomerOwner, canRestoreCustomer } from "@/helper/authHelper";
import type { Customer, CustomerStatus } from "@/models/customerModel";

import { CustomerTable } from "@/components/customers/customerTable";
import { CustomerGridView } from "@/components/customers/customerGridView";
import { CustomerFilters } from "@/components/customers/customerFilters";
import { Customer360Panel } from "@/components/customers/customer360Panel";
import { CustomerFormDialog } from "@/components/customers/customerFormDialog";
import { StatusChangeDialog } from "@/components/customers/statusChangeDialog";
import { OwnerChangeDialog } from "@/components/customers/ownerChangeDialog";
import { DeleteDialog } from "@/components/customers/deleteDialog";
import { RestoreDialog } from "@/components/customers/restoreDialog";
import { useTourStep } from "@/components/onboarding/OnboardingTour";


export default function CustomersPage() {
  const { user: currentUser } = useAuth();

  // Permissions
  const canDelete = canDeleteCustomer(currentUser ?? null);
  const canChangeOwner = canChangeCustomerOwner(currentUser ?? null);
  const canRestore = canRestoreCustomer(currentUser ?? null);

  // Filter States
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "">("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "status" | "createdAt" | "owner">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Slide-over panel
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelCustomer, setPanelCustomer] = useState<Customer | null>(null);
  const [panelTab, setPanelTab] = useState<"info" | "contacts" | "deals" | "timeline">("info");

  // View mode (list / grid)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Queries
  const { data: usersData } = useUsers();
  const usersList = usersData?.items || [];

  const { data: searchResults, isLoading: isSearchLoading } = useCustomerSearch(searchTerm);

  const { data: listData, isLoading: isListLoading, error } = useCustomers({
    page,
    pageSize,
    status: statusFilter === "" ? undefined : statusFilter,
    ownerId: ownerFilter || undefined,
    departmentId: departmentFilter || undefined,
    sortBy,
    sortDir,
  });

  const { data: customer360Data } = useCustomer360(panelCustomer?.id ?? "");
  

  const panelCustomerData = useMemo(() => {
    if (!panelCustomer || !customer360Data) {
      return panelCustomer;
    }
    return {
      ...panelCustomer,
      ...customer360Data.info,
      createdAt: new Date(customer360Data.info.createdAt),
      updatedAt: new Date(customer360Data.info.updatedAt),
      contacts: customer360Data.tabs.contacts,
    } as Customer;
  }, [panelCustomer, customer360Data]);

  // Stat counts — single API call for all statistics
  const { data: statsData } = useCustomerStats();

  // Handle panel animation timing for tour spotlight
  useEffect(() => {
    if (panelOpen) {
      // Wait for panel slide-in animation to complete (250ms) + buffer before notifying tour
      const timer = setTimeout(() => {
        const currentTourId = 
          panelTab === "info" ? "customers-detail-info" :
          panelTab === "contacts" ? "customers-detail-contacts" :
          panelTab === "deals" ? "customers-detail-deals" :
          "customers-detail-timeline";
        window.dispatchEvent(new CustomEvent("TOUR_STEP_CHANGED", { detail: { tourId: currentTourId } }));
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [panelOpen, panelTab]);

  const isLoading = searchTerm.length > 1 ? isSearchLoading : isListLoading;
  // Search API trả payload khác list view; cần normalize để CustomerTable không crash (updatedAt/source/...)
  const displayData = useMemo(() => {
    if (searchTerm.length > 1) {
      return (searchResults?.results ?? []).map((r: any) => ({
        id: r.id,
        customerCode: r.customerCode,
        name: r.name,
        status: r.status,
        // Placeholder fields for table/panel rendering
        source: "Other",
        ownerName: "",
        departmentName: "",
        email: r.email,
        phone: r.phone,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        contacts: [],
      }));
    }
    return listData?.items ?? [];
  }, [searchTerm, searchResults, listData]);
  useTourStep(useCallback((tourId: string) => {
  console.log("[CUSTOMERS PAGE] Tour step event received:", tourId, "| panelOpen:", panelOpen);
  
  const tabMap: Record<string, "info" | "contacts" | "deals" | "timeline"> = {
    "customers-detail-info":     "info",
    "customers-detail-contacts": "contacts",
    "customers-detail-deals":    "deals",
    "customers-detail-timeline": "timeline",
  };
  if (tabMap[tourId]) {
    if (!panelOpen && displayData.length > 0) {
      console.log("[CUSTOMERS PAGE] Opening panel for tour");
      setPanelCustomer(displayData[0] as Customer);
      setPanelOpen(true);
    }
    setPanelTab(tabMap[tourId]);
  }
  if (["customers-stats", "customers-filters", "customers-toolbar", "customers-row-actions"].includes(tourId)) {
    console.log("[CUSTOMERS PAGE] Closing panel for tour");
    setPanelOpen(false);
  }
}, [panelOpen, displayData]));
  const total = searchTerm.length > 1 ? searchResults?.totalCount || 0 : listData?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSort = useCallback((column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column as any);
      setSortDir("asc");
    }
  }, [sortBy, sortDir]);

  const openDialog = useCallback((type: "status" | "owner" | "delete" | "restore", customer: Customer) => {
    setSelectedCustomer(customer);
    if (type === "status") setStatusDialogOpen(true);
    if (type === "owner") setOwnerDialogOpen(true);
    if (type === "delete") setDeleteDialogOpen(true);
    if (type === "restore") setRestoreDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((customer: Customer) => {
    setPanelCustomer(customer);
    setPanelOpen(true);
  }, []);

  // Export to Excel
  const handleExport = useCallback(() => {
    const rows = displayData as Customer[];
    if (!rows.length) return;

    // Prepare data for Excel
    const excelData = rows.map((c) => ({
      "Mã KH": c.customerCode ?? "",
      "Tên": c.name ?? "",
      "Trạng thái": c.status ?? "",
      "Nguồn": c.source ?? "",
      "Phụ trách": c.ownerName ?? "",
      "Phòng ban": c.departmentName ?? "",
      "Email": c.email ?? "",
      "Điện thoại": c.phone ?? "",
      "Cập nhật": c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("vi-VN") : "",
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Mã KH
      { wch: 25 }, // Tên
      { wch: 15 }, // Trạng thái
      { wch: 15 }, // Nguồn
      { wch: 20 }, // Phụ trách
      { wch: 20 }, // Phòng ban
      { wch: 25 }, // Email
      { wch: 15 }, // Điện thoại
      { wch: 12 }, // Cập nhật
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Khách hàng");

    // Generate Excel file
    XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [displayData]);

  // Handlers for CustomerFilters (memoized to prevent unnecessary child re-renders)
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status as CustomerStatus | "");
    setPage(1);
  }, []);

  const handleOwnerChange = useCallback((owner: string) => {
    setOwnerFilter(owner);
    setPage(1);
  }, []);

  const handleDepartmentChange = useCallback((dept: string) => {
    setDepartmentFilter(dept);
    setPage(1);
  }, []);

  const handleViewModeChange = useCallback((mode: "list" | "grid") => {
    setViewMode(mode);
  }, []);

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="crm-page">
      {/* Header with title and create button */}
      <div className="crm-page-header flex items-center justify-between mb-6">
        <div>
          <h1 className="crm-page-title">Quản lý khách hàng</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Theo dõi và quản lý dữ liệu khách hàng 360°</p>
        </div>
        <button
          data-tour="customers-create-btn"
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--crm-primary)] text-white rounded-lg hover:bg-[var(--crm-primary)]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo khách hàng
        </button>
      </div>

      {/* Stats */}
      <div data-tour="customers-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng khách hàng" value={statsData?.total ?? 0} positive delta="10 đang hoạt động" />
        <StatCard label="Tiềm năng" value={statsData?.lead ?? 0} positive delta="58% tổng khách hàng" />
        <StatCard label="Đang hoạt động" value={statsData?.active ?? 0} positive delta="25% tổng khách hàng" />
        <StatCard label="Rời bỏ" value={statsData?.churned ?? 0} positive={false} delta="0% tổng khách hàng" />
      </div>

      {/* Filters */}
      <div data-tour="customers-filters" className="mb-4">
        <CustomerFilters
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onOwnerChange={handleOwnerChange}
          onDepartmentChange={handleDepartmentChange}
          users={usersList}
          showOwnerFilter={true}
          onExport={handleExport}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Table/Grid */}
      {viewMode === "list" ? (
        <CustomerTable
          data={displayData as Customer[]}
          onRowClick={handleRowClick}
          onSort={handleSort}
          onStatusClick={(c) => openDialog("status", c)}
          onOwnerClick={(c) => openDialog("owner", c)}
          onDeleteClick={(c) => openDialog("delete", c)}
          onRestoreClick={(c) => openDialog("restore", c)}
          canDelete={canDelete}
          canChangeOwner={canChangeOwner}
          canRestore={canRestore}
        />
      ) : (
        <CustomerGridView
          data={displayData as Customer[]}
          onRowClick={handleRowClick}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Dialogs */}
      <CustomerFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <StatusChangeDialog
        open={statusDialogOpen}
        customer={selectedCustomer}
        onOpenChange={setStatusDialogOpen}
      />
      <OwnerChangeDialog
        open={ownerDialogOpen}
        customer={selectedCustomer}
        users={usersList}
        onOpenChange={setOwnerDialogOpen}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        customer={selectedCustomer}
        onOpenChange={setDeleteDialogOpen}
      />
      <RestoreDialog
        open={restoreDialogOpen}
        customer={selectedCustomer}
        onOpenChange={setRestoreDialogOpen}
      />

      {/* Customer360 Panel */}
      <Customer360Panel
        customer={panelCustomerData}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        activeTab={panelTab}
        onTabChange={setPanelTab}
      />
    </div>
  );
}

/* ── StatCard component ───────────────────────────────── */

function StatCard({
  label,
  value,
  delta,
  positive,
}: {
  label: string;
  value: number;
  delta?: string;
  positive: boolean;
}) {
  return (
    <div className="crm-stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value.toLocaleString("vi-VN")}</p>
      {delta ? (
        <p className={`stat-delta ${positive ? "positive" : "negative"}`}>
          {positive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta}
        </p>
      ) : (
        <p className="stat-delta" style={{ color: "transparent" }}>—</p>
      )}
    </div>
  );
}