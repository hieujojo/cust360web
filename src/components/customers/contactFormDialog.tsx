"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAddContact, useUpdateContact } from "@/hooks/useCustomers";
import type { Contact } from "@/models/customerModel";
import { useToast } from "@/helper/toastHelper";

const contactSchema = z.object({
  name: z.string().min(1, "Tên người liên hệ là bắt buộc"),
  role: z.string().optional().or(z.literal("")),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  isPrimary: z.boolean(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  contact?: Contact | null;
}

export function ContactFormDialog({ open, onOpenChange, customerId, contact }: ContactFormDialogProps) {
  const { toast } = useToast();
  const addMutation = useAddContact();
  const updateMutation = useUpdateContact();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEdit = !!contact;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      role: "",
      email: "",
      phone: "",
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (contact && open) {
      reset({
        name: contact.name,
        role: contact.role || "",
        email: contact.email || "",
        phone: contact.phone || "",
        isPrimary: contact.isPrimary,
      });
    } else if (!open) {
      reset({
        name: "",
        role: "",
        email: "",
        phone: "",
        isPrimary: false,
      });
    }
  }, [contact, open, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEdit && contact) {
        await updateMutation.mutateAsync({
          custId: customerId,
          contactId: contact.id,
          payload: {
            name: data.name,
            role: data.role || undefined,
            email: data.email || undefined,
            phone: data.phone || undefined,
            isPrimary: data.isPrimary,
          },
        });
        toast({ title: "Thành công", description: "Đã cập nhật người liên hệ." });
      } else {
        await addMutation.mutateAsync({
          custId: customerId,
          payload: {
            name: data.name,
            role: data.role || undefined,
            email: data.email || undefined,
            phone: data.phone || undefined,
            isPrimary: data.isPrimary,
          },
        });
        toast({ title: "Thành công", description: "Đã thêm người liên hệ mới." });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu người liên hệ.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEdit ? "Sửa người liên hệ" : "Thêm người liên hệ"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name")}
              className={`w-full p-2 text-sm border rounded-lg outline-none transition-colors ${
                errors.name ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="Nhập tên người liên hệ"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chức vụ</label>
            <input
              {...register("role")}
              className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              placeholder="Ví dụ: Giám đốc, Kế toán..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className={`w-full p-2 text-sm border rounded-lg outline-none transition-colors ${
                errors.email ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
              }`}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
            <input
              {...register("phone")}
              className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
              placeholder="0912345678"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPrimary"
              {...register("isPrimary")}
              className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isPrimary" className="text-sm text-slate-700">
              Đặt làm người liên hệ chính
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
