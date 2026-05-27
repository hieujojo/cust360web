import { apiClient } from "@/lib/api/client";
import { CUSTOMER_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  Customer,
  CustomerSearchResponse,
  CustomersListResponse,
  CustomersListParams,
  Customer360Response,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  ChangeCustomerStatusRequest,
  ChangeCustomerOwnerRequest,
  CreateContactRequest,
  UpdateContactRequest,
  Contact,
} from "@/models/customerModel";

export class CustomerService {
  async getCustomers(params?: CustomersListParams): Promise<CustomersListResponse> {
    const response = await apiClient.get<CustomersListResponse>(
      CUSTOMER_ENDPOINTS.LIST,
      { params }
    );
    const items = response.data.items.map(item => ({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    }));
    // pagination là nested object, không cần transform
    return { ...response.data, items };
  }

  // Returns CustomerSearchResponse: { results, totalCount, query }
  async searchCustomers(query: string): Promise<CustomerSearchResponse> {
    const response = await apiClient.get<CustomerSearchResponse>(
      CUSTOMER_ENDPOINTS.SEARCH,
      { params: { query } }
    );
    return response.data;
  }

  async getCustomer360(id: string): Promise<Customer360Response> {
    const response = await apiClient.get<Customer360Response>(
      CUSTOMER_ENDPOINTS.DETAIL_360(id)
    );
    return response.data;
  }

  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>(
      CUSTOMER_ENDPOINTS.CREATE,
      data
    );
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<Customer>(
      CUSTOMER_ENDPOINTS.UPDATE(id),
      data
    );
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  async changeStatus(id: string, data: ChangeCustomerStatusRequest): Promise<void> {
    await apiClient.put(CUSTOMER_ENDPOINTS.UPDATE_STATUS(id), data);
  }

  async changeOwner(id: string, data: ChangeCustomerOwnerRequest): Promise<void> {
    await apiClient.put(CUSTOMER_ENDPOINTS.UPDATE_OWNER(id), data);
  }

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(CUSTOMER_ENDPOINTS.DELETE(id));
  }

  async restoreCustomer(id: string): Promise<void> {
    await apiClient.put(CUSTOMER_ENDPOINTS.RESTORE(id));
  }

  // ─── Contacts ──────────────────────────────────────────────────────────────
  // Contact model không có date fields nên không cần parse

  async addContact(custId: string, data: CreateContactRequest): Promise<Contact> {
    const response = await apiClient.post<Contact>(
      CUSTOMER_ENDPOINTS.ADD_CONTACT(custId),
      data
    );
    return response.data;
  }

  async updateContact(custId: string, contactId: string, data: UpdateContactRequest): Promise<Contact> {
    const response = await apiClient.put<Contact>(
      CUSTOMER_ENDPOINTS.UPDATE_CONTACT(custId, contactId),
      data
    );
    return response.data;
  }

  async deleteContact(custId: string, contactId: string): Promise<void> {
    await apiClient.delete(CUSTOMER_ENDPOINTS.DELETE_CONTACT(custId, contactId));
  }

  async setPrimaryContact(custId: string, contactId: string): Promise<void> {
    await apiClient.put(CUSTOMER_ENDPOINTS.SET_PRIMARY_CONTACT(custId, contactId));
  }
}