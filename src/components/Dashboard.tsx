/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, FileText, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { storage } from '@/lib/storage';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function Dashboard() {
  const products = storage.getProducts();
  const customers = storage.getCustomers();
  const invoices = storage.getInvoices();

  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.totalAmount : 0), 0);
    const totalOrders = invoices.length;
    const totalProducts = products.length;
    const totalCustomers = customers.length;

    return [
      { label: 'Doanh thu', value: `${totalRevenue.toLocaleString()}đ`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Hóa đơn', value: totalOrders, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Sản phẩm', value: totalProducts, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Khách hàng', value: totalCustomers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];
  }, [products, customers, invoices]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return format(date, 'dd/MM');
    });

    return last7Days.map(date => {
      const dayInvoices = invoices.filter(inv => format(new Date(inv.createdAt), 'dd/MM') === date);
      const revenue = dayInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.totalAmount : 0), 0);
      const orders = dayInvoices.length;
      return { date, revenue, orders };
    });
  }, [invoices]);

  const handleBackup = () => {
    const data = {
      categories: storage.getCategories(),
      products: storage.getProducts(),
      customers: storage.getCustomers(),
      invoices: storage.getInvoices(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopmaster_backup_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã tải xuống bản sao lưu dữ liệu');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.categories) storage.saveCategories(data.categories);
        if (data.products) storage.saveProducts(data.products);
        if (data.customers) storage.saveCustomers(data.customers);
        if (data.invoices) storage.saveInvoices(data.invoices);
        toast.success('Khôi phục dữ liệu thành công! Vui lòng tải lại trang.');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        toast.error('Tệp sao lưu không hợp lệ');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (confirm('Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác.')) {
      localStorage.clear();
      toast.success('Đã xóa toàn bộ dữ liệu. Đang tải lại...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Tổng quan</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border shadow-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Cập nhật lúc: {format(new Date(), 'HH:mm dd/MM/yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleBackup} className="bg-white">
              Sao lưu
            </Button>
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild className="bg-white">
                <span>Khôi phục</span>
              </Button>
              <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
            </label>
            <Button variant="ghost" size="sm" onClick={handleClearData} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              Xóa hết
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.label}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-400 mt-1">+12% so với tháng trước</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Doanh thu 7 ngày qua
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
              Số lượng đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Hóa đơn gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.slice(-5).reverse().map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-500">{invoice.customerName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{invoice.totalAmount.toLocaleString()}đ</p>
                  <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                    invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                    invoice.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {invoice.status === 'paid' ? 'Đã thanh toán' : invoice.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                  </p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-8 text-gray-500 italic">Chưa có hóa đơn nào</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
