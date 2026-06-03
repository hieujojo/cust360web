"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, User as UserIcon, Mail, Phone, Shield, Building2, Camera } from "lucide-react";
import { ChangeEvent, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { userService } from "@/services";
import { User } from "@/models";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getCurrentUser(),
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveAvatarMutation = useMutation<User, Error, string>({
    mutationFn: (avatarUrl: string) => userService.updateMyProfile({ avatarUrl }),
    onSuccess: (updatedProfile: User) => {
      queryClient.setQueryData(["profile"], updatedProfile);
      setAvatarPreview(null);
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Xem thông tin cá nhân của bạn</p>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ảnh đại diện</CardTitle>
          <CardDescription>Cập nhật ảnh profile của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-24 h-24">
              <img
                src={avatarPreview || profile?.avatarUrl || "/default-avatar.png"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-2 border-muted"
              />
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm text-muted-foreground">
                Nhấp vào icon camera để chọn ảnh đại diện mới.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => saveAvatarMutation.mutate(avatarPreview ?? "")}
                  disabled={!avatarPreview || saveAvatarMutation.isPending}
                  variant="secondary"
                >
                  {saveAvatarMutation.isPending ? "Đang lưu..." : "Lưu ảnh"}
                </Button>
                {avatarPreview && (
                  <span className="text-sm text-muted-foreground">Ảnh mới đã sẵn sàng để lưu.</span>
                )}
              </div>
              {saveAvatarMutation.isError && (
                <p className="text-sm text-destructive">Không lưu được ảnh. Vui lòng thử lại.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thông tin tài khoản</CardTitle>
          <CardDescription>Thông tin cá nhân và tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Mã nhân viên</p>
              <p className="text-sm font-medium">{profile?.employeeCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Tên hiển thị</p>
              <p className="text-sm font-medium">{profile?.displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Số điện thoại</p>
              <p className="text-sm font-medium">{profile?.phone || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Vai trò</p>
              <Badge variant="secondary" className="mt-0.5">
                {profile?.role === 1 ? "Owner" : profile?.role === 2 ? "Admin" : "User"}
              </Badge>
            </div>
          </div>

          {profile?.departmentName && (
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phòng ban</p>
                <p className="text-sm font-medium">{profile.departmentName}</p>
              </div>
            </div>
          )}

          {profile?.teamName && (
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Team</p>
                <p className="text-sm font-medium">
                  {profile.teamName} {profile.isTeamLead && <span className="text-xs font-semibold text-primary">(Lead)</span>}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note about editing */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Lưu ý:</strong> Để cập nhật các thông tin cá nhân khác (ngoài ảnh đại diện), vui lòng liên hệ với quản trị viên.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
