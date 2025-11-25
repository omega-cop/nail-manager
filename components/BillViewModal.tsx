import React, { useRef, useState } from 'react';
import type { Bill } from '../types';
import { formatCurrency, formatSpecificDateTime } from '../utils/dateUtils';
import html2canvas from 'html2canvas';
import { ArrowDownTrayIcon } from './icons';

interface BillViewModalProps {
  bill: Bill;
  onClose: () => void;
  shopName: string;
  billTheme?: string;
}

const BillViewModal: React.FC<BillViewModalProps> = ({ bill, onClose, shopName, billTheme = 'default' }) => {
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const subTotal = bill.items.reduce((sum, item) => sum + item.price, 0);
  const discountAmount = bill.total < subTotal ? subTotal - bill.total : 0;
  const hasDiscount = discountAmount > 0;

  // Theme Configuration
  const getThemeStyles = (theme: string) => {
    switch (theme) {
      case 'pink': // Dễ thương
        return {
          container: 'bg-white',
          header: 'bg-pink-50 border-b-2 border-pink-200',
          titleColor: 'text-pink-600',
          subTitleColor: 'text-pink-400',
          labelColor: 'text-pink-900',
          textColor: 'text-gray-900',
          tableHeader: 'bg-pink-100 text-pink-900 font-bold',
          tableRowBorder: 'border-pink-100',
          totalBg: 'bg-pink-50 text-pink-900',
          footerText: 'text-pink-400'
        };
      case 'blue': // Chuyên nghiệp
        return {
          container: 'bg-white',
          header: 'bg-slate-50 border-b-2 border-blue-200',
          titleColor: 'text-blue-700',
          subTitleColor: 'text-blue-500',
          labelColor: 'text-slate-700',
          textColor: 'text-slate-900',
          tableHeader: 'bg-slate-100 text-slate-700 font-bold uppercase tracking-wider',
          tableRowBorder: 'border-slate-100',
          totalBg: 'bg-blue-50 text-blue-900',
          footerText: 'text-slate-400'
        };
      case 'gold': // Sang trọng
        return {
          container: 'bg-stone-50',
          header: 'bg-stone-900 border-b-4 border-yellow-500',
          titleColor: 'text-yellow-500',
          subTitleColor: 'text-stone-400',
          labelColor: 'text-stone-800',
          textColor: 'text-stone-900',
          tableHeader: 'bg-stone-200 text-stone-800 font-serif font-bold',
          tableRowBorder: 'border-stone-200',
          totalBg: 'bg-stone-900 text-yellow-500',
          footerText: 'text-stone-500 italic font-serif'
        };
       case 'green': // Tươi mới
        return {
          container: 'bg-white',
          header: 'bg-emerald-50 border-b border-emerald-200',
          titleColor: 'text-emerald-700',
          subTitleColor: 'text-emerald-500',
          labelColor: 'text-emerald-900',
          textColor: 'text-gray-900',
          tableHeader: 'bg-emerald-100 text-emerald-800 font-semibold',
          tableRowBorder: 'border-emerald-100',
          totalBg: 'bg-emerald-50 text-emerald-900',
          footerText: 'text-emerald-500'
        };
      default: // Mặc định (Simple)
        return {
          container: 'bg-white',
          header: 'bg-white border-b border-gray-200',
          titleColor: 'text-gray-900',
          subTitleColor: 'text-gray-600',
          labelColor: 'text-gray-900',
          textColor: 'text-black',
          tableHeader: 'border-b border-gray-200 font-semibold text-gray-900',
          tableRowBorder: 'border-gray-100',
          totalBg: 'bg-gray-100 text-gray-900',
          footerText: 'text-gray-500'
        };
    }
  };

  const themeStyles = getThemeStyles(billTheme);

  const handlePrint = () => {
    const content = printableContentRef.current;
    if (content) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Hóa Đơn</title>');
        printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
         printWindow.document.write(`
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none; }
              /* Reset layout for printing to show full content without scrollbars */
              .print-reset-scroll { overflow: visible !important; height: auto !important; }
              .print-reset-height { height: auto !important; }
            }
            body { 
              font-family: 'Inter', sans-serif;
              color: #000000;
            }
          </style>
        `);
        printWindow.document.write('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        // Slight delay to ensure styles are loaded
        setTimeout(() => {
           printWindow.print();
           printWindow.close();
        }, 250);
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Hóa đơn cho ${bill.customerName}`,
      text: `Đây là hóa đơn cho ${bill.customerName} vào ngày ${formatSpecificDateTime(bill.date)} với tổng số tiền là ${formatCurrency(bill.total)}.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        alert('API Chia sẻ Web không được hỗ trợ trên trình duyệt của bạn.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownloadImage = async () => {
    if (printableContentRef.current) {
        setIsDownloading(true);
        try {
            // Clone the element to render it fully expanded (without scrollbars) off-screen
            const originalElement = printableContentRef.current;
            const clone = originalElement.cloneNode(true) as HTMLElement;
            
            // Force styles on clone to ensure full height and white background
            clone.style.position = 'absolute';
            clone.style.top = '-10000px';
            clone.style.left = '-10000px';
            clone.style.height = 'auto';
            clone.style.width = '800px'; // Standard width for image
            clone.style.maxHeight = 'none';
            clone.style.overflow = 'visible';
            // Ensure background color is captured from theme
            clone.classList.add(themeStyles.container);
            clone.style.zIndex = '-1000';
            
            // Reset scrollable container inside clone
            const scrollableContainer = clone.querySelector('.print-reset-scroll');
            if (scrollableContainer) {
                (scrollableContainer as HTMLElement).style.overflow = 'visible';
                (scrollableContainer as HTMLElement).style.height = 'auto';
            }

            document.body.appendChild(clone);

            const canvas = await html2canvas(clone, {
                scale: 2, // High resolution
                useCORS: true,
                windowWidth: 800,
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            const dateStr = new Date(bill.date).toISOString().split('T')[0];
            link.download = `HoaDon-${bill.customerName}-${dateStr}.png`;
            link.click();
            
            document.body.removeChild(clone);
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
            alert("Đã xảy ra lỗi khi tạo ảnh hóa đơn.");
        } finally {
            setIsDownloading(false);
        }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[85dvh] sm:max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Main Printable Area Wrapper - Now scrollable as a whole */}
        <div 
          ref={printableContentRef} 
          className={`flex-grow overflow-y-auto custom-scrollbar print-reset-scroll ${themeStyles.container}`} 
          style={{ color: 'black' }}
        >
            
            {/* Header Section */}
            <div className={`p-4 sm:p-6 pb-2 sm:pb-2 ${themeStyles.header}`}>
                <div className="text-center mb-4 sm:mb-6">
                    <h1 className={`text-xl sm:text-2xl font-bold ${themeStyles.titleColor}`}>{shopName}</h1>
                    <p className={`text-xs sm:text-sm ${themeStyles.subTitleColor}`}>Hóa Đơn Dịch Vụ</p>
                </div>
                <div className={`flex justify-between items-end mb-4 pb-4 ${themeStyles.header.includes('border') ? '' : 'border-b border-gray-200'}`}>
                    <div>
                        <p className={`font-semibold text-sm sm:text-base ${themeStyles.labelColor}`}>Khách hàng:</p>
                        <p className={`text-base sm:text-lg font-bold ${themeStyles.textColor}`}>{bill.customerName}</p>
                    </div>
                    <div className="text-right text-xs sm:text-sm">
                        <p><span className={`font-semibold ${themeStyles.labelColor}`}>Ngày:</span> <span className={themeStyles.textColor}>{formatSpecificDateTime(bill.date)}</span></p>
                    </div>
                </div>
                 {/* Table Header Row */}
                <div className={`flex pb-2 text-xs sm:text-sm p-2 rounded-sm ${themeStyles.tableHeader}`}>
                    <div className="w-[70%]">Dịch Vụ</div>
                    <div className="w-[30%] text-right">Giá</div>
                </div>
            </div>

            {/* Items List - Flows naturally now */}
            <div className="px-4 sm:px-6">
                <table className="w-full text-left border-collapse">
                    <tbody className="text-xs sm:text-sm">
                        {bill.items.map((item) => (
                            <tr key={item.id} className={`border-b last:border-0 ${themeStyles.tableRowBorder}`}>
                                <td className={`py-2 sm:py-3 align-top w-[70%] ${themeStyles.textColor}`}>
                                    {item.name}
                                    {item.quantity && item.quantity > 1 && (
                                        <span className={`font-semibold ml-1 ${themeStyles.labelColor}`}>(x{item.quantity})</span>
                                    )}
                                </td>
                                <td className={`py-2 sm:py-3 text-right align-top w-[30%] ${themeStyles.textColor}`}>{formatCurrency(item.price)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Section */}
            <div className="p-4 sm:p-6 pt-2 sm:pt-2">
                <div className="border-t border-gray-200 pt-4">
                     <div className="flex justify-end">
                        <div className="w-full">
                            {hasDiscount && (
                                <>
                                    <div className="flex justify-between text-sm sm:text-base mb-1 px-3 sm:px-4">
                                        <span className={themeStyles.labelColor}>Tạm tính</span>
                                        <span className={themeStyles.textColor}>{formatCurrency(subTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm sm:text-base mb-2 px-3 sm:px-4">
                                        <span className={themeStyles.labelColor}>Giảm giá {bill.discountType === 'percent' ? `(${bill.discountValue}%)` : ''}</span>
                                        <span className="text-red-500 font-semibold">-{formatCurrency(discountAmount)}</span>
                                    </div>
                                </>
                            )}
                            <div className={`flex justify-between font-bold text-lg sm:text-xl p-3 sm:p-4 rounded-lg ${themeStyles.totalBg}`}>
                                <span>Tổng Cộng</span>
                                <span>{formatCurrency(bill.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`text-center mt-4 sm:mt-6 text-[10px] sm:text-xs ${themeStyles.footerText}`}>
                    <p>Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!</p>
                </div>
            </div>
        </div>

        {/* Action Buttons: Fixed at very bottom of modal */}
        <div className="no-print p-4 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200 shrink-0 z-10">
            <button onClick={onClose} className="px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base">Đóng</button>
            <button onClick={handleDownloadImage} disabled={isDownloading} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base flex items-center gap-2">
                <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{isDownloading ? 'Đang tải...' : 'Tải Ảnh'}</span>
                <span className="sm:hidden">{isDownloading ? '...' : 'Ảnh'}</span>
            </button>
            <button onClick={handlePrint} className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm sm:text-base">In</button>
        </div>
      </div>
    </div>
  );
};

export default BillViewModal;
