"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  KeyRound,
  MoreHorizontal,
  Pencil,
  Search,
  UserCheck,
  UserX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdownMenu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/models";

interface UserTableProps {
  data: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  canManage?: boolean;
}

function getUserColumns({
  onEdit,
  onDelete,
  onResetPassword,
  canManage = true,
}: Omit<UserTableProps, "data">): ColumnDef<User>[] {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "employeeCode",
      header: "Ma NV",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("employeeCode")}</div>
      ),
    },
    {
      accessorKey: "displayName",
      header: "Ho va ten",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("displayName")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: "Chuc vu",
      cell: ({ row }) => <div className="text-sm">{row.getValue("jobTitle")}</div>,
    },
    {
      accessorKey: "role",
      header: "Vai tro",
      cell: ({ row }) => {
        const role = row.getValue("role") as number;
        const roleName = role === 1 ? "Owner" : role === 2 ? "Admin" : "User";
        const variant =
          role === 1 ? "default" : role === 2 ? "secondary" : "outline";

        return <Badge variant={variant}>{roleName}</Badge>;
      },
    },
    {
      accessorKey: "isActive",
      header: "Trang thai",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;

        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Hoat dong" : "Vo hieu hoa"}
          </Badge>
        );
      },
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: "Thao tac",
      cell: ({ row }) => {
        const user = row.original;
        const isActive = user.isActive;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label="Mo menu thao tac"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tac</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Chinh sua
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onResetPassword(user)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset mat khau
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className={isActive ? "text-destructive focus:text-destructive" : ""}
              >
                {isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Vo hieu hoa
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Kich hoat
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return columns;
}

export function UserTable({
  data,
  onEdit,
  onDelete,
  onResetPassword,
  canManage = true,
}: UserTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = getUserColumns({
    onEdit,
    onDelete,
    onResetPassword,
    canManage,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tim kiem nguoi dung..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-9"
          aria-label="Tim kiem nguoi dung"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {globalFilter
                    ? "Khong tim thay ket qua phu hop."
                    : "Khong co du lieu."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hien thi {table.getRowModel().rows.length} /{" "}
            {table.getFilteredRowModel().rows.length} nguoi dung
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trang truoc
            </Button>
            <span className="text-sm text-muted-foreground">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Trang sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
