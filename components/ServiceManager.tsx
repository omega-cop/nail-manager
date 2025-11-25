
import React, { useState } from 'react';
import type { PredefinedService } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './icons';
import { formatCurrency } from '../utils/dateUtils';

interface ServiceManagerProps {
  services: PredefinedService[];
  addService: (service: Omit<PredefinedService, 'id'>) => void;
  updateService: (service: PredefinedService) => void;
  deleteService: (id: string) => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ services, addService, updateService, deleteService }) => {
  const [editingService, setEditingService] = useState<PredefinedService | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [allowQuantity, setAllowQuantity] = useState(false);
  
  const sortedServices = [...services].sort((a, b) => a.name.localeCompare(b.name));

  const handleEdit = (service: PredefinedService) => {
    setEditingService(service);
    setIsCreating(false);
    setName(service.name);
    setPrice(service.price);
    setAllowQuantity(!!service.allowQuantity);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingService(null);
    setName('');
    setPrice(0);
    setAllowQuantity(false);
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsCreating(false);
    setName('');
    setPrice(0);
    setAllowQuantity(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || price <= 0) {
      alert('Vui lòng nhập tên và giá hợp lệ cho dịch vụ.');
      return;
    }

    if (editingService) {
      updateService({ ...editingService, name, price, allowQuantity });
    } else {
      addService({ name, price, allowQuantity });
    }
    handleCancel();
  };

  const isFormVisible = isCreating || editingService !== null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-text-main">Quản Lý Dịch Vụ</h2>
            <p className="text-text-light mt-1">Thêm, sửa đổi hoặc xóa các dịch vụ trong menu của bạn.</p>
        </div>
        {!isFormVisible && (
            <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-hover transition-colors font-semibold"
            >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Thêm Mới</span>
            </button>
        )}
      </div>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="p-6 bg-surface rounded-lg shadow-sm space-y-4 mb-6">
          <h3 className="text-lg font-semibold text-text-main">{editingService ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="serviceName" className="block text-sm font-medium text-text-main mb-1">Tên Dịch Vụ</label>
              <input
                id="serviceName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-transparent bg-secondary rounded-lg focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all text-text-main"
                placeholder="ví dụ: Sơn Gel"
              />
            </div>
            <div>
              <label htmlFor="servicePrice" className="block text-sm font-medium text-text-main mb-1">Giá Dịch Vụ</label>
              <input
                id="servicePrice"
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                required
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-transparent bg-secondary rounded-lg focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all text-text-main"
                placeholder="ví dụ: 100000"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 py-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={allowQuantity} 
                onChange={(e) => setAllowQuantity(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              <span className="ml-3 text-sm font-medium text-text-main">Cho phép nhập số lượng</span>
            </label>
            <span className="text-xs text-text-light">(Dùng cho các dịch vụ tính theo ngón, viên, cái...)</span>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={handleCancel} className="px-5 py-2 bg-secondary text-text-main rounded-lg hover:bg-secondary/80 font-semibold">Hủy</button>
            <button type="submit" className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-semibold">Lưu</button>
          </div>
        </form>
      )}

      {/* Mobile View: Card List */}
      <div className="md:hidden space-y-3">
        {sortedServices.map(service => (
            <div key={service.id} className="bg-surface p-4 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                    <p className="font-medium text-text-main">{service.name}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-primary">{formatCurrency(service.price)}</p>
                        {service.allowQuantity && <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">Đa số lượng</span>}
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => handleEdit(service)} className="p-2 text-text-light hover:text-primary transition-colors rounded-full hover:bg-secondary">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteService(service.id)} className="p-2 text-text-light hover:text-red-500 transition-colors rounded-full hover:bg-secondary">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block bg-surface rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary">
              <tr className="border-b border-secondary/20">
                <th className="p-4 font-semibold text-text-main text-sm">Tên Dịch Vụ</th>
                <th className="p-4 font-semibold text-text-main text-sm text-right">Giá</th>
                <th className="p-4 font-semibold text-text-main text-sm text-center">Tùy Chọn</th>
                <th className="p-4 font-semibold text-text-main text-sm text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
              {sortedServices.map(service => (
                <tr key={service.id} className="hover:bg-secondary/30">
                  <td className="p-4 text-text-main">{service.name}</td>
                  <td className="p-4 text-right font-medium text-text-main">{formatCurrency(service.price)}</td>
                  <td className="p-4 text-center">
                    {service.allowQuantity && <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">Đa số lượng</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center space-x-2">
                        <button onClick={() => handleEdit(service)} className="p-2 text-text-light hover:text-primary transition-colors rounded-full hover:bg-secondary">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteService(service.id)} className="p-2 text-text-light hover:text-red-500 transition-colors rounded-full hover:bg-secondary">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceManager;
