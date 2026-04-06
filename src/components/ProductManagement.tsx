/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search, Edit2, Trash2, MoreVertical, Filter, ArrowUpDown, ArrowUp, ArrowDown, FileUp, FileDown } from 'lucide-react';
import { utils, writeFile, read } from 'xlsx';
import { storage } from '@/lib/storage';
import { Product, Category } from '@/types';
import { toast } from 'sonner';

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<keyof Product | 'categoryName'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: 0,
    stock: 0,
    unit: 'Cái',
    description: '',
  });

  const handleExportExcel = () => {
    const exportData = products.map(p => ({
      'Tên sản phẩm': p.name,
      'Danh mục': categories.find(c => c.id === p.categoryId)?.name || 'N/A',
      'Giá bán': p.price,
      'Tồn kho': p.stock,
      'Đơn vị': p.unit,
      'Mô tả': p.description || ''
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Products');
    writeFile(wb, 'products_export.xlsx');
    toast.success('Xuất file Excel thành công');
  };

  const handleImportExcel = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = utils.sheet_to_json(sheet) as any[];

        let importedCount = 0;
        jsonData.forEach(row => {
          const categoryName = row['Danh mục'];
          let category = storage.getCategories().find(c => c.name.toLowerCase() === categoryName?.toString().toLowerCase());
          
          if (!category && categoryName) {
            category = storage.addCategory({ name: categoryName.toString(), description: 'Imported from Excel' });
          }

          if (row['Tên sản phẩm']) {
            storage.addProduct({
              name: row['Tên sản phẩm'].toString(),
              categoryId: category?.id || '',
              price: Number(row['Giá bán']) || 0,
              stock: Number(row['Tồn kho']) || 0,
              unit: row['Đơn vị']?.toString() || 'Cái',
              description: row['Mô tả']?.toString() || ''
            });
            importedCount++;
          }
        });

        if (importedCount > 0) {
          setProducts(storage.getProducts());
          setCategories(storage.getCategories());
          toast.success(`Đã nhập thành công ${importedCount} sản phẩm`);
        } else {
          toast.error('Không tìm thấy dữ liệu hợp lệ trong file');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Có lỗi xảy ra khi đọc file Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleSort = (field: keyof Product | 'categoryName') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      categories.find(c => c.id === p.categoryId)?.name.toLowerCase().includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'categoryName') {
        valA = categories.find(c => c.id === a.categoryId)?.name || '';
        valB = categories.find(c => c.id === b.categoryId)?.name || '';
      } else {
        valA = a[sortField as keyof Product];
        valB = b[sortField as keyof Product];
      }

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      }
    });
  }, [products, search, categories, sortField, sortOrder]);

  const handleAdd = () => {
    if (!formData.name || !formData.categoryId || formData.price <= 0) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const newProduct = storage.addProduct(formData);
    setProducts([...products, newProduct]);
    setIsAddOpen(false);
    setFormData({ name: '', categoryId: '', price: 0, stock: 0, unit: 'Cái', description: '' });
    toast.success('Thêm sản phẩm thành công');
  };

  const handleUpdate = () => {
    if (!editingProduct) return;
    storage.updateProduct(editingProduct.id, formData);
    setProducts(storage.getProducts());
    setEditingProduct(null);
    setFormData({ name: '', categoryId: '', price: 0, stock: 0, unit: 'Cái', description: '' });
    toast.success('Cập nhật sản phẩm thành công');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      storage.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Xóa sản phẩm thành công');
    }
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      description: product.description || '',
    });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý sản phẩm</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
            <FileDown className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImportExcel}
            />
            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <FileUp className="w-4 h-4 mr-2" />
              Nhập Excel
            </Button>
          </div>
          <Dialog open={isAddOpen || !!editingProduct} onOpenChange={(open) => {
            if (!open) {
              setIsAddOpen(false);
              setEditingProduct(null);
              setFormData({ name: '', categoryId: '', price: 0, stock: 0, unit: 'Cái', description: '' });
            }
          }}>
            <DialogTrigger render={<Button onClick={() => setIsAddOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md" nativeButton={false} />}>
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="VD: iPhone 15 Pro Max" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <Select value={formData.categoryId} onValueChange={val => setFormData({ ...formData, categoryId: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Đơn vị tính</Label>
                    <Input id="unit" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="Cái, Bộ, Kg..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Giá bán (VNĐ)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Tồn kho</Label>
                    <Input id="stock" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Mô tả ngắn về sản phẩm" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditingProduct(null); }}>Hủy</Button>
                <Button onClick={editingProduct ? handleUpdate : handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Tìm kiếm sản phẩm, danh mục..." 
                className="pl-10 bg-gray-50 border-none focus-visible:ring-blue-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                Lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">
                      Sản phẩm
                      {sortField === 'name' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('categoryName')}>
                    <div className="flex items-center gap-1">
                      Danh mục
                      {sortField === 'categoryName' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">
                      Giá bán
                      {sortField === 'price' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('stock')}>
                    <div className="flex items-center gap-1">
                      Tồn kho
                      {sortField === 'stock' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      ) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                  <TableHead className="font-bold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => (
                  <TableRow 
                    key={product.id} 
                    className={`
                      transition-colors duration-200
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                      hover:bg-blue-50/50
                    `}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">{product.price.toLocaleString()}đ</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className="font-medium">{product.stock} {product.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)} className="text-blue-600 hover:bg-blue-50">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-500 italic">
                      Không tìm thấy sản phẩm nào
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
