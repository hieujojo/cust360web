"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";
import type { CustomerInfoTab as CustomerInfoModel, CustomerSource } from "@/models/customerModel";
import { useUpdateCustomer } from "@/hooks/useCustomers";
import { useToast } from "@/helper/toastHelper";

const infoSchema = z.object({
  name: z.string().min(1, "Tên khách hàng là bắt buộc"),
  source: z.enum(["Website", "Referral", "Cold Call", "Event", "Partner", "Other"] as const),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type InfoFormValues = z.infer<typeof infoSchema>;

interface CustomerInfoTabProps {
  customerId: string;
  data: CustomerInfoModel;
  isDeleted: boolean;
}

export function CustomerInfoTab({ customerId, data, isDeleted }: CustomerInfoTabProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateCustomer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: data.name || "",
      source: (data.source as any) || "Website",
      email: data.email || "",
      phone: data.phone || "",
    },
  });

  const onSubmit = async (formData: InfoFormValues) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: customerId,
        payload: {
          name: formData.name,
          source: formData.source,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        },
      });
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin khách hàng.",
      });
      // reset form with new values to clear isDirty state
      reset(formData);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thông tin.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
        <div>
          <h2 className="text-lg font-bold text-foreground">Thông tin chung</h2>
          <p className="text-sm text-muted-foreground mt-1">Cập nhật thông tin hồ sơ của khách hàng</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <fieldset disabled={isDeleted || isSubmitting} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className={`w-full p-2.5 text-sm border rounded-lg outline-none transition-colors bg-background text-foreground ${
                  errors.name ? "border-red-300 focus:border-red-500" : "border-border focus:border-primary"
                } disabled:bg-muted disabled:text-muted-foreground`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>


            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Nguồn khách hàng</label>
              <select
                {...register("source")}
                className="w-full p-2.5 text-sm border border-border rounded-lg outline-none focus:border-primary bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
              >
                <option value="Website">Website</option>
                <option value="Referral">Giới thiệu</option>
                <option value="Cold Call">Gọi điện (Cold Call)</option>
                <option value="Event">Sự kiện</option>
                <option value="Partner">Đối tác</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email liên hệ chung</label>
              <input
                {...register("email")}
                type="email"
                className={`w-full p-2.5 text-sm border rounded-lg outline-none transition-colors bg-background text-foreground ${
                  errors.email ? "border-red-300 focus:border-red-500" : "border-border focus:border-primary"
                } disabled:bg-muted disabled:text-muted-foreground`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Số điện thoại chung</label>
              <input
                {...register("phone")}
                className="w-full p-2.5 text-sm border border-border rounded-lg outline-none focus:border-primary bg-background text-foreground disabled:bg-muted disabled:text-muted-foreground"
              />
            </div>
          </div>

          {!isDeleted && (
            <div className="pt-6 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-[var(--crm-primary)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Lưu thay đổi
              </button>
            </div>
          )}
        </fieldset>
      </form>
    </div>
  );
}
