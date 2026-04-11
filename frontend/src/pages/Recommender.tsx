import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { DemandRequest, PricingResponse } from '../types';
import { format } from 'date-fns';
import { Loader2, ArrowUpRight, ArrowDownRight, Minus, Check, Calculator } from 'lucide-react';
import { cn } from '../components/Sidebar';
import { useFormState } from '../context/FormContext';

export const Recommender: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { 
    recommenderFormData: formData, 
    setRecommenderFormData: setFormData,
    lastResult: result,
    setLastResult: setResult 
  } = useFormState();
  
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
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Price Recommender</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Get AI-driven price recommendations based on real-time factors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm h-fit">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Hotel ID</label>
              <input 
                type="text" 
                value={formData.entity_id}
                onChange={e => setFormData({...formData, entity_id: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0c0e12] border border-slate-200 dark:border-slate-700 rounded-[8px] px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Target Date</label>
              <input 
                type="date" 
                value={formData.target_date}
                max="2026-10-07"
                onChange={e => setFormData({...formData, target_date: e.target.value})}
                className="w-full bg-slate-50 dark:bg-[#0c0e12] border border-slate-200 dark:border-slate-700 rounded-[8px] px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    min="1" max="2000"
                    value={formData.capacity}
                    onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-[#0c0e12] border border-slate-200 dark:border-slate-700 rounded-[8px] px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Base Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" min="1"
                    value={formData.base_price}
                    onChange={e => setFormData({...formData, base_price: parseFloat(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-[#0c0e12] border border-slate-200 dark:border-slate-700 rounded-[8px] px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                    required
                  />
                </div>
            </div>

            <div className="flex items-center space-x-2 pb-2">
              <input
                type="checkbox"
                id="is_holiday"
                checked={formData.is_holiday || false}
                onChange={e => setFormData({...formData, is_holiday: e.target.checked})}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-[#0c0e12] text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="is_holiday" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Is this date a Local Festival or Holiday?
              </label>
            </div>

            <div>
              <button 
                type="button" 
                onClick={() => setShowContext(!showContext)}
                className="text-sm text-emerald-500 hover:text-emerald-400 font-medium"
              >
                {showContext ? '- Hide Context Array' : '+ Add Advanced Context'}
              </button>
              {showContext && (
                <textarea 
                  value={contextStr}
                  onChange={e => setContextStr(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0c0e12] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 mt-2 text-slate-900 dark:text-white font-mono text-sm h-24 focus:outline-none focus:border-emerald-500"
                  placeholder='{"event": "concert", "weather": "storm"}'
                />
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-500 hover:to-cyan-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white font-bold tracking-wide py-3 rounded-full transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Generate Pricing</span>}
            </button>
            
            {error && <div className="text-red-400 text-sm mt-2 p-3 bg-red-400/10 rounded-lg border border-red-400/20">{error}</div>}
          </form>
        </div>

        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1">Recommended Price</h2>
                  <div className="flex items-end space-x-3">
                    <span className="text-7xl font-black bg-gradient-to-br from-emerald-600 to-cyan-600 dark:from-emerald-300 dark:to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <AnimatedNumber value={result.recommended_price} />
                    </span>
                    <span className="text-xl text-slate-400 dark:text-slate-500 pb-2.5 flex items-center">
                      {result.recommended_price > formData.base_price && <ArrowUpRight className="w-5 h-5 text-emerald-500 dark:text-emerald-400 mr-1" />}
                      {result.recommended_price < formData.base_price && <ArrowDownRight className="w-5 h-5 text-red-500 dark:text-red-400 mr-1" />}
                      {result.recommended_price === formData.base_price && <Minus className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-1" />}
                      from ₹{formData.base_price}
                    </span>
                  </div>
                </div>
                <div className={cn("px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getConfidenceColor(result.confidence))}>
                  {result.confidence} Confidence
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="bg-slate-50/50 dark:bg-[#111318]/50 rounded-[12px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Predicted Demand</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white">{result.predicted_demand} <span className="text-base font-normal text-slate-400">rooms</span></p>
                 </div>
                 <div className="bg-slate-50/50 dark:bg-[#111318]/50 rounded-[12px] p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Occupancy Ratio</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">{(result.occupancy_ratio * 100).toFixed(1)}%</p>
                    </div>
                    {/* Tiny Gauge Placeholder */}
                    <div className="w-14 h-14 rounded-full border-[6px] border-slate-200 dark:border-slate-800 flex items-center justify-center relative shadow-inner">
                      <div className="absolute inset-0 rounded-full border-[6px] border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{clipPath: `inset(${100 - (result.occupancy_ratio * 100)}% 0 0 0)`}}></div>
                    </div>
                 </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Pricing Logic Timeline</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-slate-700 before:to-transparent">
                  {result.explanation.map((exp, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111318] text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-slate-50/80 dark:bg-[#111318]/80 p-4 rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-sm text-sm text-slate-700 dark:text-slate-300 font-medium tracking-wide">
                        {exp}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
             <div className="h-full border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl flex items-center justify-center p-12 lg:min-h-[500px]">
               <div className="text-center">
                 <Calculator className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                 <h3 className="text-max font-bold text-slate-400 dark:text-slate-500">Ready for Prediction</h3>
                 <p className="text-slate-400 dark:text-slate-600 mt-2 text-sm max-w-sm">Enter the hotel details and target date on the left to generate an AI pricing recommendation.</p>
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

  return <>₹{displayValue.toFixed(2)}</>;
};
