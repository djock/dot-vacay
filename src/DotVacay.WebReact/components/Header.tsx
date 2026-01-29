import React from 'react';

interface HeaderProps {
  user: { name: string; email: string } | null;
  onMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onMenu }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
      <button className="md:hidden text-slate-500 hover:text-sky-600" onClick={onMenu} type="button">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />
      {/* Notification icon removed for now. */}
      {/* <button className="p-2 text-slate-400 hover:text-sky-600 relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button> */}
    </header>
  );
};

export default Header;
