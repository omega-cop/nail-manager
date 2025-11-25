
import React, { useMemo } from 'react';
import type { Bill } from '../types';
import { isToday, isWithinThisWeek, isWithinThisMonth, formatCurrency } from '../utils/dateUtils';
import { ChartBarIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface DashboardProps {
  bills: Bill[];
  onViewRevenueHistory: () => void;
}

interface SummaryCardProps {
    title: string;
    amount: number;
    description: string;
    isHighlighted?: boolean;
    chartData?: any[];
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, description, isHighlighted = false, chartData }) => (
    <div className={`p-4 sm:p-6 rounded-lg shadow-sm ${isHighlighted ? 'bg-text-main text-white' : 'bg-surface'}`}>
        <h3 className={`text-xs sm:text-sm font-medium ${isHighlighted ? 'text-gray-300' : 'text-text-light'}`}>{title}</h3>
        <p className={`text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 ${isHighlighted ? 'text-white' : 'text-text-main'}`}>{formatCurrency(amount)}</p>
        <p className={`text-[10px] sm:text-xs mt-1 ${isHighlighted ? 'text-gray-400' : 'text-text-light'}`}>{description}</p>
        {isHighlighted && chartData && (
             <div className="w-full h-12 sm:h-16 mt-3 sm:mt-4 -mb-2 -ml-2">
                <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34D399" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="revenue" stroke="#34D399" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ bills, onViewRevenueHistory }) => {
    
  const dailyRevenueData = useMemo(() => {
    const data: { [key: string]: number } = {};
    bills.forEach(bill => {
        if(isWithinThisWeek(bill.date)) {
            data[bill.date] = (data[bill.date] || 0) + bill.total;
        }
    });
    return Object.entries(data).map(([date, revenue]) => ({ date, revenue })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bills]);

  const revenueToday = useMemo(() => 
    bills.filter(bill => isToday(bill.date)).reduce((sum, bill) => sum + bill.total, 0),
    [bills]
  );

  const revenueThisWeek = useMemo(() => 
    bills.filter(bill => isWithinThisWeek(bill.date)).reduce((sum, bill) => sum + bill.total, 0),
    [bills]
  );
  
  const revenueThisMonth = useMemo(() => 
    bills.filter(bill => isWithinThisMonth(bill.date)).reduce((sum, bill) => sum + bill.total, 0),
    [bills]
  );

  const weeklyChartData = useMemo(() => {
    const today = new Date();
    const data = Array(7).fill(null).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        return {
            name: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
            date: d.toISOString().split('T')[0],
            revenue: 0
        };
    }).reverse();

    bills.forEach(bill => {
        const billDate = new Date(bill.date);
        const todayMinus7 = new Date();
        todayMinus7.setDate(today.getDate() - 6);
        todayMinus7.setHours(0,0,0,0);
        if (billDate >= todayMinus7) {
            const dayData = data.find(d => d.date === bill.date);
            if(dayData) {
                dayData.revenue += bill.total;
            }
        }
    });

    return data;
  }, [bills]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-main">Tổng Quan</h2>
        <p className="text-sm sm:text-base text-text-light mt-1">Đây là báo cáo nhanh về hoạt động kinh doanh của bạn.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCard title="Doanh Thu Hôm Nay" amount={revenueToday} description="Tổng doanh thu hôm nay" isHighlighted={true} chartData={dailyRevenueData} />
        <SummaryCard title="Doanh Thu Tuần Này" amount={revenueThisWeek} description="Tổng doanh thu tuần này"/>
        <SummaryCard title="Doanh Thu Tháng Này" amount={revenueThisMonth} description="Tổng doanh thu tháng này"/>
      </div>
      
      <div className="mt-6 sm:mt-8 bg-surface p-4 sm:p-6 rounded-lg shadow-sm">
        <h3 className="text-base sm:text-lg font-semibold text-text-main mb-4 flex items-center justify-between">
            <span>Doanh Thu 7 Ngày Qua</span>
            <button
              onClick={onViewRevenueHistory}
              className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Xem thêm
            </button>
        </h3>
        {bills.length > 0 ? (
          <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer>
                  <BarChart data={weeklyChartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`}/>
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), "Doanh thu"]} 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', fontSize: '12px' }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Bar dataKey="revenue" fill="#4F46E5" name="Doanh thu" radius={[4, 4, 0, 0]}/>
                  </BarChart>
              </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <p className="text-text-light">Không có dữ liệu doanh thu cho 7 ngày qua.</p>
             <p className="text-xs sm:text-sm text-gray-400 mt-2">Khi bạn tạo hóa đơn, biểu đồ sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
