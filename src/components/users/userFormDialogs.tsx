"use client";

import { useEffect, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/helper/toastHelper";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { extractErrorMessage } from "@/lib/api/client";
import { departmentService, teamService } from "@/services";
import { UserRole, type CreateUserRequest, type UpdateUserRequest, type User } from "@/models";

const createUserSchema = z
  .object({
    email: z.string().email("Email khong hop le"),
    displayName: z.string().min(2, "Ten hien thi phai co it nhat 2 ky tu"),
    role: z.number().min(1).max(4),
    departmentId: z.string().optional(),
    teamId: z.string().optional(),
    password: z.string().min(8, "Mat khau phai co it nhat 8 ky tu"),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, "So dien thoai khong hop le (10-11 so)")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => !(data.role === 3 && !data.departmentId),
    {
      message: "User (Role 3) phai duoc gan vao mot phong ban",
      path: ["departmentId"],
    }
  );

const updateUserSchema = z
  .object({
    displayName:  z.string().min(2, "Ten hien thi phai co it nhat 2 ky tu"),
    role:         z.number().min(1).max(4),
    departmentId: z.string().optional(),
    teamId:       z.string().optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, "So dien thoai khong hop le (10-11 so)")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => !(data.role === 3 && !data.departmentId),
    {
      message: "User (Role 3) phai duoc gan vao mot phong ban",
      path: ["departmentId"],
    }
  );

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserDialogProps extends DialogProps {
  user: User | null;
}

export function CreateUserDialog({ open, onOpenChange }: DialogProps) {
  const { toast } = useToast();
  const createUser = useCreateUser();
  const queryClient = useQueryClient();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", selectedDepartmentId],
    queryFn: () => teamService.getByDepartment(selectedDepartmentId),
    enabled: !!selectedDepartmentId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 3 },
  });

  const currentRole = watch("role");
  const currentDepartmentId = watch("departmentId");

  const handleDepartmentChange = (value: string) => {
    setValue("departmentId", value);
    setSelectedDepartmentId(value);
    setValue("teamId", "");
  };

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      const result = await createUser.mutateAsync({
        ...data,
        phone: data.phone || undefined,
      } as CreateUserRequest);

      toast({ title: "Thanh cong", description: "Tai khoan da duoc tao thanh cong." });

      if (result?.id) {
        queryClient.invalidateQueries({ queryKey: ["users", result.id] });
      }

      reset();
      setSelectedDepartmentId("");
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: extractErrorMessage(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tao tai khoan moi</DialogTitle>
          <DialogDescription>Nhap thong tin de tao tai khoan nguoi dung moi.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="user@company.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Ho va ten *</Label>
            <Input id="displayName" placeholder="Nguyen Van A" {...register("displayName")} />
            {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Vai tro *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    setValue("departmentId", "");
                    setValue("teamId", "");
                    setSelectedDepartmentId("");
                  }}
                >
                  <SelectTrigger id="role"><SelectValue placeholder="Chon vai tro" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Admin</SelectItem>
                    <SelectItem value="3">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {currentRole === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="departmentId">Phong ban *</Label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={handleDepartmentChange}>
                      <SelectTrigger id="departmentId"><SelectValue placeholder="Chon phong ban" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.departmentId && <p className="text-sm text-destructive">{errors.departmentId.message}</p>}
              </div>

              {currentDepartmentId && (
                <div className="space-y-2">
                  <Label htmlFor="teamId">Team (tuy chon)</Label>
                  <Controller
                    name="teamId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger id="teamId"><SelectValue placeholder="Chon team" /></SelectTrigger>
                        <SelectContent>
                          {teams.length > 0 ? (
                            teams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">Khong co team trong phong ban nay</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Mat khau tam thoi *</Label>
            <Input id="password" type="password" placeholder="********" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">So dien thoai</Label>
            <Input id="phone" type="tel" placeholder="0901234567" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Huy</Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tao tai khoan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditUserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const { toast } = useToast();
  const updateUser = useUpdateUser();
  const queryClient = useQueryClient();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getAll(),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams", selectedDepartmentId],
    queryFn: () => teamService.getByDepartment(selectedDepartmentId),
    enabled: !!selectedDepartmentId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const currentRole = watch("role");
  const currentDepartmentId = watch("departmentId");

  // Populate form khi mở dialog
  useEffect(() => {
    if (!user) return;
    setValue("displayName", user.displayName);
    setValue("role", user.role);
    setValue("phone", user.phone || "");
    setValue("departmentId", user.departmentId || "");
    setValue("teamId", user.teamId || "");
    if (user.departmentId) setSelectedDepartmentId(user.departmentId);
  }, [user, setValue]);

  const handleDepartmentChange = (value: string) => {
    setValue("departmentId", value);
    setSelectedDepartmentId(value);
    setValue("teamId", ""); // reset team khi đổi phòng ban
  };

  const onSubmit = async (data: UpdateUserFormData) => {
    if (!user) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        payload: {
          displayName:  data.displayName,
          role:         data.role,
          phone:        data.phone || undefined,
          departmentId: data.departmentId || undefined,
          teamId:       data.teamId || undefined,
        } as UpdateUserRequest,
      });

      toast({ title: "Thanh cong", description: "Thong tin nguoi dung da duoc cap nhat." });
      queryClient.invalidateQueries({ queryKey: ["users", user.id] });
      reset();
      setSelectedDepartmentId("");
      onOpenChange(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Lỗi", description: extractErrorMessage(error) });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
          <DialogDescription>Cập nhật thông tin cho {user.email}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email — readonly */}
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
          </div>

          {/* Họ và tên */}
          <div className="space-y-2">
            <Label htmlFor="edit-displayName">Họ và tên *</Label>
            <Input id="edit-displayName" placeholder="Nguyen Van A" {...register("displayName")} />
            {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
          </div>

          {/* Vai trò */}
          <div className="space-y-2">
            <Label htmlFor="edit-role">Vai trò *</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(value) => {
                    field.onChange(Number(value));
                    if (Number(value) !== UserRole.User) {
                      setValue("departmentId", "");
                      setValue("teamId", "");
                      setSelectedDepartmentId("");
                    }
                  }}
                >
                  <SelectTrigger id="edit-role"><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Admin</SelectItem>
                    <SelectItem value="3">User</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          {/* Phòng ban */}
          <div className="space-y-2">
            <Label htmlFor="edit-departmentId">
              Phòng ban {currentRole === UserRole.User && <span className="text-destructive">*</span>}
            </Label>
            <Controller
              name="departmentId"
              control={control}
              render={({ field }) => (
                <Select value={field.value || ""} onValueChange={handleDepartmentChange}>
                  <SelectTrigger id="edit-departmentId"><SelectValue placeholder="Chọn phòng ban" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.departmentId && <p className="text-sm text-destructive">{errors.departmentId.message}</p>}
          </div>

          {/* Team — chỉ hiện khi đã chọn phòng ban */}
          {currentDepartmentId && (
            <div className="space-y-2">
              <Label htmlFor="edit-teamId">Team (tùy chọn)</Label>
              <Controller
                name="teamId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-teamId"><SelectValue placeholder="Chọn team" /></SelectTrigger>
                    <SelectContent>
                      {teams.length > 0 ? (
                        teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">không có team trong phòng ban này</div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Số điện thoại */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Số điện thoại</Label>
            <Input id="edit-phone" type="tel" placeholder="0901234567" {...register("phone")} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); setSelectedDepartmentId(""); onOpenChange(false); }}>
              Hủy
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 