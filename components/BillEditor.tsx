
import React, { useState, useEffect, useCallback } from 'react';
import type { Bill, ServiceItem, PredefinedService } from '../types';
import { TrashIcon } from './icons';
import { getTodayDateString, formatCurrency, getCurrentTimeString } from '../utils/dateUtils';

interface BillEditorProps {
  bill: Bill | null;
  onSave: (bill: Bill) => void;
  onCancel: () => void;
  services: PredefinedService[];
  customerNames: string[];
}

const BillEditor: React.FC<BillEditorProps> = ({ bill, onSave, onCancel, services, customerNames }) => {
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [time, setTime] = useState(getCurrentTimeString());
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  
  // Discount states
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('amount');

  useEffect(() => {
    if (bill) {
      setCustomerName(bill.customerName);
      const billDate = new Date(bill.date);
      setDate(billDate.toISOString().split('T')[0]);
      const hours = String(billDate.getHours()).padStart(2, '0');
      const minutes = String(billDate.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
      
      const enrichedItems = bill.items.map(item => ({
        ...item,
        quantity: item.quantity || 1
      }));
      setItems(enrichedItems);

      // Load discount info
      setDiscountValue(bill.discountValue || 0);
      setDiscountType(bill.discountType || 'amount');
    } else {
      setCustomerName('');
      setDate(getTodayDateString());
      setTime(getCurrentTimeString());
      setItems([{ id: `temp-${Date.now()}`, serviceId: '', name: '', price: 0, quantity: 1 }]);
      setDiscountValue(0);
      setDiscountType('amount');
    }
  }, [bill]);

  const updateSuggestions = (value: string) => {
    if (value) {
        const filteredSuggestions = customerNames.filter(name =>
            name.toLowerCase().includes(value.toLowerCase()) && name.toLowerCase() !== value.toLowerCase()
        );
        setSuggestions(filteredSuggestions);
        setIsSuggestionsVisible(filteredSuggestions.length > 0);
    } else {
        setSuggestions([]);
        setIsSuggestionsVisible(false);
    }
  };

  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerName(value);
    updateSuggestions(value);
  };

  const handleSuggestionClick = (name: string) => {
    setCustomerName(name);
    setSuggestions([]);
    setIsSuggestionsVisible(false);
  };

  const handleItemChange = (index: number, selectedServiceId: string) => {
    const service = services.find(s => s.id === selectedServiceId);
    if (!service) return;

    const newItems = [...items];
    const item = { ...newItems[index] };
    item.serviceId = service.id;
    item.name = service.name;
    item.quantity = 1; // Reset quantity on service change
    item.price = service.price; // Base price for quantity 1
    newItems[index] = item;
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const newItems = [...items];
    const item = { ...newItems[index] };
    const service = services.find(s => s.id === item.serviceId);
    
    if (service) {
        item.quantity = newQuantity;
        item.price = service.price * newQuantity;
        newItems[index] = item;
        setItems(newItems);
    }
  };

  const addItem = () => {
    setItems([...items, { id: `temp-${Date.now()}`, serviceId: '', name: '', price: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };
  
  const calculateSubtotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  const calculateDiscountAmount = useCallback(() => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percent') {
        return Math.round(subtotal * (discountValue / 100));
    }
    return discountValue;
  }, [calculateSubtotal, discountType, discountValue]);

  const calculateTotal = useCallback(() => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscountAmount();
    return Math.max(0, subtotal - discount);
  }, [calculateSubtotal, calculateDiscountAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalItems = items.filter(item => item.serviceId);

    if (!customerName.trim()) {
        alert("Vui lòng điền tên khách hàng.");
        return;
    }

    if (finalItems.length === 0) {
        alert("Vui lòng thêm ít nhất một dịch vụ hợp lệ vào hóa đơn.");
        return;
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    const finalDate = new Date(date);
    finalDate.setHours(hours, minutes, 0, 0);

    const finalTotal = calculateTotal();

    const newBill: Bill = {
      id: bill?.id || '',
      customerName: customerName.trim(),
      date: finalDate.toISOString(),
      items: finalItems,
      total: finalTotal,
      discountValue: discountValue,
      discountType: discountType
    };
    onSave(newBill);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsSuggestionsVisible(false);
    }, 150);
  };

  const inputBaseClasses = "w-full px-4 py-2 border rounded-lg transition-all duration-200 outline-none text-text-main placeholder:text-text-light bg-secondary focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-surface p-4 sm:p-8 rounded-lg shadow-sm space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-text-main">{bill ? 'Chỉnh Sửa Hóa Đơn' : 'Tạo Hóa Đơn Mới'}</h2>
      
      <div className="space-y-4">
        <div className="relative" onBlur={handleBlur}>
          <label htmlFor="customerName" className="block text-sm font-medium text-text-main mb-1">Tên Khách Hàng</label>
          <input
            id="customerName"
            type="text"
            value={customerName}
            onChange={handleCustomerNameChange}
            onFocus={() => updateSuggestions(customerName)}
            autoComplete="off"
            required
            className={`${inputBaseClasses} ${customerName ? 'border-border' : 'border-transparent hover:border-primary/40'}`}
            placeholder="ví dụ: Nguyễn Thị A"
          />
          {isSuggestionsVisible && suggestions.length > 0 && (
            <ul className="absolute z-20 w-full bg-surface border border-border rounded-b-lg shadow-lg max-h-48 overflow-y-auto mt-1">
              {suggestions.map((name, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(name)}
                  className="px-4 py-2 hover:bg-secondary cursor-pointer"
                >
                  {name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-text-main mb-1">Ngày</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                max={getTodayDateString()}
                className={`${inputBaseClasses} ${date ? 'border-border' : 'border-transparent hover:border-primary/40'} [color-scheme:light]`}
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-text-main mb-1">Giờ</label>
               <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className={`${inputBaseClasses} ${time ? 'border-border' : 'border-transparent hover:border-primary/40'} [color-scheme:light]`}
              />
            </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-text-main border-b border-border pb-2">Dịch Vụ</h3>
        {items.map((item, index) => {
            const serviceDef = services.find(s => s.id === item.serviceId);
            const allowQuantity = serviceDef?.allowQuantity;

            return (
              <div key={item.id} className="bg-secondary/30 p-3 rounded-lg border border-secondary sm:border-none sm:bg-transparent sm:p-0">
                {/* Mobile Layout: Stacked */}
                <div className="flex flex-col gap-2 sm:hidden">
                    <select
                      value={item.serviceId}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-transparent bg-white text-text-main"
                    >
                      <option value="" disabled>-- Chọn dịch vụ --</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                    
                    <div className="flex items-center gap-2">
                        {allowQuantity && (
                            <div className="flex items-center w-20 shrink-0">
                                <span className="text-xs text-text-light mr-1">SL:</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity || 1}
                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                    className="w-full px-2 py-2 border border-border rounded-md bg-white text-center text-text-main focus:ring-1 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        )}
                        <input
                          type="text"
                          readOnly
                          value={formatCurrency(item.price)}
                          className="flex-grow px-3 py-2 border border-border rounded-md bg-secondary text-right text-text-main font-medium"
                        />
                        <button type="button" onClick={() => removeItem(index)} className="p-2 bg-white border border-border text-text-light hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Desktop Layout: Row */}
                <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                    <select
                      value={item.serviceId}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      required
                      className="flex-grow min-w-[150px] px-3 py-2 border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-transparent bg-white text-text-main"
                    >
                      <option value="" disabled>-- Chọn dịch vụ --</option>
                      {services.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                    
                    {allowQuantity && (
                        <div className="flex items-center">
                            <span className="text-xs text-text-light mr-1">SL:</span>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity || 1}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-2 border border-border rounded-md bg-white text-center text-text-main focus:ring-1 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    )}

                    <input
                      type="text"
                      readOnly
                      value={formatCurrency(item.price)}
                      className="w-28 px-3 py-2 border border-border rounded-md bg-secondary text-right text-text-main font-medium"
                    />
                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
            );
        })}
        <button type="button" onClick={addItem} className="w-full mt-2 px-4 py-3 sm:py-2 text-primary border-2 border-dashed border-primary/50 rounded-lg hover:bg-primary/5 transition-colors font-medium">
          + Thêm Dịch Vụ
        </button>
      </div>

      {/* Discount Section */}
      <div className="pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-2 mb-2">
            <label className="text-sm font-medium text-text-main">Giảm giá:</label>
            <div className="flex rounded-md shadow-sm w-full sm:w-auto">
                <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="flex-grow sm:flex-grow-0 w-full sm:w-24 px-3 py-2 sm:py-1 border border-border rounded-l-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-right bg-white text-text-main"
                />
                <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'amount')}
                    className="px-3 sm:px-2 py-2 sm:py-1 border-t border-b border-r border-border rounded-r-md bg-secondary focus:ring-1 focus:ring-primary outline-none text-sm"
                >
                    <option value="amount">VNĐ</option>
                    <option value="percent">%</option>
                </select>
            </div>
          </div>
          
          <div className="flex justify-end items-center gap-4 text-sm text-text-light">
             <span>Tạm tính: {formatCurrency(calculateSubtotal())}</span>
             {discountValue > 0 && (
                 <span className="text-red-500">
                     - {formatCurrency(calculateDiscountAmount())}
                 </span>
             )}
          </div>
          
          <div className="text-right text-xl sm:text-2xl font-bold text-text-main mt-2">
            Tổng cộng: {formatCurrency(calculateTotal())}
          </div>
      </div>

      <div className="flex justify-end space-x-3 sm:space-x-4 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-secondary text-text-main rounded-lg hover:bg-secondary/80 transition-colors font-semibold">Hủy</button>
        <button type="submit" className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm font-semibold">Lưu Hóa Đơn</button>
      </div>
    </form>
  );
};

export default BillEditor;
