
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Bill } from '../types';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, MagnifyingGlassIcon } from './icons';
import { formatCurrency, formatDateTime, getBillDateCategory } from '../utils/dateUtils';
import BillViewModal from './BillViewModal';
import { useShopSettings } from '../hooks/useShopSettings';

interface BillListProps {
  bills: Bill[];
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  shopName: string;
  initialDate?: string | null;
  onClearTargetDate?: () => void;
}

const PAGE_SIZE = 20;

const BillSkeleton = () => (
    <div className="bg-surface p-5 rounded-lg shadow-sm border border-transparent animate-pulse">
        <div className="flex justify-between items-start">
            <div className="space-y-3 w-1/2">
                <div className="h-5 bg-secondary rounded w-3/4"></div>
                <div className="h-4 bg-secondary rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-secondary rounded w-1/4"></div>
        </div>
        <div className="mt-4 pt-4 flex justify-end space-x-2">
            <div className="h-9 w-9 bg-secondary rounded-full"></div>
            <div className="h-9 w-9 bg-secondary rounded-full"></div>
            <div className="h-9 w-9 bg-secondary rounded-full"></div>
        </div>
    </div>
);

const BillList: React.FC<BillListProps> = ({ bills, onEdit, onDelete, onAddNew, shopName, initialDate, onClearTargetDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  
  // Lazy Load States
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Get theme from hook
  const { billTheme } = useShopSettings();

  useEffect(() => {
    if (initialDate) {
      setFilterDate(initialDate);
    }
  }, [initialDate]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, filterDate, bills]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    if (onClearTargetDate && e.target.value === '') {
        onClearTargetDate();
    }
  };

  // 1. Filter and Sort ALL bills
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchName = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDate = filterDate ? bill.date.startsWith(filterDate) : true;
      return matchName && matchDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bills, searchTerm, filterDate]);

  // 2. Slice bills for display
  const visibleBills = useMemo(() => {
    return filteredBills.slice(0, visibleCount);
  }, [filteredBills, visibleCount]);

  // 3. Group the visible bills
  const groupedBills = useMemo(() => {
    return visibleBills.reduce((acc, bill) => {
        const category = getBillDateCategory(bill.date);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(bill);
        return acc;
    }, {} as Record<string, Bill[]>);
  }, [visibleBills]);

  const categories = Object.keys(groupedBills);
  const hasMore = visibleCount < filteredBills.length;

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate network delay for smoother UX (like Facebook)
          setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setIsLoadingMore(false);
          }, 800); 
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the target is visible
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore]);

  return (
    <div className="space-y-6 pb-[40px]">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Danh Sách Hóa Đơn</h2>
          <p className="text-text-light mt-1">Tìm kiếm và quản lý tất cả hóa đơn của bạn.</p>
        </div>
        <button
            onClick={onAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-sm hover:bg-primary-hover transition-colors font-semibold"
            >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Thêm Mới</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative group flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-text-light group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl outline-none text-text-main placeholder:text-text-light bg-surface shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
            />
        </div>
        
        {/* Date Filter */}
        <div className="sm:w-48">
             <input
                type={filterDate ? "date" : "text"}
                value={filterDate}
                onChange={handleDateChange}
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => {
                    if (!e.target.value) {
                        e.target.type = 'text';
                    }
                }}
                className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none text-text-main bg-surface shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 [color-scheme:light] placeholder:text-text-light"
                placeholder="Chọn ngày"
            />
        </div>
      </div>


      {filteredBills.length > 0 ? (
        <div className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <div className="relative flex justify-center mb-4">
                <span className="bg-secondary/50 px-3 py-1 rounded-full text-xs font-semibold text-text-light">{category}</span>
              </div>
              <div className="space-y-4">
                {groupedBills[category].map(bill => (
                  <div key={bill.id} className="bg-surface p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-text-main">{bill.customerName}</h3>
                        <p className="text-sm text-text-light">{formatDateTime(bill.date)}</p>
                      </div>
                      <p className="text-lg font-bold text-primary">{formatCurrency(bill.total)}</p>
                    </div>
                    <div className="mt-4 pt-4 flex justify-end space-x-2">
                      <button onClick={() => setViewingBill(bill)} className="p-2 text-text-light hover:text-primary transition-colors rounded-full hover:bg-secondary">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onEdit(bill)} className="p-2 text-text-light hover:text-primary transition-colors rounded-full hover:bg-secondary">
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => onDelete(bill.id)} className="p-2 text-text-light hover:text-red-500 transition-colors rounded-full hover:bg-secondary">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* Skeleton Loader / Observer Target */}
          <div ref={observerTarget} className="py-4 space-y-4">
             {isLoadingMore && (
                <>
                    <BillSkeleton />
                    <BillSkeleton />
                    <BillSkeleton />
                </>
             )}
          </div>

          {!hasMore && filteredBills.length > PAGE_SIZE && (
              <p className="text-center text-text-light text-sm italic">Đã hiển thị hết danh sách hóa đơn.</p>
          )}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-surface rounded-lg shadow-sm">
          <p className="text-text-light">Không tìm thấy hóa đơn nào.</p>
          <p className="text-sm text-gray-400 mt-2">
             {searchTerm || filterDate ? 'Thử điều chỉnh bộ lọc tìm kiếm của bạn.' : "Nhấp vào nút 'Thêm Mới' để tạo hóa đơn đầu tiên của bạn!"}
          </p>
        </div>
      )}

      {viewingBill && (
        <BillViewModal bill={viewingBill} onClose={() => setViewingBill(null)} shopName={shopName} billTheme={billTheme} />
      )}
    </div>
  );
};

export default BillList;
