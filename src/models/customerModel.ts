  export type CustomerStatus = "Lead" | "Active" | "Inactive" | "Churned";
  export type CustomerSource = "Website" | "Referral" | "Cold Call" | "Event" | "Partner" | "Other";

  // ============================================================================
  // SHARED
  // ============================================================================

  /** Maps to C# PaginationMetadata */
  export interface PaginationMetadata {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  }

  // ============================================================================
  // CONTACT
  // ============================================================================

  /** Maps to C# ContactResponse */
  export interface Contact {
    id: string;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
  }

  // ============================================================================
  // CUSTOMER
  // ============================================================================

  /** Maps to C# CustomerResponse (single customer, full detail) */
  export interface Customer {
    id: string;
    customerCode: string;
    avatarUrl?: string;
    name: string;
    status: CustomerStatus;
    source: CustomerSource;
    email?: string;
    phone?: string;
    ownerId: string;
    ownerName: string;
    ownerAvatarUrl?: string;
    departmentId: string;
    departmentName: string;
    contacts: Contact[];
    customFields?: Record<string, unknown>;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  /** Maps to C# CustomerSummaryResponse (list view) */
  export interface CustomerSummary {
    id: string;
    customerCode: string;
    name: string;
    status: CustomerStatus;
    source: CustomerSource;
    avatarUrl?: string;
    ownerName: string;
    ownerAvatarUrl?: string;
    departmentName: string;
    email?: string;
    phone?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // ============================================================================
  // CUSTOMER 360 VIEW
  // ============================================================================

  /** Maps to C# CustomerInfoTabResponse */
  export interface CustomerInfoTab {
    id: string;
    customerCode: string;
    avatarUrl?: string;
    name: string;
    type: string;
    status: CustomerStatus;
    source: CustomerSource;
    email?: string;
    phone?: string;
    ownerId: string;
    ownerName: string;
    ownerAvatarUrl?: string;
    departmentId: string;
    departmentName: string;
    customFields?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }

  /** Maps to C# QuickActionResponse */
  export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    action: string;
  }

  /** Maps to C# Customer360SidebarResponse */
  export interface Customer360Sidebar {
    quickActions: QuickAction[];
    openDealsCount: number;
    activeTicketsCount: number;
  }

  /** Maps to C# Customer360TabsResponse */
  export interface Customer360Tabs {
    contacts: Contact[];
    deals: unknown[];      // placeholder — module Deals chưa có
    timeline: unknown[];   // placeholder — module Timeline chưa có
    tickets: unknown[];    // placeholder — module Tickets chưa có
  }

  /** Maps to C# Customer360ViewResponse */
  export interface Customer360Response {
    info: CustomerInfoTab;
    tabs: Customer360Tabs;
    sidebar: Customer360Sidebar;
  }

  // ============================================================================
  // LIST & SEARCH
  // ============================================================================

  /** Maps to C# CustomerStatsResponse */
  export interface CustomerStatsResponse {
    total: number;
    lead: number;
    active: number;
    churned: number;
  }

  /** Maps to C# CustomerListResponse */
  export interface CustomersListResponse {
    items: CustomerSummary[];
    pagination: PaginationMetadata;
  }

  export interface CustomersListParams {
    status?: CustomerStatus;
    ownerId?: string;
    departmentId?: string;
    phone?: string;
    page?: number;
    pageSize?: number;
    sortBy?: "name" | "status" | "createdAt" | "owner";
    sortDir?: "asc" | "desc";
  }

  /** Maps to C# CustomerSearchResultResponse */
  export interface CustomerSearchResult {
    id: string;
    customerCode: string;
    name: string;
    status: CustomerStatus;
    email?: string;
    phone?: string;
    score: number;
  }

  /** Maps to C# CustomerSearchResponse */
  export interface CustomerSearchResponse {
    results: CustomerSearchResult[];
    totalCount: number;
    query: string;
  }

  // ============================================================================
  // REQUESTS
  // ============================================================================

  /** Maps to C# CreateCustomerRequest */
  export interface CreateCustomerRequest {
    name: string;
    source: CustomerSource;
    email?: string;
    phone?: string;
    /** Role ≤ 2 only: gán cho nhân viên khác, nếu null backend dùng current user */
    ownerId?: string;
    customFields?: Record<string, unknown>;
    contacts?: Omit<CreateContactRequest, "custId">[];
  }

  /** Maps to C# UpdateCustomerRequest */
  export interface UpdateCustomerRequest {
    name?: string;
    source?: CustomerSource;
    email?: string;
    phone?: string;
    /** Role ≤ 2 only */
    ownerId?: string;
    /** Role ≤ 2 only */
    departmentId?: string;
    customFields?: Record<string, unknown>;
  }

  /** Maps to C# UpdateCustomerStatusRequest */
  export interface ChangeCustomerStatusRequest {
    newStatus: CustomerStatus;
  }

  /** Maps to C# UpdateCustomerOwnerRequest */
  export interface ChangeCustomerOwnerRequest {
    newOwnerId: string;
  }

  /** Maps to C# CreateContactRequest (dùng cho cả add lẫn update contact) */
  export interface CreateContactRequest {
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
  }

  /** Alias — backend dùng chung CreateContactRequest cho cả update */
  export type UpdateContactRequest = CreateContactRequest;