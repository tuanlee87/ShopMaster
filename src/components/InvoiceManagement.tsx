/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Search, Trash2, Printer, Eye, CheckCircle, XCircle, Clock, ShoppingCart } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Invoice, Customer, Product, InvoiceItem } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>(storage.getInvoices());
  const [customers] = useState<Customer[]>(storage.getCustomers());
  const [products] = useState<Product[]>(storage.getProducts());
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [newInvoice, setNewInvoice] = useState<{
    customerId: string;
    items: InvoiceItem[];
    status: Invoice['status'];
  }>({
    customerId: '',
    items: [],
    status: 'pending',
  });

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    i.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = newInvoice.items.find(item => item.productId === productId);
    if (existingItem) {
      setNewInvoice({
        ...newInvoice,
        items: newInvoice.items.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      });
    } else {
      setNewInvoice({
        ...newInvoice,
        items: [...newInvoice.items, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          total: product.price
        }]
      });
    }
  };

  const handleRemoveItem = (productId: string) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter(item => item.productId !== productId)
    });
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.customerId || newInvoice.items.length === 0) {
      toast.error('Vui lòng chọn khách hàng và thêm ít nhất 1 sản phẩm');
      return;
    }

    const customer = customers.find(c => c.id === newInvoice.customerId);
    if (!customer) return;

    const totalAmount = newInvoice.items.reduce((sum, item) => sum + item.total, 0);

    const invoice = storage.addInvoice({
      customerId: customer.id,
      customerName: customer.name,
      items: newInvoice.items,
      totalAmount,
      status: newInvoice.status,
    });

    setInvoices([...invoices, invoice]);
    setIsAddOpen(false);
    setNewInvoice({ customerId: '', items: [], status: 'pending' });
    toast.success('Tạo hóa đơn thành công');
  };

  const handleUpdateStatus = (id: string, status: Invoice['status']) => {
    storage.updateInvoiceStatus(id, status);
    setInvoices(storage.getInvoices());
    toast.success('Cập nhật trạng thái thành công');
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) {
      storage.deleteInvoice(id);
      setInvoices(invoices.filter(i => i.id !== id));
      toast.success('Xóa hóa đơn thành công');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý hóa đơn</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Tạo hóa đơn
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Tạo hóa đơn mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Khách hàng</Label>
                  <Select value={newInvoice.customerId} onValueChange={val => setNewInvoice({ ...newInvoice, customerId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khách hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select value={newInvoice.status} onValueChange={(val: any) => setNewInvoice({ ...newInvoice, status: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-500" />
                  Sản phẩm đã chọn
                </Label>
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Số lượng</TableHead>
                        <TableHead>Đơn giá</TableHead>
                        <TableHead>Thành tiền</TableHead>
                        <TableHead className="text-right">Xóa</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newInvoice.items.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              className="w-20" 
                              value={item.quantity} 
                              onChange={e => {
                                const qty = Math.max(1, Number(e.target.value));
                                setNewInvoice({
                                  ...newInvoice,
                                  items: newInvoice.items.map(i => 
                                    i.productId === item.productId 
                                      ? { ...i, quantity: qty, total: qty * i.price }
                                      : i
                                  )
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>{item.price.toLocaleString()}đ</TableCell>
                          <TableCell className="font-bold">{item.total.toLocaleString()}đ</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)} className="text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {newInvoice.items.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-400 italic">
                            Chưa có sản phẩm nào được chọn
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <div className="text-right space-y-1">
                    <p className="text-gray-500">Tổng cộng:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {newInvoice.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}đ
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thêm sản phẩm nhanh</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {products.map(p => (
                    <Button 
                      key={p.id} 
                      variant="outline" 
                      className="justify-start h-auto py-2 px-3 text-left"
                      onClick={() => handleAddItem(p.id)}
                    >
                      <div className="truncate">
                        <p className="font-semibold text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.price.toLocaleString()}đ</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
              <Button onClick={handleCreateInvoice} className="bg-blue-600 hover:bg-blue-700">Tạo hóa đơn</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="pb-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm mã hóa đơn, khách hàng..." 
              className="pl-10 bg-gray-50 border-none focus-visible:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-bold">Mã HĐ</TableHead>
                  <TableHead className="font-bold">Khách hàng</TableHead>
                  <TableHead className="font-bold">Ngày tạo</TableHead>
                  <TableHead className="font-bold">Tổng tiền</TableHead>
                  <TableHead className="font-bold">Trạng thái</TableHead>
                  <TableHead className="font-bold text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.slice().reverse().map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-bold text-blue-600">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{invoice.customerName}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{format(new Date(invoice.createdAt), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="font-bold">{invoice.totalAmount.toLocaleString()}đ</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.status === 'paid' ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                            <CheckCircle className="w-3 h-3" /> Đã thanh toán
                          </span>
                        ) : invoice.status === 'pending' ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                            <Clock className="w-3 h-3" /> Chờ xử lý
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <XCircle className="w-3 h-3" /> Đã hủy
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setViewingInvoice(invoice)} className="text-blue-600 hover:bg-blue-50">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500 italic">
                      Không tìm thấy hóa đơn nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Dialog */}
      <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span>Chi tiết hóa đơn</span>
              <span className="text-blue-600">{viewingInvoice?.invoiceNumber}</span>
            </DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-gray-500">Khách hàng:</p>
                  <p className="font-bold text-lg">{viewingInvoice.customerName}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-gray-500">Ngày tạo:</p>
                  <p className="font-bold">{format(new Date(viewingInvoice.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>SL</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingInvoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.price.toLocaleString()}đ</TableCell>
                        <TableCell className="text-right font-bold">{item.total.toLocaleString()}đ</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Trạng thái hiện tại:</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant={viewingInvoice.status === 'paid' ? 'default' : 'outline'}
                      className={viewingInvoice.status === 'paid' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      onClick={() => handleUpdateStatus(viewingInvoice.id, 'paid')}
                    >
                      Đã thanh toán
                    </Button>
                    <Button 
                      size="sm" 
                      variant={viewingInvoice.status === 'pending' ? 'default' : 'outline'}
                      className={viewingInvoice.status === 'pending' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      onClick={() => handleUpdateStatus(viewingInvoice.id, 'pending')}
                    >
                      Chờ xử lý
                    </Button>
                    <Button 
                      size="sm" 
                      variant={viewingInvoice.status === 'cancelled' ? 'default' : 'outline'}
                      className={viewingInvoice.status === 'cancelled' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={() => handleUpdateStatus(viewingInvoice.id, 'cancelled')}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Tổng cộng:</p>
                  <p className="text-3xl font-bold text-blue-600">{viewingInvoice.totalAmount.toLocaleString()}đ</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingInvoice(null)}>Đóng</Button>
            <Button className="bg-gray-800 hover:bg-gray-900">
              <Printer className="w-4 h-4 mr-2" />
              In hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
