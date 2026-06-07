"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/helper/toastHelper";
import { useResetPassword, useToggleUserStatus } from "@/hooks/useUsers";
import { extractErrorMessage } from "@/lib/api/client";
import type { ResetPasswordRequest, User } from "@/models";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(8, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: UserDialogProps) {
  const { toast } = useToast();
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!user) {
      return;
    }

    try {
      await resetPassword.mutateAsync({
        id: user.id,
        payload: {
          newPassword: data.newPassword,
        } as ResetPasswordRequest,
      });

      toast({
        title: "Thành công",
        description: `Đã đặt lại mật khẩu cho ${user.email}`,
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: extractErrorMessage(error),
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          <DialogDescription>Đặt mật khẩu mới cho {user.email}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới *</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="********"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu *</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="********"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            <p className="font-medium">Lưu ý:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>Mật khẩu phải có ít nhất 8 ký tự</li>
              <li>Người dùng nên đổi mật khẩu sau lần đăng nhập đầu tiên</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Đặt lại mật khẩu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ToggleStatusDialog({
  open,
  onOpenChange,
  user,
}: UserDialogProps) {
  const { toast } = useToast();
  const toggleStatus = useToggleUserStatus();

  if (!user) {
    return null;
  }

  const isActive = user.isActive;
  const action = isActive ? "vô hiệu hóa" : "kích hoạt";

  const handleConfirm = async () => {
    try {
      await toggleStatus.mutateAsync({
        id: user.id,
        payload: {
          isActive: !isActive,
        },
      });

      toast({
        title: "Thành công",
        description: `Đã ${action} tài khoản ${user.email}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: extractErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isActive ? "Vô hiệu hóa" : "Kích hoạt"} tài khoản</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn {action} tài khoản này không?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Họ tên:</span>
            <span className="text-sm text-muted-foreground">
              {user.displayName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trạng thái hiện tại:</span>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isActive ? "Đang hoạt động" : "Đã vô hiệu hóa"}
            </span>
          </div>
        </div>

        {isActive && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <p className="font-medium">Lưu ý:</p>
            <p className="mt-1">
              Người dùng sẽ không thể đăng nhập sau khi tài khoản bị vô hiệu hóa.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant={isActive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={toggleStatus.isPending}
          >
            {toggleStatus.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Xác nhận {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
