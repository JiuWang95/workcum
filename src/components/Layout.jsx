import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Layout = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  // 桌面端导航栏按钮的活动状态样式
  const getDesktopLinkClass = (path) => {
    const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClass = "bg-indigo-100 text-indigo-700";
    const inactiveClass = "text-gray-700 hover:text-indigo-600 hover:bg-gray-100";
    
    // 特殊处理根路径
    if (path === "/" && location.pathname === "/") {
      return `${baseClass} ${activeClass}`;
    }
    
    // 其他路径的匹配
    if (path !== "/" && location.pathname.startsWith(path)) {
      return `${baseClass} ${activeClass}`;
    }
    
    return `${baseClass} ${inactiveClass}`;
  };

  // 移动端导航栏按钮的活动状态样式
  const getMobileLinkClass = (path) => {
    const baseClass = "flex flex-col items-center p-2 text-xs transition-colors";
    const activeClass = "text-indigo-600 bg-indigo-50 rounded-lg";
    const inactiveClass = "text-gray-700 hover:text-indigo-600";
    
    // 特殊处理根路径
    if (path === "/" && location.pathname === "/") {
      return `${baseClass} ${activeClass}`;
    }
    
    // 其他路径的匹配
    if (path !== "/" && location.pathname.startsWith(path)) {
      return `${baseClass} ${activeClass}`;
    }
    
    return `${baseClass} ${inactiveClass}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
        <nav className="hidden md:flex bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">{t('app_title')}</h1>
            <div className="flex space-x-6 items-center">
              <Link to="/schedule" className={getDesktopLinkClass("/schedule")}>{t('navigation.schedule')}</Link>
              <Link to="/" className={getDesktopLinkClass("/")}>{t('navigation.time_entry')}</Link>
              <Link to="/reports" className={getDesktopLinkClass("/reports")}>{t('navigation.reports')}</Link>
              <Link to="/data" className={getDesktopLinkClass("/data")}>{t('navigation.data')}</Link>
            </div>
          </div>
        </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
        <div className="flex justify-around items-center p-3">
          <Link to="/schedule" className={getMobileLinkClass("/schedule")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs sm:text-sm">{t('navigation.schedule')}</span>
          </Link>
          <Link to="/" className={getMobileLinkClass("/")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs sm:text-sm">{t('navigation.time_entry')}</span>
          </Link>
          <Link to="/reports" className={getMobileLinkClass("/reports")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs sm:text-sm">{t('navigation.reports')}</span>
          </Link>
          <Link to="/data" className={getMobileLinkClass("/data")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span className="text-xs sm:text-sm">{t('navigation.data')}</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:pb-4 pb-24">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;