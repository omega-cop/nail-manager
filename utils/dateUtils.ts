
export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    // Add timezone offset to prevent date from shifting
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(correctedDate);
};

export const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';
    
    // For old data that is just YYYY-MM-DD, format date only
    if (!dateString.includes('T')) {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const correctedDate = new Date(date.getTime() + userTimezoneOffset);

        const day = String(correctedDate.getDate()).padStart(2, '0');
        const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
        const year = String(correctedDate.getFullYear());
        return `${day}/${month}/${year}`;
    }

    const date = new Date(dateString);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const billDate = new Date(date);
    billDate.setHours(0, 0, 0, 0);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (billDate.getTime() === today.getTime()) {
        return `Hôm nay, ${timeString}`;
    }

    if (billDate.getTime() === yesterday.getTime()) {
        return `Hôm qua, ${timeString}`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}, ${timeString}`;
};

export const formatSpecificDateTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

export const getBillDateCategory = (dateString: string): string => {
    if (!dateString) return 'Không xác định';

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const billDate = new Date(date);
    billDate.setHours(0, 0, 0, 0);

    if (billDate.getTime() === today.getTime()) {
        return 'Hôm nay';
    }

    if (billDate.getTime() === yesterday.getTime()) {
        return 'Hôm qua';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).format(date);
};


export const isToday = (dateString: string): boolean => {
  const billDate = new Date(dateString);
  const today = new Date();
  
  return billDate.getDate() === today.getDate() &&
         billDate.getMonth() === today.getMonth() &&
         billDate.getFullYear() === today.getFullYear();
};

export const isWithinThisWeek = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayOfWeek = today.getDay();
  
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);
  
  return date >= firstDayOfWeek && date <= lastDayOfWeek;
};

export const isWithinThisMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
