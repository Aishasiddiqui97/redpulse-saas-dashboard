import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem('saas_notifications');
    if (stored) return JSON.parse(stored);
    
    return [
      { id: '1', title: 'API Limit Warning', message: 'Staging Sandbox key is at 89% usage.', type: 'warning', time: '10m ago', read: false },
      { id: '2', title: 'DDOS Protection Triggered', message: 'Rate-limiter auto-blocked 42 requests from 198.51.100.12', type: 'security', time: '1h ago', read: false },
      { id: '3', title: 'New User Registered', message: 'Marcus Wright has created a user profile.', type: 'info', time: '3h ago', read: true },
      { id: '4', title: 'Invoice Paid', message: 'Billing cycle for May completed successfully.', type: 'success', time: '1d ago', read: true }
    ];
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('saas_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Toast Functionality
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Notification Operations
  const addNotification = (title, message, type = 'info') => {
    const newNotif = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      time: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`${title}: ${message}`, type);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = {
    notifications,
    unreadCount,
    toasts,
    showToast,
    removeToast,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Dynamic Toast Renderer overlay */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg flex items-center justify-between gap-3 border transition-all duration-300 transform translate-y-0 opacity-100 hover:scale-102 cursor-pointer animate-fade-in ${
              toast.type === 'success' 
                ? 'bg-slate-900/90 border-[#00E5FF]/30 text-softWhite shadow-[#00E5FF]/10' 
                : toast.type === 'warning'
                ? 'bg-slate-900/90 border-amber-500/30 text-amber-200'
                : toast.type === 'error'
                ? 'bg-slate-900/90 border-rose-500/30 text-rose-200 shadow-rose-900/10'
                : 'bg-slate-900/90 border-[#7C3AED]/30 text-softWhite shadow-[#7C3AED]/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${
                toast.type === 'success' ? 'bg-[#00E5FF]' : toast.type === 'warning' ? 'bg-amber-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-[#7C3AED]'
              }`} />
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button className="text-xs opacity-50 hover:opacity-100">&times;</button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
