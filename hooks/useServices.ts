
import { useState, useEffect, useCallback } from 'react';
import type { PredefinedService } from '../types';

const SERVICES_STORAGE_KEY = 'nailSpaServices';

const initialServices: Omit<PredefinedService, 'id'>[] = [
  // CHĂM SÓC MÓNG
  { name: 'Cắt da', price: 30000, allowQuantity: false },
  { name: 'Phá Gel/Bột', price: 20000, allowQuantity: false },
  // SƠN
  { name: 'Sơn Gel', price: 80000, allowQuantity: false },
  { name: 'Sơn Thạch', price: 80000, allowQuantity: false },
  { name: 'Sơn Nhũ', price: 110000, allowQuantity: false },
  { name: 'Sơn Mắt Mèo', price: 120000, allowQuantity: false },
  // ĐẮP MÓNG
  { name: 'Úp Gel', price: 180000, allowQuantity: false },
  { name: 'Úp Keo', price: 80000, allowQuantity: false },
  { name: 'Đắp Gel/Bột', price: 200000, allowQuantity: false },
  { name: 'Fill Gel/Bột', price: 150000, allowQuantity: false },
  // DESIGN
  { name: 'Design - Tráng gương (1 ngón)', price: 10000, allowQuantity: true },
  { name: 'Design - Ombre (1 ngón)', price: 15000, allowQuantity: true },
  { name: 'Design - Sơn nhũ (1 ngón)', price: 5000, allowQuantity: true },
  { name: 'Design - Ẩn nhũ/cừ/hoa khô (1 ngón)', price: 10000, allowQuantity: true },
  { name: 'Design - Thủ nổi/Hoạ nổi (1 ngón)', price: 10000, allowQuantity: true },
  { name: 'Design - Charm', price: 10000, allowQuantity: true },
  { name: 'Design - Đá (1 viên)', price: 5000, allowQuantity: true },
  { name: 'Design - Vẽ hoạt hình (1 ngón)', price: 10000, allowQuantity: true },
];

const generateId = () => new Date().toISOString() + Math.random().toString(36).substr(2, 9);

const useServices = () => {
  const [services, setServices] = useState<PredefinedService[]>(() => {
    try {
      const storedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (storedServices) {
        return JSON.parse(storedServices);
      }
      
      const servicesWithIds = initialServices.map(service => ({
        ...service,
        id: generateId(),
      }));
      localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesWithIds));
      return servicesWithIds;

    } catch (error) {
      console.error("Error reading services from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    } catch (error) {
        console.error("Error saving services to localStorage", error);
    }
  }, [services]);

  const addService = useCallback((service: Omit<PredefinedService, 'id'>) => {
    const newService: PredefinedService = {
      ...service,
      id: generateId(),
    };
    setServices(prevServices => [newService, ...prevServices]);
  }, []);

  const updateService = useCallback((updatedService: PredefinedService) => {
    setServices(prevServices =>
      prevServices.map(service => (service.id === updatedService.id ? updatedService : service))
    );
  }, []);

  const deleteService = useCallback((serviceId: string) => {
    setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
  }, []);
  
  const restoreServices = useCallback((servicesToRestore: PredefinedService[]) => {
    setServices(servicesToRestore);
  }, []);

  return { services, addService, updateService, deleteService, restoreServices };
};

export default useServices;
