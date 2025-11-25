
import React, { useMemo, useState } from 'react';
import type { Bill } from '../types';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';
import { GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon } from './icons';
import CustomerHistoryModal from './CustomerHistoryModal';

interface VisitRecord {
    date: string;
    amount: number;
}

export interface CustomerStat {
    name: string;
    totalSpent: number;
    visitCount: number;
    lastVisitDate: string;
    visitHistory: VisitRecord[];
}

interface CustomerListProps {
    bills: Bill[];
}

const CustomerList: React.FC<CustomerListProps> = ({ bills }) => {
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerStat | null>(null);

    const customerStats = useMemo(() => {
        if (!bills || bills.length === 0) {
            return [];
        }

        const statsMap = new Map<string, { totalSpent: number; visits: VisitRecord[] }>();

        bills.forEach(bill => {
            const customerName = bill.customerName.trim();
            if (!customerName) return; 
            
            const existingStat = statsMap.get(customerName) || { totalSpent: 0, visits: [] };
            
            statsMap.set(customerName, {
                totalSpent: existingStat.totalSpent + bill.total,
                visits: [...existingStat.visits, { date: bill.date, amount: bill.total }],
            });
        });

        const statsArray: CustomerStat[] = Array.from(statsMap.entries()).map(([name, data]) => {
            const sortedVisits = data.visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return {
                name,
                totalSpent: data.totalSpent,
                visitCount: data.visits.length,
                lastVisitDate: sortedVisits[0]?.date || '',
                visitHistory: sortedVisits,
            };
        });

        statsArray.sort((a, b) => b.totalSpent - a.totalSpent);

        return statsArray;
    }, [bills]);
    
    const getRankColor = (rank: number) => {
        return 'bg-secondary text-text-light';
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h2 className="text-2xl font-bold text-text-main">Khách Hàng Thân Thiết</h2>
                <p className="text-text-light mt-1">Bảng xếp hạng khách hàng dựa trên tổng chi tiêu.</p>
            </div>

            {customerStats.length > 0 ? (
                <div className="space-y-4">
                    {customerStats.map((stat, index) => (
                        <button 
                            key={stat.name} 
                            onClick={() => setSelectedCustomer(stat)}
                            className="w-full text-left bg-surface p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center space-x-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                        >
                             <div className="w-10 h-10 flex items-center justify-center">
                                {index === 0 ? <GoldMedalIcon className="w-10 h-10" /> :
                                 index === 1 ? <SilverMedalIcon className="w-10 h-10" /> :
                                 index === 2 ? <BronzeMedalIcon className="w-10 h-10" /> :
                                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(index)}`}>
                                     {index + 1}
                                 </div>
                                }
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold text-text-main">{stat.name}</h3>
                                <p className="text-sm text-text-light">
                                    {stat.visitCount} lần ghé thăm
                                </p>
                                <p className="text-xs text-text-light mt-1">
                                    Ghé gần nhất: {formatDateTime(stat.lastVisitDate).split(',')[0]}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-primary">{formatCurrency(stat.totalSpent)}</p>
                                <p className="text-xs text-text-light">Tổng chi tiêu</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-surface rounded-lg shadow-sm">
                    <p className="text-text-light">Chưa có dữ liệu khách hàng.</p>
                    <p className="text-sm text-gray-400 mt-2">Dữ liệu sẽ được tổng hợp khi bạn tạo hóa đơn.</p>
                </div>
            )}
            {selectedCustomer && (
                <CustomerHistoryModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}
        </div>
    );
};

export default CustomerList;
