import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const { notifications, clearNotifications } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const timeAgo = (ts) => {
    const diffMin = Math.round((Date.now() - ts) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.round(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.round(diffHr / 24)}d ago`;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-extrabold text-gradient">GigSetu</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.dashboard')}</Link>
              </>
            )}
            {user && user.role === 'customer' && (
              <>
                <Link to="/customer" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.dashboard')}</Link>
                <Link to="/customer/find-service" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.findService')}</Link>
                <Link to="/customer/bookings" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.bookings')}</Link>
              </>
            )}
            {user && user.role === 'worker' && (
              <>
                <Link to="/worker" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.dashboard')}</Link>
                <Link to="/worker/jobs" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.myJobs')}</Link>
                <Link to="/worker/earnings" className="text-gray-700 hover:text-primary-600 font-medium">Earnings</Link>
                <Link to="/worker/profile" className="text-gray-700 hover:text-primary-600 font-medium">{t('navigation.profile')}</Link>
              </>
            )}

            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center text-gray-700 hover:text-primary-600 p-2">
                🌐 {language.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  {supportedLanguages.map(lang => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code); setLangOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative">
                    <span className="text-xl">🔔</span>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white justify-center items-center font-bold">
                          {notifications.length}
                        </span>
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="flex justify-between items-center px-4 py-3 border-b">
                        <span className="font-bold text-sm">Notifications</span>
                        {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-xs text-primary-600 font-semibold hover:underline">Clear all</button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">You're all caught up.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="px-4 py-3 border-b last:border-b-0 text-sm hover:bg-gray-50">
                            <p className="text-gray-800">{n.message}</p>
                            <span className="text-xs text-gray-400">{timeAgo(n.receivedAt)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm font-medium transition-colors">
                  {t('common.logout')}
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 font-medium">{t('common.login')}</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg">
                  {t('auth.registerHere')}
                </Link>
              </div>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700 focus:outline-none touch-target flex justify-center items-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
