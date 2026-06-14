"use client";

import { useState, useCallback, useMemo } from "react";
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

  /* ── Stat counts — lấy từ consolidated stats API ── */
  const totalCount   = statsData?.total   ?? 0;
  const leadCount    = statsData?.lead    ?? 0;
  const activeCount  = statsData?.active  ?? 0;
  const churnedCount = statsData?.churned ?? 0;

  // Tỉ lệ % so với tổng (tránh chia 0)
  const leadPct    = totalCount > 0 ? Math.round((leadCount    / totalCount) * 100) : 0;
  const activePct  = totalCount > 0 ? Math.round((activeCount  / totalCount) * 100) : 0;
  const churnedPct = totalCount > 0 ? Math.round((churnedCount / totalCount) * 100) : 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
          <Building2 className="h-7 w-7 text-[var(--crm-danger)]" />
        </div>
        <p className="text-[15px] font-medium text-[var(--crm-danger)]">Có lỗi xảy ra khi tải danh sách khách hàng.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-[13px] font-medium text-foreground bg-card border border-[var(--border)] rounded-lg hover:bg-accent transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium text-foreground">Quản lý khách hàng</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Theo dõi và quản lý dữ liệu khách hàng 360°
          </p>
        </div>
        <button
          onClick={() => setCreateDialogOpen(true)}
          data-tour="customers-create-btn"
          className="h-9 px-4 text-[13px] font-medium text-white bg-[var(--crm-primary)] rounded-lg hover:bg-[#14528F] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo khách hàng
        </button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="customers-stats">
        <StatCard
          label="Tổng khách hàng"
          value={totalCount}
          delta={`${leadCount + activeCount} đang hoạt động`}
          positive
        />
        <StatCard
          label="Tiềm năng"
          value={leadCount}
          delta={totalCount > 0 ? `${leadPct}% tổng khách hàng` : undefined}
          positive
        />
        <StatCard
          label="Đang hoạt động"
          value={activeCount}
          delta={totalCount > 0 ? `${activePct}% tổng khách hàng` : undefined}
          positive
        />
        <StatCard
          label="Rời bỏ"
          value={churnedCount}
          delta={totalCount > 0 ? `${churnedPct}% tổng khách hàng` : undefined}
          positive={false}
        />
      </div>

      {/* ── Filter Bar ───────────────────── */}
      <div data-tour="customers-filters">
        <CustomerFilters
          onSearch={handleSearch}
          onStatusChange={handleStatusChange}
          onOwnerChange={handleOwnerChange}
          onDepartmentChange={handleDepartmentChange}
          users={usersList}
          showOwnerFilter={canChangeOwner}
          onExport={handleExport}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* ── Table/Grid ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 bg-card rounded-xl border border-[var(--border)]">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[var(--crm-primary)] border-t-transparent" />
        </div>
      ) : viewMode === "grid" ? (
        <CustomerGridView
          data={displayData || []}
          onRowClick={handleRowClick}
        />
      ) : (
        <CustomerTable
          data={displayData || []}
          onSort={handleSort}
          onRowClick={handleRowClick}
          onStatusClick={(c) => openDialog("status", c)}
          onOwnerClick={(c) => openDialog("owner", c)}
          onDeleteClick={(c) => openDialog("delete", c)}
          onRestoreClick={(c) => openDialog("restore", c)}
          canChangeOwner={canChangeOwner}
          canDelete={canDelete}
          canRestore={canRestore}
        />
      )}

      {/* ── Pagination ─────────────────────────────────── */}
      {!searchTerm && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">
            Hiển thị{" "}
            <span className="font-medium text-foreground">{((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total)}</span>
            {" "}của{" "}
            <span className="font-medium text-foreground">{total}</span> khách hàng
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 px-3 text-[13px] font-medium text-foreground bg-card border border-[var(--border)] rounded-lg hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang trước
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 px-3 text-[13px] font-medium text-foreground bg-card border border-[var(--border)] rounded-lg hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {/* ── Slide-over Panel ───────────────────────────── */}
      <Customer360Panel
        customer={panelCustomerData}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      {/* ── Dialogs ────────────────────────────────────── */}
      <CustomerFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        customer={selectedCustomer}
      />
      <OwnerChangeDialog
        open={ownerDialogOpen}
        onOpenChange={setOwnerDialogOpen}
        customer={selectedCustomer}
        users={usersList}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        customer={selectedCustomer}
      />
      <RestoreDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        customer={selectedCustomer}
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
