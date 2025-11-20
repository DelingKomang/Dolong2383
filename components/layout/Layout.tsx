import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import type { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser: User;
  onLogout: () => void;
  onLogoutClick: () => void;
  onRestoreClick: () => void;
  onHardResetClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage, currentUser, onLogout, onLogoutClick, onRestoreClick, onHardResetClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogoutClick={onLogoutClick}
        onRestoreClick={onRestoreClick}
        onHardResetClick={onHardResetClick}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          pageTitle={activePage}
          currentUser={currentUser}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-800 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;