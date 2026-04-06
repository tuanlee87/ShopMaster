/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Package, Users, Tags, FileText, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'categories', label: 'Danh mục', icon: Tags },
  { id: 'customers', label: 'Khách hàng', icon: Users },
  { id: 'invoices', label: 'Hóa đơn', icon: FileText },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col shadow-sm">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
          <Package className="w-8 h-8" />
          ShopMaster
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === item.id
                ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
          <Settings className="w-5 h-5" />
          Cài đặt
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all">
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
