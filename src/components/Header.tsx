import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Library, BarChart2, Sun, Moon } from 'lucide-react';
import { SyncManager } from './SyncManager';

export const Header: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/decks', label: 'Decks', icon: <Library size={20} /> },
    { path: '/statistics', label: 'Stats', icon: <BarChart2 size={20} /> },
  ];

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 transition-colors pt-[env(safe-area-inset-top)]">
        <div className="max-w-5xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-primary-600">
            <BookOpen size={24} />
            <span className="text-xl font-bold tracking-tight">VocaLoop</span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="hidden sm:flex space-x-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <SyncManager />
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 z-50 pb-[env(safe-area-inset-bottom)] transition-colors shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <nav className="flex justify-around items-center h-16 px-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all ${
                  isActive ? 'text-primary-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};
