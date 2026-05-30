"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, X, Plus, Trash2, FileText } from "lucide-react";
import { useCreateQuotation, useUpdateQuotation } from "@/hooks/useQuotations";
import type { Quotation, CreateQuotationRequest, QuotationStatus } from "@/models/quotationModel";
import { useToast } from "@/helper/toastHelper";

// ─── Schema ──────────────────────────────────────────────
const itemSchema = z.object({
  description: z.string().min(1, "Mô tả là bắt buộc"),
  category: z.string().optional(),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z.number().min(0, "Đơn giá phải >= 0"),
});

const schema = z.object({
  currency: z.string().min(1, "Tiền tệ là bắt buộc"),
  status: z.enum(["Draft", "Sent", "Accepted", "Rejected"]),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  items: z.array(itemSchema).min(1, "Phải có ít nhất 1 item"),
});

type FormValues = z.infer<typeof schema>;

// ─── Constants ───────────────────────────────────────────
const CURRENCIES = [
  { value: "VND", label: "VND — Việt Nam Đồng" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "SGD", label: "SGD — Singapore Dollar" },
  { value: "JPY", label: "JPY — Japanese Yen" },
];

const STATUSES: { value: QuotationStatus; label: string; classes: string }[] = [
  { value: "Draft",    label: "Draft",    classes: "bg-slate-100 text-slate-600 border-slate-200 data-[active=true]:bg-slate-700 data-[active=true]:text-white data-[active=true]:border-slate-700" },
  { value: "Sent",     label: "Sent",     classes: "bg-blue-50 text-blue-600 border-blue-200 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:border-blue-600" },
  { value: "Accepted", label: "Accepted", classes: "bg-green-50 text-green-600 border-green-200 data-[active=true]:bg-green-600 data-[active=true]:text-white data-[active=true]:border-green-600" },
  { value: "Rejected", label: "Rejected", classes: "bg-red-50 text-red-600 border-red-200 data-[active=true]:bg-red-600 data-[active=true]:text-white data-[active=true]:border-red-600" },
];

// ─── Props ───────────────────────────────────────────────
interface QuotationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: string;
  quotation?: Quotation | null;
}

