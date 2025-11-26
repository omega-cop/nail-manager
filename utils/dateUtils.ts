
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    const val = parseFloat((amount / 1000000).toFixed(1));
    return `${val}M`;
  }
  if (amount >= 1000) {
     const val = parseFloat((amount / 1000).toFixed(1));
     return `${val}k`;
  }
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export const getTodayDateString = (): string => {
  const now = new Date();
  // Adjust for timezone offset to get correct local date string
  const offset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - offset);
  return localDate.toISOString().split('T')[0];
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatSpecificDateTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

export const isToday = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export const isWithinThisWeek = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday
    // Calculate Monday of this week
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); 
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    return date >= startOfWeek;
};

export const isWithinThisMonth = (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const getBillDateCategory = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    const billDate = new Date(date);
    billDate.setHours(0,0,0,0);

    const diffTime = today.getTime() - billDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Hôm Nay';
    }
    if (diffDays === 1) {
        return 'Hôm Qua';
    }
    
    // Check if within this week
    if (isWithinThisWeek(dateString)) {
        return 'Tuần Này';
    }
    
    // Check if within this month
    if (isWithinThisMonth(dateString)) {
        return 'Tháng Này';
    }

    return `Tháng ${billDate.getMonth() + 1}/${billDate.getFullYear()}`;
};
