"use client";

import { useEffect, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useCreateDeal, usePipelineStages, useUpdateDeal } from "@/hooks/useDeals";
import type { Deal } from "@/models/dealModel";
import { useToast } from "@/helper/toastHelper";
import { useCustomers, useCustomer360 } from "@/hooks/useCustomers";

const schema = z.object({
  title: z.string().min(1, "Title là bắt buộc"),
  customer: z.string().min(1, "Customer là bắt buộc"),
  value: z.number().min(0, "Value phải >= 0"),
  currency: z.string().min(1, "Currency là bắt buộc"),
  expectedCloseDate: z.string().optional(),
  expectedRevenue: z.number().min(0).optional(),
  owner: z.string().optional(),
  stage: z.string().min(1, "Stage là bắt buộc"),
  probability: z.number().min(0).max(100),
  notes: z.string().optional(),
  contacts: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface DealFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
}

export function DealFormDialog({ open, onOpenChange, deal }: DealFormDialogProps) {
  const { toast } = useToast();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: usersData } = useUsers();
  const { data: stages = [] } = usePipelineStages();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      customer: "",
      value: 0,
      expectedRevenue: 0,
      currency: "VND",
      stage: "",
      probability: 50,
      notes: "",
      contacts: [],
    },
  });

  const { data: customersData } = useCustomers({ pageSize: 100 });
  const selectedCustomerId = watch("customer");
  const { data: customer360 } = useCustomer360(selectedCustomerId);
  const availableContacts = customer360?.tabs?.contacts ?? [];

  useEffect(() => {
    if (!open) return;
    if (deal) {
      reset({
        title: deal.title,
        customer: deal.customerId,
        value: deal.value,
        currency: deal.currency,
        expectedCloseDate: deal.expectedCloseDate?.slice(0, 10),
        owner: deal.ownerId,
        stage: deal.stage,
        probability: deal.probability,
        expectedRevenue: deal.expectedRevenue,
        notes: deal.notes ?? "",
        contacts: deal.contacts ?? [],
      });
      return;
    }

    reset({
      title: "",
      customer: "",
      value: 0,
      expectedRevenue: 0,
      currency: "VND",
      expectedCloseDate: "",
      owner: "",
      stage: stages[0]?.name ?? "",
      probability: 50,
      notes: "",
      contacts: [],
    });
  }, [deal, open, reset, stages]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        expectedCloseDate: values.expectedCloseDate ? values.expectedCloseDate : undefined,
        owner: values.owner && values.owner.length > 0 ? values.owner : undefined,
      } as FormValues & { expectedCloseDate?: string; owner?: string };

      if (deal) {
        await updateDeal.mutateAsync({ id: deal.id, payload });
      } else {
        await createDeal.mutateAsync(payload);
      }
      toast({ title: "Thành công", description: deal ? "Đã cập nhật deal." : "Đã tạo deal mới." });
      onOpenChange(false);
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu deal.", variant: "destructive" });
    }
  };

  if (!open) return null;

  const isSubmitting = createDeal.isPending || updateDeal.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">{deal ? "Edit Deal" : "Tạo Giao Dịch"}</h2>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-1 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Tiêu đề*" error={errors.title?.message} {...register("title")} />
            <div>
              <label className="mb-1 block text-sm font-medium">Khách hàng*</label>
              <select {...register("customer")} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Chọn customer</option>
                {(customersData?.items ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <InputField label="Giá trị hợp đồng*" type="number" step="0.01" error={errors.value?.message} {...register("value", { valueAsNumber: true })} / >
            <InputField label="Tiền tệ*" error={errors.currency?.message} {...register("currency")} />
            <InputField label="Ngày chốt dự kiến" type="date" {...register("expectedCloseDate")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Doanh thu kỳ vọng" type="number" step="0.01" {...register("expectedRevenue", { valueAsNumber: true })} />
            <div>
              <label className="mb-1 block text-sm font-medium">Người phụ trách</label>
              <select {...register("owner")} className="w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Tôi</option>
                {(usersData?.items ?? []).map((u) => (
                  <option key={u.id} value={u.id}>{u.displayName}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Giai đoạn*</label>
              <select {...register("stage")} className="w-full rounded-lg border px-3 py-2 text-sm">
                {(stages ?? []).map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Khả năng: {watch("probability")}%</label>
              <input type="range" min={0} max={100} {...register("probability", { valueAsNumber: true })} className="w-full" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Ghi chú</label>
            <textarea {...register("notes")} className="h-24 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          {selectedCustomerId && (
  <div>
    <label className="mb-1 block text-sm font-medium">Contacts liên quan</label>
    {availableContacts.length === 0 ? (
      <p className="text-xs text-gray-500">Khách hàng này chưa có contact nào.</p>
    ) : (
      <div className="flex flex-col gap-2 rounded-lg border p-3 max-h-40 overflow-y-auto">
           {availableContacts.map(c => {
                    const selected = watch("contacts") ?? [];
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected.includes(c.id)}
                          onChange={(e) => {
                            const cur = watch("contacts") ?? [];
                            setValue(
                              "contacts",
                              e.target.checked
                                ? [...cur, c.id]
                                : cur.filter(id => id !== c.id),
                            );
                          }}
                        />
                        <span>{c.name}</span>
                        {c.role && <span className="text-gray-400 text-xs">· {c.role}</span>}
                        {c.isPrimary && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-1 rounded">
                            Primary
                          </span>
                        )}
                      </label>
                    );
                  })}
      </div>
    )}
  </div>
)}

          <div className="flex justify-end gap-2 border-t pt-4">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border px-4 py-2 text-sm">
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--crm-primary)] px-4 py-2 text-sm font-medium text-white"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {deal ? "Lưu" : "Tạo deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input {...props} className="w-full rounded-lg border px-3 py-2 text-sm" />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

