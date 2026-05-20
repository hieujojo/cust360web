"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, User as UserIcon, Mail, Phone, Briefcase, Shield, Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { userService } from "@/services";

export default function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => userService.getCurrentUser(),
  });

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
              <p className="text-xs text-muted-foreground">Tên hiển thị</p>
              <p className="text-sm font-medium">{profile?.displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Chức danh</p>
              <p className="text-sm font-medium">{profile?.jobTitle || "—"}</p>
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

          {profile?.departmentId && (
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phòng ban</p>
                <p className="text-sm font-medium">{profile.departmentId}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Note about editing */}
      <Card className="border-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Lưu ý:</strong> Để cập nhật thông tin cá nhân, vui lòng liên hệ với quản trị viên.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
