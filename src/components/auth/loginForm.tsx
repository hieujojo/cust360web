"use client";

import { useState, useRef, useEffect } from "react";
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

const TEST_EMAIL = "adminTest@crm360.vn";
const TEST_PASSWORD = "12345678";

const isServerSleepError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes("timeout") ||
      msg.includes("network") ||
      msg.includes("connect") ||
      msg.includes("fetch") ||
      msg.includes("abort") ||
      msg.includes("502") ||
      msg.includes("503") ||
      msg.includes("504")
    )
      return true;
    if (error.name === "AbortError") return true;
  }
  if (typeof error === "object" && error !== null) {
    const status = (error as { status?: number }).status;
    if (status && [502, 503, 504, 0].includes(status)) return true;
  }
  return false;
};

function WakingOverlay() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 15000;
    const interval = 100;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(prev + step, 95));
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        zIndex: 9999,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            color: "#fff",
            fontSize: 15,
            fontWeight: 500,
            margin: "0 0 6px",
          }}
        >
          Đang kích hoạt hệ thống...
        </p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
          Vui lòng không tắt trang, quá trình này mất 15–30 giây
        </p>
      </div>
      <div
        style={{
          width: 200,
          height: 4,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#fff",
            borderRadius: 99,
            transition: "width 0.1s linear",
          }}
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { toast, dismiss } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const toastIdRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ✅ Suppress Next.js error overlay cho lỗi Axios timeout
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      if (isServerSleepError(e.reason)) {
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  // ✅ Sau reload: tự điền + submit âm thầm
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pending_email");
    const pendingPassword = sessionStorage.getItem("pending_password");

    if (pendingEmail && pendingPassword) {
      setValue("email", pendingEmail);
      setValue("password", pendingPassword);
      setTimeout(() => handleSubmit(onSubmit)(), 500);
    }
  }, []);

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

  const clearAuthStorage = () => {
    clearApiHeaders();
    document.cookie = "accessToken=; path=/; max-age=0";
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    const isRetryAfterReload = !!sessionStorage.getItem("pending_email");
    if (!isRetryAfterReload) {
      const { id } = toast({
        title: "⏳ Server đang được kích hoạt",
        description: (
          <div className="space-y-1">
            <p>Vui lòng chờ một chút nhé...</p>
            <p className="text-xs text-muted-foreground">
              Hệ thống sẽ <strong>tự động đăng nhập lại</strong> — bạn không cần
              làm gì thêm!
            </p>
          </div>
        ),
        duration: Infinity,
      });
      toastIdRef.current = id;
    }
    try {
      const loginResponse = await AuthService.login({
        email: data.email,
        password: data.password,
      });

      const { accessToken, user, firebaseToken } = loginResponse;
      if (!accessToken) throw new Error("Token not received from server");
      if (!user || !user.displayName) throw new Error("User data incomplete");

      await login(user, accessToken, firebaseToken);

      sessionStorage.removeItem("pending_email");
      sessionStorage.removeItem("pending_password");
      if (toastIdRef.current) dismiss(toastIdRef.current);

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${user.displayName}!`,
      });

      router.push("/dashboard");
    } catch (error) {
      if (isServerSleepError(error)) {
        sessionStorage.setItem("pending_email", data.email);
        sessionStorage.setItem("pending_password", data.password);

        // ✅ Chỉ show overlay ngay trước khi reload
        setIsWaking(true);
        setTimeout(() => window.location.reload(), 15000);
        return;
      }

      // Lỗi thật
      if (toastIdRef.current) dismiss(toastIdRef.current);
      clearAuthStorage();

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
    <>
      {/* ✅ Overlay chỉ hiện khi chuẩn bị reload */}
      {isWaking && <WakingOverlay />}

      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@company.com"
              {...register("email")}
              disabled={isLoading || isWaking}
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
              disabled={isLoading || isWaking}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isWaking}
          >
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
                <p className="text-xs font-mono text-foreground">
                  {TEST_EMAIL}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(TEST_EMAIL, "email")}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {copiedEmail ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between bg-background border border-border rounded-lg px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Mật khẩu</p>
                <p className="text-xs font-mono text-foreground">
                  {TEST_PASSWORD}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(TEST_PASSWORD, "password")}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              {copiedPassword ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
