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
    newPassword: z.string().min(8, "Mat khau phai co it nhat 8 ky tu"),
    confirmPassword: z.string().min(8, "Vui long xac nhan mat khau"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mat khau xac nhan khong khop",
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
        title: "Thanh cong",
        description: `Da dat lai mat khau cho ${user.email}`,
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Loi",
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
          <DialogTitle>Dat lai mat khau</DialogTitle>
          <DialogDescription>Dat mat khau moi cho {user.email}</DialogDescription>
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
            <Label htmlFor="newPassword">Mat khau moi *</Label>
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
            <Label htmlFor="confirmPassword">Xac nhan mat khau *</Label>
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
            <p className="font-medium">Luu y:</p>
            <ul className="mt-1 list-inside list-disc space-y-1">
              <li>Mat khau phai co it nhat 8 ky tu</li>
              <li>Nguoi dung nen doi mat khau sau lan dang nhap dau tien</li>
            </ul>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huy
            </Button>
            <Button type="submit" disabled={resetPassword.isPending}>
              {resetPassword.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Dat lai mat khau
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
  const action = isActive ? "vo hieu hoa" : "kich hoat";

  const handleConfirm = async () => {
    try {
      await toggleStatus.mutateAsync({
        id: user.id,
        payload: {
          isActive: !isActive,
        },
      });

      toast({
        title: "Thanh cong",
        description: `Da ${action} tai khoan ${user.email}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Loi",
        description: extractErrorMessage(error),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isActive ? "Vo hieu hoa" : "Kich hoat"} tai khoan</DialogTitle>
          <DialogDescription>
            Ban co chac chan muon {action} tai khoan nay?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ho ten:</span>
            <span className="text-sm text-muted-foreground">
              {user.displayName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trang thai hien tai:</span>
            <span
              className={`text-sm font-medium ${
                isActive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isActive ? "Dang hoat dong" : "Da vo hieu hoa"}
            </span>
          </div>
        </div>

        {isActive && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
            <p className="font-medium">Luu y:</p>
            <p className="mt-1">
              Nguoi dung se khong the dang nhap sau khi tai khoan bi vo hieu hoa.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Huy
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
            Xac nhan {action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
