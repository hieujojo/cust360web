"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Star, Trash2, Edit2, ShieldAlert } from "lucide-react";
import type { Contact } from "@/models/customerModel";
import { ContactFormDialog } from "@/components/customers/contactFormDialog";
import { useDeleteContact, useSetPrimaryContact } from "@/hooks/useCustomers";
import { useToast } from "@/helper/toastHelper";

interface ContactsTabProps {
  customerId: string;
  data: Contact[];
  isDeleted: boolean;
}

export function ContactsTab({ customerId, data, isDeleted }: ContactsTabProps) {
  const { toast } = useToast();
  const deleteMutation = useDeleteContact();
  const setPrimaryMutation = useSetPrimaryContact();

  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  if (typeof window !== "undefined") {
    window.onclick = () => setOpenDropdownId(null);
  }

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingContact(null);
    setFormOpen(true);
  };

  const handleDelete = async (contactId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa người liên hệ này?")) {
      try {
        await deleteMutation.mutateAsync({ custId: customerId, contactId });
        toast({ title: "Thành công", description: "Đã xóa người liên hệ." });
      } catch (error: any) {
        toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      await setPrimaryMutation.mutateAsync({ custId: customerId, contactId });
      toast({ title: "Thành công", description: "Đã đặt làm liên hệ chính." });
    } catch (error: any) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Người liên hệ</h2>
          <p className="text-sm text-slate-500 mt-1">Danh sách nhân sự liên lạc của khách hàng</p>
        </div>
        {!isDeleted && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm liên hệ
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Họ tên</th>
              <th scope="col" className="px-6 py-4 font-semibold">Chức vụ</th>
              <th scope="col" className="px-6 py-4 font-semibold">Liên lạc</th>
              {!isDeleted && (
                <th scope="col" className="px-6 py-4 text-right font-semibold">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={isDeleted ? 3 : 4} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <UserCircle2 className="h-10 w-10 text-slate-300 mb-2" />
                    <p>Chưa có người liên hệ nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((contact) => (
                <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                          Chính
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {contact.role || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-slate-500 space-y-1">
                      {contact.email && <span>📧 {contact.email}</span>}
                      {contact.phone && <span>📱 {contact.phone}</span>}
                      {!contact.email && !contact.phone && "—"}
                    </div>
                  </td>
                  {!isDeleted && (
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={(e) => toggleDropdown(contact.id, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {openDropdownId === contact.id && (
                          <div className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                            <div className="py-1">
                              <button
                                onClick={() => handleEdit(contact)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                              >
                                <Edit2 className="h-4 w-4 mr-2 text-slate-400" />
                                Chỉnh sửa
                              </button>
                              {!contact.isPrimary && (
                                <button
                                  onClick={() => handleSetPrimary(contact.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                                >
                                  <Star className="h-4 w-4 mr-2 text-slate-400" />
                                  Đặt làm chính
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(contact.id)}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                Xóa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ContactFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customerId={customerId}
        contact={editingContact}
      />
    </div>
  );
}

// Just importing the icon for the empty state
import { UserCircle2 } from "lucide-react";
