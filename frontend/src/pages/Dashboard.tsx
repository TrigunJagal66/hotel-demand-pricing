import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { PricingLog } from '../types';
import { Activity, Hotel, IndianRupee, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { format } from 'date-fns';
import { cn } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const [logs, setLogs] = useState<PricingLog[]>([]);
  const [health, setHealth] = useState<{ status: string, message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const hStatus = await api.getHealth();
      setHealth(hStatus);
    } catch (e) {
      setHealth({ status: 'error', message: 'API Offline' });
    }

    try {
      const data = await api.getHistory();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalPredictions = logs.length;
  const avgOccupancy = logs.length ? (logs.reduce((acc, log) => acc + log.occupancy_ratio, 0) / logs.length * 100).toFixed(1) : 0;
  const avgPrice = logs.length ? (logs.reduce((acc, log) => acc + log.recommended_price, 0) / logs.length).toFixed(2) : 0;
  const highConfidencePercent = logs.length ? ((logs.filter(l => l.confidence === 'high').length / logs.length) * 100).toFixed(0) : 0;

  // Chart Details
  const recentLogs = [...logs].reverse().slice(-10); // get oldest to newest of the last 10
  const chartData = recentLogs.map(log => {
    let formattedTime = 'N/A';
    try {
      if (log.timestamp) {
        formattedTime = format(new Date(log.timestamp), 'HH:mm');
      }
    } catch (e) { }

    return {
      time: formattedTime,
      price: log.recommended_price,
      demand: log.predicted_demand,
      capacity: log.capacity,
    };
  });

  if (loading) {
    return <div className="text-slate-900 dark:text-white flex justify-center items-center h-full">Loading...</div>;
  }

  const chartStroke = theme === 'dark' ? '#334155' : '#e2e8f0'; 
  const chartText = theme === 'dark' ? '#94a3b8' : '#64748b'; 
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#f8fafc' : '#0f172a';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your pricing system.</p>
        </div>

        <div className={cn(
          "px-4 py-2 rounded-full border flex items-center space-x-2 text-sm font-medium shadow-sm transition-colors",
          health?.status === 'error'
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        )}>
          {health?.status === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{health?.message || 'API Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard icon={Activity} label="Total Predictions" value={totalPredictions.toString()} />
        <StatsCard icon={Hotel} label="Avg Occupancy rate" value={`${avgOccupancy}%`} />
        <StatsCard icon={IndianRupee} label="Avg Recommended Price" value={`₹${avgPrice}`} />
        <StatsCard icon={Target} label="High Confidence" value={`${highConfidencePercent}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Price Trend (Last 10)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} vertical={false} />
                <XAxis dataKey="time" stroke={chartStroke} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis stroke={chartStroke} tick={{ fill: chartText, fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Demand vs Capacity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStroke} vertical={false} />
                <XAxis dataKey="time" stroke={chartStroke} tick={{ fill: chartText, fontSize: 12 }} />
                <YAxis stroke={chartStroke} tick={{ fill: chartText, fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f1f5f9' }} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ color: chartText }} />
                <Bar dataKey="capacity" fill={theme === 'dark' ? '#334155' : '#cbd5e1'} radius={[4, 4, 0, 0]} name="Capacity" />
                <Bar dataKey="demand" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Expected Demand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[12px] p-5 shadow-sm flex items-center space-x-4 transition-transform hover:scale-[1.02]">
    <div className="p-3 bg-slate-50 dark:bg-[#111318] border border-slate-200 dark:border-slate-800 rounded-lg text-emerald-500 shadow-inner">
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</p>
    </div>
  </div>
);
