/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  createdAt: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: number;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: number;
}
