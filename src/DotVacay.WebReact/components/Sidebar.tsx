import React from 'react';
import { View } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onProfile: () => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onProfile, onLogout, isMobileOpen, onClose }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'My Trips',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'lists',
      label: 'Travel Lists',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ];

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/40 md:hidden" onClick={onClose}></div>
      )}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white border-r border-slate-200 transform transition-transform md:translate-x-0 md:static md:flex md:flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="p-6 flex items-center space-x-3">
        <Logo size="sm" />
        <span className="text-xl font-bold text-slate-800">DotVacay</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id as View);
              onClose();
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
              currentView === item.id ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => {
            onProfile();
            onClose();
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:text-sky-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-medium">Profile</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
