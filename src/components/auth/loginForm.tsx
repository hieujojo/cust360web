"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Copy, Check, Mail, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/helper/toastHelper";
import { useAuth } from "@/hooks/useAuth";
import { clearApiHeaders, extractErrorMessage } from "@/lib/api/client";
import { AuthService } from "@/services";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// 👇 Thay bằng tài khoản thật của bạn
const TEST_EMAIL = "adminTest@crm360.vn";
const TEST_PASSWORD = "12345678";

export function LoginForm() {
  const router = useRouter();
  const { toast, dismiss } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const sleepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wakingToastIdRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const copyToClipboard = async (text: string, type: "email" | "password") => {
    await navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const clearTimers = () => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // Toast waking — persistent
    const { id: wakingToastId, update } = toast({
      title: "⏳ Server đang được kích hoạt",
      description: "Vui lòng chờ một chút nhé...",
      duration: Infinity,
    });
    wakingToastIdRef.current = wakingToastId;

    // Sau 30s chưa xong → cập nhật nội dung toast
    sleepTimeoutRef.current = setTimeout(() => {
      update({
        id: wakingToastId,
        title: "😴 Server có vẻ đang ngủ đông",
        description: "Bấm F5 hoặc reload lại trang để khởi động lại nhé!",
        duration: Infinity,
      });
    }, 30000);

    try {
      const loginResponse = await AuthService.login({
        email: data.email,
        password: data.password,
      });

      const { accessToken, user, firebaseToken } = loginResponse;

      if (!accessToken) throw new Error("Token not received from server");
      if (!user || !user.displayName) throw new Error("User data incomplete");

      await login(user, accessToken, firebaseToken);

      clearTimers();
      dismiss(wakingToastId);

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${user.displayName}!`,
      });

      router.push("/dashboard");
    } catch (error) {
      clearTimers();
      dismiss(wakingToastId);

      clearApiHeaders();
      document.cookie = "accessToken=; path=/; max-age=0";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: extractErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@company.com"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Đăng nhập
        </Button>
      </form>

      <div className="pt-5 flex flex-col gap-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-1">
          Tài khoản demo
        </p>

        <div className="flex items-center justify-between bg-background border border-border rounded-lg px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Email</p>
              <p className="text-xs font-mono text-foreground">{TEST_EMAIL}</p>
            </div>
          </div>
          <button type="button" onClick={() => copyToClipboard(TEST_EMAIL, "email")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1">
            {copiedEmail ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between bg-background border border-border rounded-lg px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Mật khẩu</p>
              <p className="text-xs font-mono text-foreground">{TEST_PASSWORD}</p>
            </div>
          </div>
          <button type="button" onClick={() => copyToClipboard(TEST_PASSWORD, "password")}
            className="text-muted-foreground hover:text-foreground transition-colors p-1">
            {copiedPassword ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}