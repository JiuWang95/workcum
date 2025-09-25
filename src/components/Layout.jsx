import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">{t('app_title')}</h1>
          <div className="flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600">{t('navigation.time_entry')}</Link>
            <Link to="/reports" className="text-gray-700 hover:text-indigo-600">{t('navigation.reports')}</Link>
            <Link to="/schedule" className="text-gray-700 hover:text-indigo-600">{t('navigation.schedule')}</Link>
            <Link to="/data" className="text-gray-700 hover:text-indigo-600">{t('navigation.data')}</Link>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="flex justify-around items-center p-3">
          <Link to="/" className="text-gray-700 hover:text-indigo-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">{t('navigation.time_entry')}</span>
          </Link>
          <Link to="/reports" className="text-gray-700 hover:text-indigo-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">{t('navigation.reports')}</span>
          </Link>
          <Link to="/schedule" className="text-gray-700 hover:text-indigo-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">{t('navigation.schedule')}</span>
          </Link>
          <Link to="/data" className="text-gray-700 hover:text-indigo-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className="text-xs">{t('navigation.data')}</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:pb-4 pb-20">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;