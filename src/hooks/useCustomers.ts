"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomerService } from "@/services/customerService";
import { useAuth } from "@/hooks/useAuth";
import { getDepartmentFilter } from "@/helper/authHelper";
import type {
  CustomersListParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ChangeCustomerStatusRequest,
  ChangeCustomerOwnerRequest,
  CreateContactRequest,
  UpdateContactRequest,
} from "@/models/customerModel";

const customerService = new CustomerService();

export function useCustomers(params: CustomersListParams = {}) {
  const { user } = useAuth();

  const departmentFilter = user ? getDepartmentFilter(user) : {};
  const scopedParams: CustomersListParams = {
    ...params,
    departmentId:
      params.departmentId ??
      (departmentFilter.includeAllDepartments ? undefined : departmentFilter.departmentId),
  };

  return useQuery({
    queryKey: ["customers", scopedParams],
    queryFn: () => customerService.getCustomers(scopedParams),
    enabled: !!user,
  });
}

export function useCustomerSearch(query: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["customers", "search", query],
    queryFn: () => customerService.searchCustomers(query),
    enabled: !!user && query.length > 1,
  });
}

export function useCustomer360(id: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["customers", "360", id],
    queryFn: () => customerService.getCustomer360(id),
    enabled: !!user && !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerRequest) => customerService.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerRequest }) =>
      customerService.updateCustomer(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.id] });
    },
  });
}

export function useChangeCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeCustomerStatusRequest }) =>
      customerService.changeStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.id] });
    },
  });
}

export function useChangeCustomerOwner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeCustomerOwnerRequest }) =>
      customerService.changeOwner(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useRestoreCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.restoreCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Contacts hooks
export function useAddContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ custId, payload }: { custId: string; payload: CreateContactRequest }) =>
      customerService.addContact(custId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.custId] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ custId, contactId, payload }: { custId: string; contactId: string; payload: UpdateContactRequest }) =>
      customerService.updateContact(custId, contactId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.custId] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ custId, contactId }: { custId: string; contactId: string }) =>
      customerService.deleteContact(custId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.custId] });
    },
  });
}

export function useSetPrimaryContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ custId, contactId }: { custId: string; contactId: string }) =>
      customerService.setPrimaryContact(custId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customers", "360", variables.custId] });
    },
  });
}
