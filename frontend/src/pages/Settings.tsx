import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { setApiBaseUrl } from '../api/client';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    baseUrl: '',
    defaultHotelCode: 'hotel_nyc_01',
    defaultCapacity: 200,
    defaultPrice: 150.0
  });
  
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('priceiq_settings');
    if (s) {
      try {
        setSettings(JSON.parse(s));
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('priceiq_settings', JSON.stringify(settings));
    setApiBaseUrl(settings.baseUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to completely clear local storage settings?")) {
      localStorage.removeItem('priceiq_settings');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-navy-300 mt-1">Application preferences and defaults.</p>
      </div>

      <div className="bg-navy-800 border border-navy-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4 border-b border-navy-700 pb-2">Connection Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1">API Base URL</label>
            <input 
              type="text" 
              value={settings.baseUrl}
              placeholder="e.g. http://127.0.0.1:8000 (leave blank to use defaults)"
              onChange={e => setSettings({...settings, baseUrl: e.target.value})}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-navy-400 mt-1.5">When blank, the system relies on Vite proxy or relative paths.</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white mt-8 mb-4 border-b border-navy-700 pb-2">Prediction Defaults</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1">Default Hotel ID</label>
            <input 
              type="text" 
              value={settings.defaultHotelCode}
              onChange={e => setSettings({...settings, defaultHotelCode: e.target.value})}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div></div>
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1">Default Capacity</label>
            <input 
              type="number" 
              value={settings.defaultCapacity}
              onChange={e => setSettings({...settings, defaultCapacity: Number(e.target.value)})}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1">Default Base Price</label>
            <input 
              type="number" 
              value={settings.defaultPrice}
              onChange={e => setSettings({...settings, defaultPrice: Number(e.target.value)})}
              className="w-full bg-navy-900 border border-navy-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-navy-700 flex justify-between items-center">
          <button 
            onClick={handleClearHistory}
            className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset all settings
          </button>
          
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
