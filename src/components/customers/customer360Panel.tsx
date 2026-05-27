"use client";

import { useState } from "react";
import { X, Mail, Phone, Building2, User, Calendar, FileText, MessageSquare, DollarSign } from "lucide-react";
import type { Customer, CustomerStatus, Contact } from "@/models/customerModel";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Customer360PanelProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
}

const tabs = [
  { key: "info",     label: "INFO",     icon: FileText },
  { key: "contacts", label: "CONTACTS", icon: User },
  { key: "deals",    label: "DEALS",    icon: DollarSign },
  { key: "timeline", label: "TIMELINE", icon: MessageSquare },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/* ── Status badge ─────────────────────────────────────── */

const statusConfig: Record<CustomerStatus, { label: string; class: string; dotClass: string }> = {
  Lead:     { label: "Tiềm năng", class: "badge-lead", dotClass: "bg-[var(--crm-primary)]" },
  Active:   { label: "Hoạt động", class: "badge-active", dotClass: "bg-[var(--crm-success)]" },
  Inactive: { label: "Tạm ngưng", class: "badge-inactive", dotClass: "bg-gray-400" },
  Churned:  { label: "Rời bỏ",   class: "badge-churned", dotClass: "bg-[var(--crm-danger)]" },
};

export function Customer360Panel({ customer, open, onClose }: Customer360PanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  if (!customer) return null;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed top-0 right-0 z-50 h-full w-full max-w-[520px]
          bg-white shadow-xl border-l border-[var(--crm-border)]
          flex flex-col
          ${open ? "slide-over-enter" : "slide-over-exit pointer-events-none"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--crm-border)]">
          <div>
            <h2 className="text-[15px] font-medium text-gray-900">{customer.name}</h2>
            <p className="text-[12px] text-gray-400 font-mono mt-0.5">{customer.customerCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${statusConfig[customer.status].class}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[customer.status].dotClass}`} />
              {statusConfig[customer.status].label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--crm-border)] px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium
                  border-b-2 transition-colors
                  ${isActive
                    ? "border-[var(--crm-primary)] text-[var(--crm-primary)]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "info"     && <InfoTab customer={customer} />}
          {activeTab === "contacts" && <ContactsTab contacts={customer.contacts} />}
          {activeTab === "deals"    && <PlaceholderTab title="Deals" description="Danh sách deals sẽ hiển thị ở đây khi được kết nối với backend." />}
          {activeTab === "timeline" && <PlaceholderTab title="Timeline" description="Lịch sử hoạt động sẽ hiển thị ở đây khi được kết nối với backend." />}
        </div>
      </div>
    </>
  );
}

/* ── INFO tab ─────────────────────────────────────────── */

function InfoTab({ customer }: { customer: Customer }) {
  const fields = [
    { icon: Mail,      label: "Email",           value: customer.email || "—" },
    { icon: Phone,     label: "Điện thoại",      value: customer.phone || "—" },
    { icon: User,      label: "Phụ trách",       value: customer.ownerName || "Chưa giao" },
    { icon: FileText,  label: "Nguồn",           value: customer.source },
    { icon: Calendar,  label: "Ngày tạo",        value: formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true, locale: vi }) },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div key={field.label} className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-gray-400" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">{field.label}</p>
              <p className="text-[13px] text-gray-900 mt-0.5">{field.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── CONTACTS tab ─────────────────────────────────────── */

function ContactsTab({ contacts }: { contacts: Contact[] }) {
  if (!contacts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-8 w-8 text-gray-300 mb-2" />
        <p className="text-[13px] text-gray-400">Chưa có liên hệ nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center gap-3 p-3 rounded-lg border border-[var(--crm-border)] hover:bg-gray-50 transition-colors"
        >
          <div className="h-9 w-9 rounded-full bg-[var(--crm-primary-light)] text-[var(--crm-primary)] flex items-center justify-center text-[12px] font-semibold uppercase shrink-0">
            {contact.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-gray-900 truncate">{contact.name}</p>
              {contact.isPrimary && (
                <span className="px-1.5 py-0.5 text-[10px] font-medium badge-active rounded">
                  Primary
                </span>
              )}
            </div>
            {contact.role && (
              <p className="text-[11px] text-gray-500">{contact.role}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {contact.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Placeholder tab ──────────────────────────────────── */

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
        <FileText className="h-6 w-6 text-gray-300" />
      </div>
      <p className="text-[14px] font-medium text-gray-500">{title}</p>
      <p className="text-[12px] text-gray-400 mt-1 text-center max-w-[280px]">{description}</p>
    </div>
  );
}
