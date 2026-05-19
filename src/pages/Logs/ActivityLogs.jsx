import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { FiSearch, FiFilter, FiMaximize2, FiClock, FiTrash2, FiX } from 'react-icons/fi';

const ActivityLogs = () => {
  const { showToast } = useNotifications();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // table or timeline

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getActivityLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all logs?")) {
      localStorage.setItem('saas_activity_logs', JSON.stringify([]));
      setLogs([]);
      showToast("Activity logs cleared successfully.", "success");
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: 'all', label: 'All Events' },
    { key: 'auth', label: 'Auth' },
    { key: 'api', label: 'API Key' },
    { key: 'security', label: 'Security' },
    { key: 'settings', label: 'Settings' },
    { key: 'admin', label: 'Admin Ops' }
  ];

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'auth': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'api': return 'bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF]';
      case 'security': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'settings': return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
      default: return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    }
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="animated-gradient-text">Activity Audits</span>
          </h1>
          <p className="text-sm text-slate-400">
            Immutable audits tracking user logins, configurations, API key generations, and blocked rate limit events.
          </p>
        </div>

        {/* View Mode & Clear controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 shrink-0">
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-slate-800 text-softWhite' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              List Table
            </button>
            <button 
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'timeline' ? 'bg-slate-800 text-softWhite' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Timeline UI
            </button>
          </div>

          <button
            onClick={handleClearLogs}
            className="p-2.5 rounded-xl border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"
            title="Clear All Logs"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search events, details, operators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-xs"
          />
        </div>

        {/* Category buttons */}
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedCategory === cat.key
                  ? 'border-accent-primary bg-accent-primary/10 text-softWhite shadow-[0_0_10px_rgba(124,58,237,0.25)]'
                  : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-softWhite hover:border-slate-700'
              }`}
            >
              {cat.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main logs display area */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-800/40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <p className="text-slate-500 text-sm">No activity logs matching these search criteria.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'table' ? (
            /* Table View */
            <motion.div 
              key="table"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card rounded-2xl overflow-hidden border border-slate-800/80"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4 pl-6">Timestamp</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">operator</th>
                      <th className="p-4">details</th>
                      <th className="p-4">category</th>
                      <th className="p-4 text-center pr-6">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                    {filteredLogs.map((log, i) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.35 }}
                        whileHover={{ backgroundColor: 'rgba(15,23,42,0.5)' }}
                        className="hover:bg-slate-900/30 transition-all"
                      >
                        <td className="p-4 pl-6 text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-4 font-semibold text-softWhite">
                          {log.action}
                        </td>
                        <td className="p-4 font-medium text-slate-400">
                          {log.userName}
                        </td>
                        <td className="p-4 max-w-xs truncate text-slate-400">
                          {log.details}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(log.category)}`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="p-4 text-center pr-6">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-1.5 rounded-lg border border-slate-800 hover:border-accent-secondary hover:bg-accent-secondary/10 text-slate-400 hover:text-accent-secondary transition-all"
                          >
                            <FiMaximize2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            /* Timeline View */
            <motion.div 
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative border-l border-slate-800 ml-4 pl-8 space-y-6"
            >
              {filteredLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative group"
                >
                  <motion.span
                    whileHover={{ scale: 1.5 }}
                    className={`absolute -left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-darkBg-primary flex items-center justify-center ${
                      log.category === 'auth' ? 'bg-[#7C3AED]' : log.category === 'security' ? 'bg-rose-500' : 'bg-[#00E5FF]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40" />
                  </motion.span>
                  
                  <motion.div
                    whileHover={{ x: 4, borderColor: 'rgba(124,58,237,0.3)' }}
                    className="glass-card p-5 rounded-2xl max-w-3xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(log.category)}`}>
                        {log.category}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-softWhite">{log.action}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{log.details}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-2 text-[10px] text-slate-500">
                      <span>Operator ID: {log.userId} ({log.userName})</span>
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="text-accent-secondary hover:underline flex items-center gap-1 font-semibold"
                      >
                        Inspect telemetry &rarr;
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Log Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLog(null)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-lg w-full p-6 glass-card rounded-3xl z-55 shadow-2xl border border-slate-800"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-base">Log Telemetry Audit</h3>
                  <p className="text-xs text-slate-400">Unique payload block details</p>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-softWhite p-1"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 block uppercase font-bold tracking-wider text-[9px]">Event Type</span>
                  <p className="font-semibold text-softWhite text-sm">{selectedLog.action}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 block uppercase font-bold tracking-wider text-[9px]">Details</span>
                  <p className="text-slate-300 leading-relaxed">{selectedLog.details}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider text-[9px]">Operator</span>
                    <p className="text-softWhite font-medium">{selectedLog.userName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block uppercase font-bold tracking-wider text-[9px]">Operator ID</span>
                    <code className="text-accent-secondary font-mono">{selectedLog.userId}</code>
                  </div>
                </div>

                {/* Raw JSON block */}
                <div className="space-y-1">
                  <span className="text-slate-500 block uppercase font-bold tracking-wider text-[9px]">Immutable Data Block</span>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40 select-all">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Close Audit
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ActivityLogs;
