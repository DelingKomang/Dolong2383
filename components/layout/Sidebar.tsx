
import React from 'react';
import { X, Feather, LogOut, History, Trash2 } from 'lucide-react';
import { SIDEBAR_MENU } from '../../constant';
import type { SidebarMenuItem } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogoutClick: () => void;
  onRestoreClick: () => void;
  onHardResetClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, isCollapsed, activePage, setActivePage, onLogoutClick, onRestoreClick, onHardResetClick }) => {
  const handleItemClick = (name: string) => {
    setActivePage(name);
    if(window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`fixed lg:relative inset-y-0 left-0 bg-gray-900 border-r border-gray-800 transform transition-all duration-300 ease-in-out z-30 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 h-16 border-b border-gray-800`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <Feather className="h-8 w-8 text-teal-400 flex-shrink-0" />
            <span className={`text-xl font-bold text-white whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
              Desa Tiga Likur
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
          <ul>
            {SIDEBAR_MENU.map((item: SidebarMenuItem) => (
              <li key={item.name}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(item.name);
                  }}
                  className={`flex items-center p-3 my-1 rounded-lg transition-all duration-200 group ${
                    activePage === item.name
                      ? 'bg-teal-500 bg-opacity-20 text-teal-300 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                  <span className={`transition-opacity duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-800 space-y-2">
            <a
              href="#"
              onClick={(e) => {
                  e.preventDefault();
                  onRestoreClick();
              }}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-sky-500/10 hover:text-sky-400 ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? "Pulihkan Data" : ""}
              >
              <History className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
              <span className={`${isCollapsed ? 'hidden' : 'block font-semibold'}`}>Pulihkan Data</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                  e.preventDefault();
                  onHardResetClick();
              }}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-red-500/10 hover:text-red-400 ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? "Hard Reset" : ""}
              >
              <Trash2 className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
              <span className={`${isCollapsed ? 'hidden' : 'block font-semibold'}`}>Hard Reset</span>
            </a>
            <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                onLogoutClick();
            }}
            className={`flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-red-500/10 hover:text-red-400 ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? "Logout" : ""}
            >
            <LogOut className={`h-5 w-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
            <span className={`${isCollapsed ? 'hidden' : 'block font-semibold'}`}>Logout</span>
            </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
