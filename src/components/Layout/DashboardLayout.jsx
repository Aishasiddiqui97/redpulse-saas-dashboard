import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { 
  FiMenu, FiX, FiBell, FiChevronDown, FiLogOut, FiUser, FiSettings, 
  FiGrid, FiBarChart2, FiList, FiUsers, FiFileText, FiShield, FiCpu,
  FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const navContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const navItemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

const DashboardLayout = ({ children }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  const navItems = [
    { name: 'Dashboard', icon: FiGrid, path: '/' },
    { name: 'Analytics', icon: FiBarChart2, path: '/analytics' },
    { name: 'Activity Logs', icon: FiList, path: '/logs' },
    { name: 'Users', icon: FiUsers, path: '/users', adminOnly: true },
    { name: 'API Management', icon: FiCpu, path: '/api-keys' },
    { name: 'Settings', icon: FiSettings, path: '/settings' },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const getPageTitle = () => {
    const active = navItems.find(item => item.path === location.pathname);
    return active ? active.name : 'SaaS System';
  };

  return (
    <div className="min-h-screen bg-darkBg-primary text-softWhite flex">
      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: sidebarCollapsed ? '76px' : '260px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col border-r border-slate-800 bg-darkBg-secondary/90 backdrop-blur-md sticky top-0 h-screen z-40"
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 relative overflow-hidden">
          <div className="shimmer-line absolute inset-x-0 bottom-0 h-[1px] opacity-60" />
          <div className="flex items-center gap-3 overflow-hidden">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-[#0A0A0F] shadow-lg shadow-accent-primary/20 shrink-0"
              animate={{ boxShadow: ['0 0 8px rgba(124,58,237,0.3)', '0 0 20px rgba(124,58,237,0.6)', '0 0 8px rgba(124,58,237,0.3)'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              S
            </motion.div>
            {!sidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg tracking-wider bg-gradient-to-r from-softWhite to-slate-400 bg-clip-text text-transparent"
              >
                Siddiqui<span className="text-accent-secondary font-medium">SaaS</span>
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <motion.nav
          className="flex-1 py-6 px-3 space-y-1"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredNavItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.name}
                variants={navItemVariants}
                onClick={() => handleNavClick(item.path)}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                  isActive 
                    ? 'sidebar-active text-softWhite' 
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-softWhite'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'text-accent-secondary drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]'
                    : 'text-slate-400 group-hover:text-accent-secondary'
                }`} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium tracking-wide">{item.name}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-secondary"
                    style={{ boxShadow: '0 0 6px rgba(0,229,255,0.8)' }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col items-center">
          <motion.button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            className="w-8 h-8 rounded-lg border border-slate-800 flex items-center justify-center bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-softWhite transition-colors"
          >
            <motion.span
              animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <FiChevronRight className="w-4 h-4" />
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-darkBg-secondary border-r border-slate-800 z-55 flex flex-col md:hidden"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-[#0A0A0F] shadow-lg shadow-accent-primary/20">
                    S
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-softWhite to-slate-400 bg-clip-text text-transparent">
                    Siddiqui<span className="text-accent-secondary">SaaS</span>
                  </span>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-slate-400 hover:text-softWhite p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 py-6 px-4 space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'sidebar-active text-softWhite' 
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-softWhite'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-accent-secondary' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium tracking-wide">{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-800 flex items-center gap-3">
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-sm font-bold text-[#0A0A0F] border border-slate-700">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-sm text-softWhite">{currentUser?.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header Navbar */}
        <header className="h-16 border-b border-slate-800/80 bg-darkBg-primary/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 relative">
          <div className="shimmer-line absolute inset-x-0 bottom-0 h-[1px] opacity-40 overflow-hidden" />
          
          {/* Left: Collapsible Hamburger & Page Title */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="text-slate-400 hover:text-softWhite p-2 md:hidden"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <h2 className="hidden sm:block font-bold text-lg tracking-wide text-softWhite capitalize">
              {getPageTitle()}
            </h2>
          </div>

          {/* Right: Notifications Bell & Profile badge */}
          <div className="flex items-center gap-4 relative">
            
            {/* Real-time Indicator (Pulse) */}
            <div className="hidden lg:flex items-center gap-2 border border-slate-800 bg-slate-900/60 px-3 py-1 rounded-full text-xs text-[#00E5FF]/90 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
              Live Feed Connected
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 text-slate-300 hover:text-softWhite transition-all relative ${showNotifications ? 'border-[#7C3AED]/40' : ''}`}
              >
                <FiBell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent-highlight rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-accent-highlight/30">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-80 md:w-96 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl p-4 z-50 overflow-hidden"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={markAllAsRead} 
                            className="text-xs text-accent-secondary hover:underline"
                          >
                            Mark read
                          </button>
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto py-2 space-y-2.5 my-2">
                        {notifications.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => markAsRead(notif.id)}
                              className={`p-2.5 rounded-xl border transition-all text-left group cursor-pointer relative ${
                                notif.read 
                                  ? 'bg-slate-900/20 border-slate-900/50 text-slate-400' 
                                  : 'bg-slate-900/60 border-slate-800 text-softWhite'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-xs font-semibold ${
                                  notif.type === 'warning' ? 'text-amber-400' : notif.type === 'security' ? 'text-accent-highlight' : notif.type === 'success' ? 'text-[#00E5FF]' : 'text-accent-primary'
                                }`}>
                                  {notif.title}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500">{notif.time}</span>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearNotification(notif.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-xs text-rose-400 hover:text-rose-300 px-1"
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs mt-1 leading-relaxed">{notif.message}</p>
                              {!notif.read && (
                                <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-accent-secondary rounded-full" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown Badge */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileMenu(prev => !prev);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800/60 p-1.5 pr-3 rounded-xl transition-all"
              >
                {currentUser?.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-xs font-bold text-[#0A0A0F] border border-slate-700">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden sm:block text-xs font-medium text-slate-300 max-w-[90px] truncate">
                  {currentUser?.name}
                </span>
                <FiChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-52 rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-xl shadow-2xl p-2 z-50"
                    >
                      <div className="p-3 border-b border-slate-900 text-left">
                        <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                        <p className="text-xs font-bold text-softWhite truncate">{currentUser?.email}</p>
                        <span className="inline-block px-2 py-0.5 mt-1.5 bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED] rounded-full text-[10px] font-semibold uppercase tracking-wider">
                          {currentUser?.role}
                        </span>
                      </div>
                      
                      <div className="p-1 space-y-0.5">
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/settings', { state: { activeTab: 'profile' } });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/50 hover:text-softWhite text-left"
                        >
                          <FiUser className="w-4 h-4 text-slate-400" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            navigate('/settings', { state: { activeTab: 'app' } });
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/50 hover:text-softWhite text-left"
                        >
                          <FiSettings className="w-4 h-4 text-slate-400" />
                          Settings
                        </button>
                        
                        <div className="border-t border-slate-900 my-1" />

                        <button 
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 text-left"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 18, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
