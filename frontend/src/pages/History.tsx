import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { PricingLog } from '../types';
import { Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { AreaChart, Area, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ZAxis } from 'recharts';

export const History: React.FC = () => {
  const [logs, setLogs] = useState<PricingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterConf, setFilterConf] = useState<string>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        setLogs(data);
      } catch (err) {
        console.error("Error fetching history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredLogs = logs.filter(log => filterConf === 'all' || log.confidence === filterConf);

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = Object.keys(logs[0]).join(',');
    const rows = logs.map(log => 
      Object.values(log).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    ).join('\n');
    
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'pricing_history.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const chartData = [...filteredLogs].reverse().map(l => {
    let formattedTime = 'N/A';
    try {
      if (l.timestamp) {
        formattedTime = format(new Date(l.timestamp), 'MMM dd HH:mm');
      }
    } catch (e) {}

    return {
      time: formattedTime,
      occupancy: Number((l.occupancy_ratio * 100).toFixed(1)),
      basePrice: l.base_price,
      recommendedPrice: l.recommended_price,
      delta: l.recommended_price - l.base_price
    };
  });

  if (loading) return <div className="text-white flex justify-center items-center h-full">Loading history...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">History & Analytics</h1>
          <p className="text-navy-300 mt-1">Review past predictions and pricing performance.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-navy-800 hover:bg-navy-700 text-white px-4 py-2 rounded-lg border border-navy-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Occupancy Trend</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334e68" vertical={false} />
                <XAxis dataKey="time" stroke="#829ab1" tick={{fill: '#829ab1', fontSize: 12}} />
                <YAxis stroke="#829ab1" tick={{fill: '#829ab1', fontSize: 12}} tickFormatter={v => `${v}%`} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#102a43', borderColor: '#334e68', color: '#fff', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="occupancy" stroke="#10b981" fillOpacity={1} fill="url(#colorOcc)" name="Occupancy (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-6">Base vs Recommended Price</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#334e68" />
                <XAxis type="number" dataKey="basePrice" name="Base Price" stroke="#829ab1" tick={{fill: '#829ab1', fontSize: 12}} tickFormatter={v => `$${v}`} />
                <YAxis type="number" dataKey="recommendedPrice" name="Rec Price" stroke="#829ab1" tick={{fill: '#829ab1', fontSize: 12}} tickFormatter={v => `$${v}`} />
                <ZAxis type="number" range={[50, 50]} />
                <RechartsTooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{ backgroundColor: '#102a43', borderColor: '#334e68', color: '#fff', borderRadius: '8px' }} />
                <Scatter name="Price Diff" data={chartData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-navy-700 flex justify-between items-center bg-navy-800/50">
          <h3 className="text-lg font-semibold text-white">Prediction Log</h3>
          <div className="flex items-center space-x-2">
             <Filter className="w-4 h-4 text-navy-400" />
             <select 
                value={filterConf}
                onChange={(e) => setFilterConf(e.target.value)}
                className="bg-navy-900 border border-navy-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none"
             >
                <option value="all">All Confidences</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
             </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-navy-200">
            <thead className="text-xs text-navy-300 uppercase bg-navy-900 border-b border-navy-700">
              <tr>
                <th scope="col" className="px-6 py-4">Date/Time</th>
                <th scope="col" className="px-6 py-4">Target Date</th>
                <th scope="col" className="px-6 py-4">Demand / Cap</th>
                <th scope="col" className="px-6 py-4">Base price</th>
                <th scope="col" className="px-6 py-4 font-bold text-white">Final Price</th>
                <th scope="col" className="px-6 py-4">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-navy-700 hover:bg-navy-700/50 transition-colors">
                  <td className="px-6 py-4">
                    {(() => {
                      try {
                        return log.timestamp ? format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm') : 'N/A';
                      } catch (e) { return 'N/A'; }
                    })()}
                  </td>
                  <td className="px-6 py-4">{log.target_date}</td>
                  <td className="px-6 py-4">{log.predicted_demand} / {log.capacity}</td>
                  <td className="px-6 py-4">${log.base_price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-white font-medium">${log.recommended_price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      log.confidence === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
                      log.confidence === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {log.confidence}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-navy-400">
                    No predictions found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
