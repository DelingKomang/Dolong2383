import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, UserCircle, LogOut } from 'lucide-react';
import type { User } from '../../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  pageTitle: string;
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, pageTitle, currentUser, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const dateString = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl md:text-2xl font-semibold ml-4 text-white">{pageTitle}</h1>
      </div>
      <div className="flex items-center space-x-4 md:space-x-6">
        <div className="hidden md:block text-sm text-gray-400">{dateString}</div>
        <button className="relative text-gray-400 hover:text-white">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 cursor-pointer p-1 rounded-lg hover:bg-gray-800">
            <UserCircle className="h-8 w-8 text-teal-400" />
            <div className="hidden sm:flex flex-col items-start">
              <span className="font-medium text-white text-sm leading-tight">{currentUser.email}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${currentUser.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}>{currentUser.role}</span>
            </div>
          </button>

          {dropdownOpen && (
             <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-20 animate-fade-in-up">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;