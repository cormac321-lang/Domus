import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/listings', label: 'Listings', icon: '📋' },
    { path: '/my-properties', label: 'My Properties', icon: '🏠' },
    { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/chat', label: 'Chat', icon: '💬' },
    { path: '/ai-tools', label: 'AI Tools', icon: '🤖' },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-green-100 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-900">Domus</h1>
          {state.user && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-900">{state.user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-green-700 hover:text-green-900"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 p-2 rounded transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-green-200 text-green-900'
                  : 'text-green-800 hover:bg-green-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-green-200">
          <div className="text-sm text-green-800">
            <p>Need help?</p>
            <a
              href="#"
              className="text-green-700 hover:text-green-900 underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-green-100 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-900">Domus</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-green-200"
          >
            <svg
              className="w-6 h-6 text-green-900"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-green-100 p-4 z-10 shadow-lg">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-2 p-2 rounded ${
                  isActive(item.path)
                    ? 'bg-green-200 text-green-900'
                    : 'text-green-800 hover:bg-green-200'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto md:ml-64">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-green-100 flex justify-around p-2 text-sm border-t">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center ${
              isActive(item.path) ? 'text-green-700' : 'text-green-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout; 