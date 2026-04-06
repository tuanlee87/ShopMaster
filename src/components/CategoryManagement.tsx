/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Category } from '@/types';
import { toast } from 'sonner';

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleAdd = () => {
    if (!formData.name) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    const newCategory = storage.addCategory(formData);
    setCategories([...categories, newCategory]);
    setIsAddOpen(false);
    setFormData({ name: '', description: '' });
    toast.success('Thêm danh mục thành công');
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    storage.updateCategory(editingCategory.id, formData);
    setCategories(storage.getCategories());
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    toast.success('Cập nhật danh mục thành công');
  };

  const handleDelete = (id: string) => {
    const products = storage.getProducts();
    const hasProducts = products.some(p => p.categoryId === id);
    if (hasProducts) {
      toast.error('Không thể xóa danh mục đang có sản phẩm');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      storage.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
      toast.success('Xóa danh mục thành công');
    }
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý danh mục</h2>
        <Dialog open={isAddOpen || !!editingCategory} onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingCategory(null);
            setFormData({ name: '', description: '' });
          }
        }}>
          <DialogTrigger render={<Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md" nativeButton={false} />}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm danh mục
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: Điện thoại, Máy tính bảng..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <Input id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả ngắn về danh mục" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditingCategory(null); }}>Hủy</Button>
              <Button onClick={editingCategory ? handleUpdate : handleAdd} className="bg-blue-600 hover:bg-blue-700">
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md">
        <CardContent className="pt-6">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold">Tên danh mục</TableHead>
                  <TableHead className="font-bold">Mô tả</TableHead>
                  <TableHead className="font-bold">Số sản phẩm</TableHead>
                  <TableHead className="font-bold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const productCount = storage.getProducts().filter(p => p.categoryId === category.id).length;
                  return (
                    <TableRow key={category.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <Tags className="w-5 h-5" />
                          </div>
                          <p className="font-semibold text-gray-900">{category.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 italic text-sm">{category.description || 'Không có mô tả'}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold">
                          {productCount} sản phẩm
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(category)} className="text-blue-600 hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} className="text-red-600 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-gray-500 italic">
                      Chưa có danh mục nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
