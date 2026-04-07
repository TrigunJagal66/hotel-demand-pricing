import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemandRequest, PricingResponse } from '../types';
import { format } from 'date-fns';

interface FormContextType {
  recommenderFormData: DemandRequest;
  setRecommenderFormData: (data: DemandRequest) => void;
  lastResult: PricingResponse | null;
  setLastResult: (result: PricingResponse | null) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastResult, setLastResult] = useState<PricingResponse | null>(null);
  const [recommenderFormData, setRecommenderFormData] = useState<DemandRequest>(() => {
    // Initial defaults (logic similar to what was in Recommender.tsx)
    let defaultHotelCode = 'hotel_nyc_01';
    let defaultCapacity = 200;
    let defaultPrice = 150.0;

    const savedStr = localStorage.getItem('priceiq_settings');
    if (savedStr) {
      try {
        const saved = JSON.parse(savedStr);
        if (saved.defaultHotelCode) defaultHotelCode = saved.defaultHotelCode;
        if (saved.defaultCapacity) defaultCapacity = saved.defaultCapacity;
        if (saved.defaultPrice) defaultPrice = saved.defaultPrice;
      } catch (e) {}
    }

    return {
      entity_id: defaultHotelCode,
      target_date: format(new Date(), 'yyyy-MM-dd'),
      capacity: defaultCapacity,
      base_price: defaultPrice,
      context: {},
    };
  });

  return (
    <FormContext.Provider value={{ recommenderFormData, setRecommenderFormData, lastResult, setLastResult }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormState = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormState must be used within a FormProvider');
  }
  return context;
};