// ─── Component ───────────────────────────────────────────
export function QuotationFormDialog({
  open,
  onOpenChange,
  dealId,
  quotation,
}: QuotationFormDialogProps) {
  const { toast } = useToast();
  const createQuote = useCreateQuotation(dealId);
  const updateQuote = useUpdateQuotation(dealId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "VND",
      status: "Draft",
      notes: "",
      validUntil: "",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = watch("items") ?? [];
  const watchedCurrency = watch("currency") ?? "VND";
  const watchedStatus = watch("status");

  const computedTotal = watchedItems.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  }, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: watchedCurrency,
    }).format(Math.round(n));

  useEffect(() => {
    if (!open) return;
    if (quotation) {
      reset({
        currency: quotation.currency,
        status: quotation.status,
        notes: quotation.notes ?? "",
        validUntil: quotation.validUntil
          ? new Date(quotation.validUntil).toISOString().slice(0, 10)
          : "",
        items: quotation.items.length > 0 ? quotation.items : [],
      });
    } else {
      reset({
        currency: "VND",
        status: "Draft",
        notes: "",
        validUntil: "",
        items: [{ description: "", category: "", quantity: 1, unitPrice: 0 }],
      });
    }
  }, [open, quotation, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: CreateQuotationRequest & { status: QuotationStatus } = {
        currency: values.currency,
        status: values.status,
        notes: values.notes || undefined,
        items: values.items,
        validUntil: values.validUntil ? new Date(values.validUntil) : undefined,
      };

      if (quotation) {
        await updateQuote.mutateAsync({ id: quotation.id, payload });
      } else {
        await createQuote.mutateAsync(payload);
      }

      toast({
        title: "Thành công",
        description: quotation ? "Đã cập nhật báo giá." : "Đã tạo báo giá mới.",
      });
      onOpenChange(false);
    } catch {
      toast({ title: "Lỗi", description: "Không thể lưu báo giá.", variant: "destructive" });
    }
  };

  if (!open) return null;

  const isSubmitting = createQuote.isPending || updateQuote.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ── Header ── */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-800">
                {quotation ? "Chỉnh sửa báo giá" : "Tạo báo giá"}
              </h2>
              {quotation && (
                <p className="text-[11px] text-slate-400">
                  {quotation.code} · Phiên bản {quotation.version}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="space-y-5 px-6 py-5">

            {/* Status */}
            <div>
              <Label>Trạng thái</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    data-active={watchedStatus === s.value}
                    onClick={() => setValue("status", s.value)}
                    className={`rounded-full border px-3.5 py-1 text-[12px] font-medium transition-all ${s.classes}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Currency + Valid Until */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Tiền tệ</Label>
                <select
                  {...register("currency")}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.currency && <FieldError msg={errors.currency.message} />}
              </div>
              <div>
                <Label>Hết hạn quote</Label>
                <input
                  type="date"
                  {...register("validUntil")}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Ghi chú</Label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Điều khoản, ghi chú đặc biệt..."
                className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="h-px bg-slate-100" />

            {/* Items */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Items báo giá</Label>
                  <p className="text-[11px] text-slate-400">Tổng tính từ số lượng × đơn giá</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    append({ description: "", category: "", quantity: 1, unitPrice: 0 })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm item
                </button>
              </div>

              {errors.items?.message && (
                <p className="mt-1 text-xs text-red-500">{errors.items.message}</p>
              )}

              {fields.length === 0 ? (
                <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-center">
                  <p className="text-sm text-slate-400">Chưa có item nào.</p>
                  <button
                    type="button"
                    onClick={() =>
                      append({ description: "", category: "", quantity: 1, unitPrice: 0 })
                    }
                    className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    + Thêm item đầu tiên
                  </button>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {fields.map((field, index) => {
                    const lineTotal =
                      (Number(watchedItems[index]?.quantity) || 0) *
                      (Number(watchedItems[index]?.unitPrice) || 0);
                    return (
                      <div
                        key={field.id}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >
                        {/* Item header */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
                            {index + 1}
                          </span>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="rounded-md p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                              aria-label="Xóa item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Hạng mục + Mô tả */}
                        <div className="mb-3 grid grid-cols-2 gap-3">
                          <div>
                            <Label>Hạng mục</Label>
                            <input
                              {...register(`items.${index}.category`)}
                              placeholder="Gói Chấm công cơ bản..."
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                            />
                          </div>
                          <div>
                            <Label required>Mô tả</Label>
                            <input
                              {...register(`items.${index}.description`)}
                              placeholder="Chi tiết dịch vụ..."
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                            />
                            {errors.items?.[index]?.description && (
                              <FieldError msg={errors.items[index]?.description?.message} />
                            )}
                          </div>
                        </div>

                        {/* Qty + Price + Total */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label required>Số lượng</Label>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                            />
                            {errors.items?.[index]?.quantity && (
                              <FieldError msg={errors.items[index]?.quantity?.message} />
                            )}
                          </div>
                          <div>
                            <Label required>Đơn giá</Label>
                            <input
                              type="number"
                              step="1000"
                              min="0"
                              {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                            />
                            {errors.items?.[index]?.unitPrice && (
                              <FieldError msg={errors.items[index]?.unitPrice?.message} />
                            )}
                          </div>
                          <div>
                            <Label>Thành tiền</Label>
                            <div className="mt-1 rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm font-medium text-slate-600">
                              {fmt(lineTotal)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer (sticky) ── */}
          <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4">
            <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-sm text-slate-500">Tổng giá trị</span>
              <span className="text-base font-semibold text-slate-800">{fmt(computedTotal)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-w-[100px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {quotation ? "Lưu thay đổi" : "Tạo mới"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-slate-500">
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-[11px] text-red-500">{msg}</p>;
}