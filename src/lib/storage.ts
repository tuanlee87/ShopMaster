/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Product, Customer, Invoice } from '../types';

const STORAGE_KEYS = {
  CATEGORIES: 'shop_categories',
  PRODUCTS: 'shop_products',
  CUSTOMERS: 'shop_customers',
  INVOICES: 'shop_invoices',
};

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storage = {
  // Categories
  getCategories: (): Category[] => getFromStorage(STORAGE_KEYS.CATEGORIES, []),
  saveCategories: (categories: Category[]) => saveToStorage(STORAGE_KEYS.CATEGORIES, categories),
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => {
    const categories = storage.getCategories();
    const newCategory = { ...category, id: crypto.randomUUID(), createdAt: Date.now() };
    storage.saveCategories([...categories, newCategory]);
    return newCategory;
  },
  updateCategory: (id: string, category: Partial<Category>) => {
    const categories = storage.getCategories();
    const updated = categories.map(c => c.id === id ? { ...c, ...category } : c);
    storage.saveCategories(updated);
  },
  deleteCategory: (id: string) => {
    const categories = storage.getCategories();
    storage.saveCategories(categories.filter(c => c.id !== id));
  },

  // Products
  getProducts: (): Product[] => getFromStorage(STORAGE_KEYS.PRODUCTS, []),
  saveProducts: (products: Product[]) => saveToStorage(STORAGE_KEYS.PRODUCTS, products),
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => {
    const products = storage.getProducts();
    const newProduct = { ...product, id: crypto.randomUUID(), createdAt: Date.now() };
    storage.saveProducts([...products, newProduct]);
    return newProduct;
  },
  updateProduct: (id: string, product: Partial<Product>) => {
    const products = storage.getProducts();
    const updated = products.map(p => p.id === id ? { ...p, ...product } : p);
    storage.saveProducts(updated);
  },
  deleteProduct: (id: string) => {
    const products = storage.getProducts();
    storage.saveProducts(products.filter(p => p.id !== id));
  },

  // Customers
  getCustomers: (): Customer[] => getFromStorage(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomers: (customers: Customer[]) => saveToStorage(STORAGE_KEYS.CUSTOMERS, customers),
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const customers = storage.getCustomers();
    const newCustomer = { ...customer, id: crypto.randomUUID(), createdAt: Date.now() };
    storage.saveCustomers([...customers, newCustomer]);
    return newCustomer;
  },
  updateCustomer: (id: string, customer: Partial<Customer>) => {
    const customers = storage.getCustomers();
    const updated = customers.map(c => c.id === id ? { ...c, ...customer } : c);
    storage.saveCustomers(updated);
  },
  deleteCustomer: (id: string) => {
    const customers = storage.getCustomers();
    storage.saveCustomers(customers.filter(c => c.id !== id));
  },

  // Invoices
  getInvoices: (): Invoice[] => getFromStorage(STORAGE_KEYS.INVOICES, []),
  saveInvoices: (invoices: Invoice[]) => saveToStorage(STORAGE_KEYS.INVOICES, invoices),
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'invoiceNumber'>) => {
    const invoices = storage.getInvoices();
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const newInvoice = { ...invoice, id: crypto.randomUUID(), invoiceNumber, createdAt: Date.now() };
    storage.saveInvoices([...invoices, newInvoice]);
    return newInvoice;
  },
  updateInvoiceStatus: (id: string, status: Invoice['status']) => {
    const invoices = storage.getInvoices();
    const updated = invoices.map(i => i.id === id ? { ...i, status } : i);
    storage.saveInvoices(updated);
  },
  deleteInvoice: (id: string) => {
    const invoices = storage.getInvoices();
    storage.saveInvoices(invoices.filter(i => i.id !== id));
  },
};
