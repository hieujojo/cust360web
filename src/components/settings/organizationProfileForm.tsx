"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useOrganizationProfile,
  useUpdateOrganizationProfile,
  useUploadOrganizationLogo,
} from "@/hooks/useOrganizationSettings";
import { useToast } from "@/helper/toastHelper";
import { extractErrorMessage } from "@/lib/api/client";

const TIMEZONES = [
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh (GMT+7)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "UTC", label: "UTC" },
];

const CURRENCIES = [
  { value: "VND", label: "VND — Việt Nam Đồng" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
];

const LANGUAGES = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

export function OrganizationProfileForm() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading } = useOrganizationProfile();
  const updateProfile = useUpdateOrganizationProfile();
  const uploadLogo = useUploadOrganizationLogo();

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");
  const [currency, setCurrency] = useState("VND");
  const [language, setLanguage] = useState("vi");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setTimezone(profile.timezone);
      setCurrency(profile.currency);
      setLanguage(profile.language);
      setIsDirty(false);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ name, timezone, currency, language });
      setIsDirty(false);
      toast({ title: "Đã lưu", description: "Thông tin tổ chức đã được cập nhật." });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadLogo.mutateAsync(file);
      toast({ title: "Đã tải lên", description: "Logo đã được cập nhật." });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: extractErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--crm-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-5">
      <div>
        <h2 className="text-[15px] font-medium text-card-foreground">Hồ sơ tổ chức</h2>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Thông tin hiển thị trên toàn bộ hệ thống và báo giá PDF.
        </p>
      </div>

      <div className="flex items-start gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
          {profile?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-contain" />
          ) : (
            <span className="text-2xl font-semibold text-muted-foreground">
              {name.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadLogo.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadLogo.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Tải logo lên
          </Button>
          <p className="mt-1.5 text-[12px] text-muted-foreground">PNG, JPG, WEBP hoặc SVG. Tối đa 2MB.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="org-name">Tên công ty</Label>
          <Input
            id="org-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Tên công ty"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org-timezone">Múi giờ</Label>
          <select
            id="org-timezone"
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value);
              setIsDirty(true);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org-currency">Tiền tệ</Label>
          <select
            id="org-currency"
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value);
              setIsDirty(true);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="org-language">Ngôn ngữ</Label>
          <select
            id="org-language"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setIsDirty(true);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateProfile.isPending || !name.trim() || !isDirty}
        >
          {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}
