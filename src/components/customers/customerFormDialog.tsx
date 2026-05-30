"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { X, Loader2, Search, ChevronDown, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCustomer } from "@/hooks/useCustomers";
import { useUsers } from "@/hooks/useUsers";
import type { CustomerSource, CreateContactRequest } from "@/models/customerModel";
import { useToast } from "@/helper/toastHelper";

const customerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng là bắt buộc"),
  source: z.enum(["Website", "Referral", "Cold Call", "Event", "Partner", "Other"] as const),
  status: z.enum(["Lead", "Active", "Inactive"] as const),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  ownerId: z.string().optional(),
  ownerName: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: {
  value: CustomerFormValues["status"];
  label: string;
  desc: string;
}[] = [
  { value: "Lead", label: "Tiềm năng", desc: "Chưa liên hệ, cần khai thác" },
  { value: "Active", label: "Đang hoạt động", desc: "Đã và đang giao dịch" },
  { value: "Inactive", label: "Không hoạt động", desc: "Tạm dừng liên hệ" },
];

export function CustomerFormDialog({ open, onOpenChange }: CustomerFormDialogProps) {
  const { toast } = useToast();
  const createCustomerMutation = useCreateCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactIsPrimary, setContactIsPrimary] = useState(true);

  // Owner combobox state
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const ownerRef = useRef<HTMLDivElement>(null);

  const { data: usersData, isLoading: usersLoading } = useUsers();
  const allUsers = usersData?.items ?? [];

  const filteredUsers = allUsers.filter((u) =>
    u.displayName?.toLowerCase().includes(ownerSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(ownerSearch.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ownerRef.current && !ownerRef.current.contains(e.target as Node)) {
        setOwnerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      source: "Website",
      status: "Lead",
      email: "",
      phone: "",
      ownerId: undefined,
      ownerName: undefined,
    },
  });

  const selectedStatus = watch("status");
  const selectedOwnerId = watch("ownerId");
  const selectedOwnerName = watch("ownerName");

  const handleSelectOwner = (user: { id: string; name: string }) => {
    setValue("ownerId", user.id);
    setValue("ownerName", user.name);
    setOwnerSearch("");
    setOwnerDropdownOpen(false);
  };

  const handleClearOwner = () => {
    setValue("ownerId", undefined);
    setValue("ownerName", undefined);
    setOwnerSearch("");
  };

  const handleClose = () => {
    reset();
    handleClearOwner();
    setStep(1);
    setContactName("");
    setContactRole("");
    setContactEmail("");
    setContactPhone("");
    setContactIsPrimary(true);
    onOpenChange(false);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      const contactsPayload = contactName.trim() ? [{
        name: contactName.trim(),
        role: contactRole.trim() || undefined,
        email: contactEmail.trim() || undefined,
        phone: contactPhone.trim() || undefined,
        isPrimary: contactIsPrimary,
      }] : undefined;

      await createCustomerMutation.mutateAsync({
        name: data.name,
        source: data.source as CustomerSource,
        email: data.email || undefined,
        phone: data.phone || undefined,
        ownerId: data.ownerId || undefined,
        contacts: contactsPayload,
      });
      toast({
        title: "Thành công",
        description: "Đã tạo khách hàng mới.",
      });
      handleClose();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo khách hàng.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 2) {
      void handleSubmit(onSubmit)(e as any);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-slate-800">Tạo khách hàng</h2>
            <div className="flex items-center gap-3 text-sm">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</span>
                <span className={step >= 1 ? "font-medium" : ""}>Thông tin chung</span>
              </div>
              <div className="w-8 h-px bg-slate-200"></div>
              <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</span>
                <span className={step >= 2 ? "font-medium" : ""}>Người liên hệ</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form id="customer-form" onSubmit={handleFormSubmit} className="px-8 py-6 space-y-5 overflow-y-auto flex-1">
          {/* STEP 1: Thông tin chung */}
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              {/* Tên khách hàng */}
              <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors placeholder:text-slate-400 ${
                errors.name
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="Nhập tên cá nhân hoặc công ty"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email + SĐT */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors placeholder:text-slate-400 ${
                  errors.email
                    ? "border-red-300 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                {...register("phone")}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-400"
                placeholder="0912 345 678"
              />
            </div>
          </div>

          {/* Giai đoạn */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Giai đoạn <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue("status", opt.value)}
                  className={`flex flex-col items-start p-3.5 rounded-lg border text-left transition-all ${
                    selectedStatus === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`text-sm font-semibold ${
                      selectedStatus === opt.value ? "text-blue-700" : "text-slate-700"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`text-xs mt-1 leading-tight ${
                      selectedStatus === opt.value ? "text-blue-500" : "text-slate-400"
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Nguồn + Người phụ trách */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nguồn */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nguồn</label>
              <select
                {...register("source")}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white text-slate-700"
              >
                <option value="Website">Website</option>
                <option value="Referral">Giới thiệu</option>
                <option value="Cold Call">Gọi điện trực tiếp</option>
                <option value="Event">Sự kiện</option>
                <option value="Partner">Đối tác</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            {/* Người phụ trách — combobox */}
            <div className="relative" ref={ownerRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Người phụ trách
              </label>
              <div>
                {/* Trigger */}
                <button
                  type="button"
                  onClick={() => setOwnerDropdownOpen((v) => !v)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border rounded-lg outline-none transition-colors bg-white ${
                    ownerDropdownOpen
                      ? "border-blue-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {selectedOwnerName ? (
                    <span className="text-slate-800 truncate">{selectedOwnerName}</span>
                  ) : (
                    <span className="text-slate-400">Chọn nhân viên</span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 shrink-0 ml-1 transition-transform ${
                      ownerDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {ownerDropdownOpen && (
                  <div className="absolute z-[9999] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                    {/* Search */}
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
                      <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <input
                        autoFocus
                        value={ownerSearch}
                        onChange={(e) => setOwnerSearch(e.target.value)}
                        className="flex-1 text-sm outline-none placeholder:text-slate-400 bg-transparent"
                        placeholder="Tìm tên hoặc email..."
                      />
                    </div>

                    {/* List */}
                    <ul className="max-h-44 overflow-y-auto py-1">
                      {usersLoading ? (
                        <li className="flex items-center justify-center py-4 text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-xs">Đang tải...</span>
                        </li>
                      ) : filteredUsers.length === 0 ? (
                        <li className="py-4 text-center text-xs text-slate-400">
                          Không tìm thấy nhân viên
                        </li>
                      ) : (
                        filteredUsers.map((u) => (
                          <li key={u.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectOwner({ id: u.id, name: u.displayName })}
                              className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-700 truncate">{u.displayName}</p>
                                {u.email && (
                                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                )}
                              </div>
                              {selectedOwnerId === u.id && (
                                <Check className="h-3.5 w-3.5 text-blue-500 shrink-0 ml-2" />
                              )}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>

                    {/* Clear option */}
                    {selectedOwnerId && (
                      <div className="border-t border-slate-100 py-1">
                        <button
                          type="button"
                          onClick={handleClearOwner}
                          className="w-full px-3 py-1.5 text-xs text-slate-400 hover:text-red-500 hover:bg-slate-50 text-left transition-colors"
                        >
                          Xóa lựa chọn
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
          )}

          {/* STEP 2: Người liên hệ */}
          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm border border-blue-100">
                Thêm một người liên hệ chính cho khách hàng này. (Bạn có thể bỏ qua nếu chưa có thông tin)
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ tên người liên hệ
                </label>
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-400 transition-colors"
                  placeholder="Nhập tên người liên hệ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chức vụ</label>
                <input
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-400 transition-colors"
                  placeholder="Ví dụ: Giám đốc, Kế toán..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    type="email"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-400 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 placeholder:text-slate-400 transition-colors"
                    placeholder="0912 345 678"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="inlineIsPrimary"
                  checked={contactIsPrimary}
                  onChange={(e) => setContactIsPrimary(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="inlineIsPrimary" className="text-sm text-slate-700">
                  Đặt làm người liên hệ chính
                </label>
              </div>
            </div>
          )}

        </form>
        {/* Footer */}
        <div className="px-8 pb-6 pt-4 flex justify-between gap-3 border-t border-slate-100">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Quay lại
              </button>
            ) : (
              <div />
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              
              {step === 1 ? (
                <button
                  type="button"
                  onClick={async () => {
                    const isValid = await trigger(["name", "status", "source", "email", "phone"]);
                    if (isValid) setStep(2);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  type="submit"
                  form="customer-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isSubmitting ? "Đang lưu..." : "Hoàn tất"}
                </button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}