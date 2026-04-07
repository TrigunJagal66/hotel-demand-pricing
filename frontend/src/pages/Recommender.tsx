import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { DemandRequest, PricingResponse } from '../types';
import { format } from 'date-fns';
import { Loader2, ArrowUpRight, ArrowDownRight, Minus, Check, Calculator } from 'lucide-react';
import { cn } from '../components/Sidebar';

export const Recommender: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<DemandRequest>(() => {
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
  const [contextStr, setContextStr] = useState('{}');
  const [showContext, setShowContext] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedContext = {};
      try {
        parsedContext = JSON.parse(contextStr);
      } catch (e) {
        throw new Error("Invalid JSON in context field");
      }

      const res = await api.recommendPrice({
        ...formData,
        context: parsedContext
      });
      setResult(res);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (conf: string) => {
    switch (conf) {
      case 'high': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Price Recommender</h1>
        <p className="text-navy-300 mt-1">Get AI-driven price recommendations based on real-time factors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-sm h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1">Hotel ID</label>
              <input 
                type="text" 
                value={formData.entity_id}
                onChange={e => setFormData({...formData, entity_id: e.target.value})}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1">Target Date</label>
              <input 
                type="date" 
                value={formData.target_date}
                max="2026-10-07"
                onChange={e => setFormData({...formData, target_date: e.target.value})}
                className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-navy-200 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    min="1" max="2000"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-200 mb-1">Base Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" min="1"
                    value={formData.base_price}
                    onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})}
                    className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
            </div>

            <div>
              <button 
                type="button" 
                onClick={() => setShowContext(!showContext)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                {showContext ? '- Hide Context Array' : '+ Add Advanced Context'}
              </button>
              {showContext && (
                <textarea 
                  value={contextStr}
                  onChange={e => setContextStr(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 mt-2 text-white font-mono text-sm h-24 focus:outline-none focus:border-blue-500"
                  placeholder='{"event": "concert", "weather": "storm"}'
                />
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Generate Pricing</span>}
            </button>
            
            {error && <div className="text-red-400 text-sm mt-2 p-3 bg-red-400/10 rounded-lg border border-red-400/20">{error}</div>}
          </form>
        </div>

        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-navy-800 border border-navy-700 rounded-xl p-8 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-medium text-navy-300 mb-1">Recommended Price</h2>
                  <div className="flex items-end space-x-3">
                    <span className="text-6xl font-bold bg-gradient-to-br from-white to-blue-200 bg-clip-text text-transparent">
                      <AnimatedNumber value={result.recommended_price} />
                    </span>
                    <span className="text-xl text-navy-400 pb-1.5 flex items-center">
                      {result.recommended_price > formData.base_price && <ArrowUpRight className="w-5 h-5 text-emerald-400 mr-1" />}
                      {result.recommended_price < formData.base_price && <ArrowDownRight className="w-5 h-5 text-red-400 mr-1" />}
                      {result.recommended_price === formData.base_price && <Minus className="w-5 h-5 text-navy-400 mr-1" />}
                      from ${formData.base_price}
                    </span>
                  </div>
                </div>
                <div className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getConfidenceColor(result.confidence))}>
                  {result.confidence} Confidence
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="bg-navy-900/50 rounded-lg p-4 border border-navy-700">
                    <p className="text-sm text-navy-300 mb-1">Predicted Demand</p>
                    <p className="text-2xl font-semibold text-white">{result.predicted_demand} rooms</p>
                 </div>
                 <div className="bg-navy-900/50 rounded-lg p-4 border border-navy-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-navy-300 mb-1">Occupancy Ratio</p>
                      <p className="text-2xl font-semibold text-white">{(result.occupancy_ratio * 100).toFixed(1)}%</p>
                    </div>
                    {/* Tiny Gauge Placeholder */}
                    <div className="w-12 h-12 rounded-full border-4 border-navy-700 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500" style={{clipPath: `inset(${100 - (result.occupancy_ratio * 100)}% 0 0 0)`}}></div>
                    </div>
                 </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-navy-200 uppercase tracking-wider mb-4">Pricing Logic Timeline</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-navy-600 before:to-transparent">
                  {result.explanation.map((exp, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-navy-700 bg-navy-800 text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-navy-900/80 p-3 rounded-lg border border-navy-700 shadow-sm text-sm text-navy-100">
                        {exp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full border-2 border-dashed border-navy-700 rounded-xl flex items-center justify-center p-12 lg:min-h-[500px]">
               <div className="text-center">
                 <Calculator className="w-12 h-12 text-navy-600 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-navy-300">Ready for Prediction</h3>
                 <p className="text-navy-400 mt-2 text-sm max-w-sm">Enter the hotel details and target date on the left to generate an AI pricing recommendation.</p>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = value / (duration / 16);
    
    const max = value;
    const timer = setInterval(() => {
      start += increment;
      if (start >= max) {
        setDisplayValue(max);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>${displayValue.toFixed(2)}</>;
};
