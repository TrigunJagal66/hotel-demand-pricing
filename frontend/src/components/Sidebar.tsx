import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, History, Settings, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for formatting classes
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Recommender', path: '/recommend', icon: Calculator },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 h-screen bg-navy-900 border-r border-navy-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <TrendingUp className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
          PriceIQ
        </span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-blue-600/10 text-blue-400 font-medium" 
                  : "text-navy-300 hover:bg-navy-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-navy-800">
        <div className="text-xs text-navy-400 text-center">
          PriceIQ v1.0.0
        </div>
      </div>
    </div>
  );
};
