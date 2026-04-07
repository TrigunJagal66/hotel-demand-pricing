import React from 'react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-navy-950 font-sans text-navy-100 flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 overflow-y-auto w-full h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
