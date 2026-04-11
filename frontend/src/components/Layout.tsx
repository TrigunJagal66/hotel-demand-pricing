import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0c0e12] font-sans text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 overflow-y-auto w-full h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
