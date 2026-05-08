import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title, isAdmin: isAdminProp = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Detect role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin' || isAdminProp;

  React.useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <div 
        className={`fixed inset-0 z-[998] bg-slate-900/60 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-[999] transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${sidebarCollapsed ? 'lg:w-24' : 'lg:w-72'}`}>
        <Sidebar 
          isAdmin={isAdmin} 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72'}`}>
        <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
