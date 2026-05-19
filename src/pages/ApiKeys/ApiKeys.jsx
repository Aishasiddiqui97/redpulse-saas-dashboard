import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight, FiKey, FiCopy, FiCheck, FiCpu, FiAlertCircle } from 'react-icons/fi';

const ApiKeys = () => {
  const { showToast } = useNotifications();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState('');
  
  // Creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState(10000);
  const [submitting, setSubmitting] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const data = await apiService.getApiKeys();
      setKeys(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("API key copied to clipboard", "success");
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName) {
      showToast("Please enter a key identifier name", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const newKey = await apiService.createApiKey(newKeyName, parseInt(newKeyLimit));
      setKeys(prev => [...prev, newKey]);
      showToast(`Key "${newKeyName}" successfully generated`, "success");
      setNewKeyName('');
      setShowCreateModal(false);
    } catch (err) {
      showToast(err.message || "Failed to generate key", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'revoked' : 'active';
    try {
      const updated = await apiService.updateApiKeyStatus(id, nextStatus);
      setKeys(prev => prev.map(k => k.id === id ? updated : k));
      showToast(`API Key status updated to ${nextStatus}`, "success");
    } catch (err) {
      showToast("Error updating key status", "error");
    }
  };

  const handleDeleteKey = async (id) => {
    if (window.confirm("Are you sure you want to delete this API Key? This action is permanent and will block any active traffic using this token.")) {
      try {
        await apiService.deleteApiKey(id);
        setKeys(prev => prev.filter(k => k.id !== id));
        showToast("API Key deleted successfully", "success");
      } catch (err) {
        showToast("Error deleting key", "error");
      }
    }
  };

  // Stats calculation
  const activeKeysCount = keys.filter(k => k.status === 'active').length;
  const totalCalls = keys.reduce((acc, curr) => acc + curr.usage, 0);
  const aggregateLimit = keys.reduce((acc, curr) => acc + curr.limit, 0);
  const averageUsagePercentage = aggregateLimit > 0 ? ((totalCalls / aggregateLimit) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-softWhite to-slate-400 bg-clip-text text-transparent">
            API Gateways
          </h1>
          <p className="text-sm text-slate-400">
            Generate and provision API security keys, adjust rate limits, and audit endpoint traffic metrics.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center gap-1.5 self-start"
        >
          <FiPlus className="w-4.5 h-4.5" /> Provision New Key
        </button>
      </div>

      {/* ApiUsageCards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
            <FiCpu className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Provisioned Tokens</span>
            <h3 className="text-2xl font-bold text-softWhite mt-0.5">{keys.length} Keys</h3>
            <p className="text-[11px] text-[#00E5FF] font-medium mt-0.5">{activeKeysCount} operational & active</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] shrink-0">
            <FiKey className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aggregate Traffic Usage</span>
            <h3 className="text-2xl font-bold text-softWhite mt-0.5">{totalCalls.toLocaleString()} / {aggregateLimit.toLocaleString()}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{averageUsagePercentage}% global capacity consumed</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Global Rate Limit Alert</span>
            <h3 className="text-2xl font-bold text-softWhite mt-0.5">85% Threshold</h3>
            <p className="text-[11px] text-amber-400 font-medium mt-0.5">Auto warnings will fire on emails</p>
          </div>
        </div>
      </div>

      {/* RateLimitTable Section */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-800/40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
          <FiKey className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold">No active API keys found.</p>
          <p className="text-xs text-slate-500 mt-1">Get started by clicking the "Provision New Key" button.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Key Identifier</th>
                  <th className="p-4">Key Value</th>
                  <th className="p-4">usage / limit</th>
                  <th className="p-4">Usage capacity gauge</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {keys.map((key) => {
                  const usagePercentage = ((key.usage / key.limit) * 100).toFixed(0);
                  const isLimitHigh = parseInt(usagePercentage) >= 80;

                  return (
                    <tr key={key.id} className="hover:bg-slate-900/30 transition-all">
                      {/* Name */}
                      <td className="p-4 pl-6">
                        <div>
                          <p className="font-bold text-softWhite text-sm">{key.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Provisioned: {key.created}</p>
                        </div>
                      </td>

                      {/* Token Value with copy */}
                      <td className="p-4 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-950/60 border border-slate-900 px-2.5 py-1 rounded text-slate-300">
                            {key.key}
                          </code>
                          <button
                            onClick={() => handleCopy(key.id, key.key)}
                            className="p-1 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-softWhite transition-all"
                            title="Copy Key"
                          >
                            {copiedId === key.id ? (
                              <FiCheck className="w-3.5 h-3.5 text-emerald-400 animate-scale-up" />
                            ) : (
                              <FiCopy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Limits */}
                      <td className="p-4 font-medium text-slate-300">
                        {key.usage.toLocaleString()} / {key.limit.toLocaleString()}
                      </td>

                      {/* Capacity Gauge Bar */}
                      <td className="p-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                            <span>Limit consumed</span>
                            <span className={isLimitHigh ? 'text-rose-400' : 'text-slate-300'}>{usagePercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                isLimitHigh ? 'bg-rose-500' : 'bg-[#00E5FF]'
                              }`}
                              style={{ width: `${Math.min(parseInt(usagePercentage), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                          key.status === 'active' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                          {key.status}
                        </span>
                      </td>

                      {/* Controls */}
                      <td className="p-4 text-right pr-6 space-x-1">
                        <button
                          onClick={() => handleToggleStatus(key.id, key.status)}
                          className={`p-1.5 rounded-lg border transition-all inline-flex items-center ${
                            key.status === 'active'
                              ? 'border-slate-800 hover:border-amber-500/30 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400'
                              : 'border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'
                          }`}
                          title={key.status === 'active' ? 'Revoke Key' : 'Activate Key'}
                        >
                          {key.status === 'active' ? <FiToggleRight className="w-4.5 h-4.5" /> : <FiToggleLeft className="w-4.5 h-4.5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all inline-flex items-center"
                          title="Delete Key"
                        >
                          <FiTrash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal (ApiKeyManager Form wizard) */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md w-full p-6 glass-card rounded-3xl z-55 shadow-2xl border border-slate-800"
            >
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-base">Provision API Token</h3>
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-softWhite"
                  >
                    &times;
                  </button>
                </div>

                <div className="space-y-4 py-3 text-left">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Key Label Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Production Client Mobile App"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs text-softWhite"
                    />
                  </div>

                  {/* Limit selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Monthly Request Limit</label>
                    <select
                      value={newKeyLimit}
                      onChange={(e) => setNewKeyLimit(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs text-softWhite"
                    >
                      <option value="5000">5,000 requests/mo (Starter)</option>
                      <option value="10000">10,000 requests/mo (Team)</option>
                      <option value="50000">50,000 requests/mo (Business)</option>
                      <option value="100000">100,000 requests/mo (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    {submitting ? 'Generating...' : 'Provision Key'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiKeys;
