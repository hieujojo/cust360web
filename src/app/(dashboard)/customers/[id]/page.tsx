"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useCustomer360 } from "@/hooks/useCustomers";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { canDeleteCustomer, canChangeCustomerOwner, canRestoreCustomer } from "@/helper/authHelper";

import { CustomerSidebar } from "@/components/customers/customerSidebar";
import { Tabs } from "@/components/ui/tabs";
import { CustomerInfoTab } from "@/components/customers/customerInfoTab";
import { ContactsTab } from "@/components/customers/contactsTab";
import { PlaceholderTab } from "@/components/customers/placeholderTab";

// Dialogs
import { StatusChangeDialog } from "@/components/customers/statusChangeDialog";
import { OwnerChangeDialog } from "@/components/customers/ownerChangeDialog";
import { DeleteDialog } from "@/components/customers/deleteDialog";
import { RestoreDialog } from "@/components/customers/restoreDialog";

export default function Customer360Page() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { user: currentUser } = useAuth();
  
  // Permissions
  const canDelete = canDeleteCustomer(currentUser ?? null);
  const canChangeOwner = canChangeCustomerOwner(currentUser ?? null);
  const canRestore = canRestoreCustomer(currentUser ?? null);

  // Users for owner dropdown
  const { data: usersData } = useUsers();
  const usersList = usersData?.items || [];

  // Data
  const { data, isLoading, error } = useCustomer360(id);

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-red-500 font-semibold">Không tìm thấy thông tin khách hàng.</p>
        <button 
          onClick={() => router.push("/customers")}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Determine if customer is soft-deleted based on status or flag if added
  const isDeleted = false; // Assuming no isDeleted flag in 360 response right now, but could be added

  // Pseudo Customer object for dialogs
  const currentCustomerContext = {
    ...data.info,
    ...data.sidebar
  } as any;

  const tabsConfig = [
    {
      id: "info",
      label: "Thông tin chung",
      content: <CustomerInfoTab customerId={id} data={data.info} isDeleted={isDeleted} />
    },
    {
      id: "contacts",
      label: `Người liên hệ (${data.tabs.contacts.length})`,
      content: <ContactsTab customerId={id} data={data.tabs.contacts} isDeleted={isDeleted} />
    },
    {
      id: "deals",
      label: "Cơ hội bán hàng (Deals)",
      content: <PlaceholderTab 
        title="Quản lý Deals" 
        description="Giao diện theo dõi các cơ hội bán hàng liên kết với khách hàng này." 
      />
    },
    {
      id: "timeline",
      label: "Lịch sử hoạt động",
      content: <PlaceholderTab 
        title="Timeline" 
        description="Ghi nhận mọi lịch sử tương tác, meeting, gọi điện, email." 
      />
    },
    {
      id: "tickets",
      label: "Hỗ trợ (Tickets)",
      content: <PlaceholderTab 
        title="Hỗ trợ khách hàng" 
        description="Quản lý các yêu cầu hỗ trợ, khiếu nại từ khách hàng." 
      />
    }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/customers"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Quay lại danh sách"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Hồ sơ khách hàng 360
          </h1>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <CustomerSidebar 
          info={data.info}
          sidebar={data.sidebar} 
          onStatusClick={() => setStatusDialogOpen(true)}
          onOwnerClick={() => setOwnerDialogOpen(true)}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          onRestoreClick={() => setRestoreDialogOpen(true)}
          canChangeOwner={canChangeOwner}
          canDelete={canDelete}
          canRestore={canRestore}
          isDeleted={isDeleted}
        />

        <div className="flex-1 w-full min-w-0">
          <Tabs tabs={tabsConfig} defaultTab="info" />
        </div>
      </div>

      {/* Dialogs */}
      <StatusChangeDialog 
        open={statusDialogOpen} 
        onOpenChange={setStatusDialogOpen} 
        customer={currentCustomerContext} 
      />
      
      <OwnerChangeDialog 
        open={ownerDialogOpen} 
        onOpenChange={setOwnerDialogOpen} 
        customer={currentCustomerContext}
        users={usersList}
      />
      
      <DeleteDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        customer={currentCustomerContext} 
      />

      <RestoreDialog 
        open={restoreDialogOpen} 
        onOpenChange={setRestoreDialogOpen} 
        customer={currentCustomerContext} 
      />
    </div>
  );
}
