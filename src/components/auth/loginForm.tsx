"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

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

export function LoginForm() {
  const router = useRouter();
  const { toast, dismiss } = useToast(); // 👈 thêm dismiss
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    // 👇 hiện toast ngay khi bắt đầu gọi API
    const { id: wakingToastId } = toast({
      title: "⏳ Server đang được kích hoạt",
      description: "Vui lòng chờ một chút nhé...",
      duration: Infinity,
    });

    try {
      const loginResponse = await AuthService.login({
        email: data.email,
        password: data.password,
      });

      const { accessToken, user, firebaseToken } = loginResponse;

      if (!accessToken) throw new Error("Token not received from server");
      if (!user || !user.displayName) throw new Error("User data incomplete");

      await login(user, accessToken, firebaseToken);

      dismiss(wakingToastId); // 👈 tắt toast server waking

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${user.displayName}!`,
      });

      router.push("/dashboard");
    } catch (error) {
      dismiss(wakingToastId); // 👈 tắt toast server waking khi lỗi

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="test@company.com"  
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
          placeholder="Test@123456" 
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
  );
}