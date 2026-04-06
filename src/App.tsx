/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductManagement } from './components/ProductManagement';
import { CustomerManagement } from './components/CustomerManagement';
import { CategoryManagement } from './components/CategoryManagement';
import { InvoiceManagement } from './components/InvoiceManagement';
import { Toaster } from '@/components/ui/sonner';
import { Package, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { storage } from './lib/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Initialize some dummy data if empty
  useEffect(() => {
    const categories = storage.getCategories();
    if (categories.length === 0) {
      const c1 = storage.addCategory({ name: 'Điện thoại', description: 'Các loại điện thoại thông minh' });
      const c2 = storage.addCategory({ name: 'Máy tính bảng', description: 'Các loại máy tính bảng' });
      const c3 = storage.addCategory({ name: 'Phụ kiện', description: 'Tai nghe, sạc, cáp...' });

      storage.addProduct({ name: 'iPhone 15 Pro Max', categoryId: c1.id, price: 32000000, stock: 15, unit: 'Cái', description: 'Màu Titan tự nhiên' });
      storage.addProduct({ name: 'Samsung S24 Ultra', categoryId: c1.id, price: 28000000, stock: 10, unit: 'Cái', description: 'Màu Xám Titan' });
      storage.addProduct({ name: 'iPad Pro M2', categoryId: c2.id, price: 22000000, stock: 5, unit: 'Cái', description: 'Màn hình Liquid Retina' });
      storage.addProduct({ name: 'AirPods Pro 2', categoryId: c3.id, price: 5500000, stock: 20, unit: 'Cái', description: 'Chống ồn chủ động' });

      storage.addCustomer({ name: 'Nguyễn Văn An', phone: '0912345678', email: 'an.nv@gmail.com', address: '123 Lê Lợi, Quận 1, TP.HCM' });
      storage.addCustomer({ name: 'Trần Thị Bình', phone: '0987654321', email: 'binh.tt@yahoo.com', address: '456 Nguyễn Huệ, Quận 1, TP.HCM' });
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
    } else {
      alert('Sai tài khoản hoặc mật khẩu! (Gợi ý: admin/admin)');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
                <Package className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">ShopMaster</CardTitle>
            <CardDescription className="text-gray-500">
              Hệ thống quản lý bán hàng chuyên nghiệp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="text" 
                  placeholder="Tên đăng nhập" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Mật khẩu" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 focus:ring-blue-500"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg transition-all">
                <LogIn className="w-5 h-5 mr-2" />
                Đăng nhập
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-400 italic">
              Tài khoản mặc định: <span className="font-bold text-gray-600">admin / admin</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'customers' && <CustomerManagement />}
          {activeTab === 'categories' && <CategoryManagement />}
          {activeTab === 'invoices' && <InvoiceManagement />}
        </div>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
