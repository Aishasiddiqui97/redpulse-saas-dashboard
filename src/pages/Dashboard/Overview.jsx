import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { apiService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import {
  FiDollarSign, FiUsers, FiCheckCircle, FiAlertTriangle, FiCpu,
  FiArrowUpRight, FiArrowDownRight, FiPlus, FiArrowRight, FiShield,
  FiActivity, FiZap, FiTrendingUp
} from 'react-icons/fi';

/* ─── Animation Variants ─────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

/* ─── Animated Counter ───────────────────────────── */
const AnimatedValue = ({ value }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(value?.toString().replace(/[^0-9.]/g, ''));
    const prefix = value?.toString().match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = value?.toString().match(/[^0-9.]*$/)?.[0] ?? '';
    if (isNaN(numeric)) { setDisplay(value); return; }
    let start = 0;
    const duration = 1200;
    const step = 16;
    const increment = numeric / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numeric) { setDisplay(`${prefix}${numeric.toLocaleString()}${suffix}`); clearInterval(timer); }
      else { setDisplay(`${prefix}${Math.floor(start).toLocaleString()}${suffix}`); }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
};

/* ─── Stat Card ──────────────────────────────────── */
const StatCard = ({ label, value, change, changeLabel, icon: Icon, color, accentClass, delay }) => (
  <motion.div
    variants={cardVariants}
    custom={delay}
    className={`glass-card card-tilt p-6 rounded-2xl flex items-center justify-between group relative overflow-hidden`}
  >
    {/* Background orb */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 ${accentClass}`} />

    <div className="space-y-2 relative z-10">
      <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">{label}</span>
      <h3 className="text-2xl font-extrabold tracking-tight text-softWhite roll-up">
        <AnimatedValue value={value} />
      </h3>
      <div className={`flex items-center gap-1 text-xs font-bold ${color}`}>
        {color.includes('emerald') ? <FiArrowUpRight className="w-4 h-4" /> : <FiArrowDownRight className="w-4 h-4" />}
        <span>{change}</span>
        <span className="text-slate-500 font-normal ml-1">{changeLabel}</span>
      </div>
    </div>

    <div className={`w-13 h-13 w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg
      group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 relative z-10
      ${accentClass} bg-opacity-10 border-opacity-20`}
      style={{ background: 'rgba(0,0,0,0.1)' }}
    >
      <Icon className="w-6 h-6" style={{ color: color.includes('emerald') ? '#34D399' : color.includes('cyan') ? '#00E5FF' : color.includes('rose') ? '#FB7185' : '#8B5CF6' }} />
    </div>
  </motion.div>
);

/* ─── Live Activity Ticker ───────────────────────── */
const tickerMessages = [
  '🟢 User auth spike +12% — Gateway stable',
  '⚡ API cache flushed — Recharts latency 145ms',
  '🔐 Rate limiter blocked 3 IPs in last 60s',
  '📈 MRR up $1.2K today vs yesterday',
  '🟣 Siddiqui SaaS cluster: all nodes healthy',
];

const LiveTicker = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % tickerMessages.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 overflow-hidden min-w-0">
      <span className="shrink-0 flex items-center gap-1.5 text-accent-secondary font-semibold">
        <FiActivity className="w-3.5 h-3.5 heartbeat" /> LIVE
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="truncate"
        >
          {tickerMessages[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

/* ─── Progress Ring ──────────────────────────────── */
const ProgressRing = ({ label, pct, color }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} strokeWidth="5" className="stroke-slate-800 fill-none" />
          <motion.circle
            cx="32" cy="32" r={r}
            strokeWidth="5"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={inView ? { strokeDashoffset: circ - (circ * pct) / 100 } : {}}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-softWhite">
          {pct}%
        </span>
      </div>
      <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{label}</span>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────── */
const Overview = () => {
  const { isAdmin, currentUser } = useAuth();
  const { showToast, addNotification } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = apiService.getAnalyticsData();
        setAnalytics(stats);
        const logs = await apiService.getActivityLogs();
        setRecentLogs(logs.slice(0, 4));
        const keys = await apiService.getApiKeys();
        setApiKeys(keys.slice(0, 3));
      } catch (err) {
        console.error('Dashboard overview fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const triggerMockAttack = () => {
    addNotification('Security Shield Alert', 'Blocked 125 suspicious requests from malicious IP: 45.22.98.11', 'security');
    showToast('Intrusion attempt blocked successfully!', 'error');
  };
  const triggerMockSignup = () => {
    addNotification('New Customer Joined', 'Dr. Serena Kogan upgraded to Enterprise tier!', 'success');
    showToast('New customer signup recorded', 'success');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-800/40 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-800/40 animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-800/40 animate-pulse rounded-2xl" />
          <div className="h-96 bg-slate-800/40 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  const { growthMetrics, revenueData } = analytics;

  return (
    <motion.div
      className="space-y-8 page-enter"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Floating Background Orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="orb-float absolute w-96 h-96 rounded-full bg-accent-primary/8 blur-3xl -top-32 -left-32" />
        <div className="orb-float-delay absolute w-80 h-80 rounded-full bg-accent-secondary/6 blur-3xl top-1/3 right-0" />
        <div className="orb-float-slow absolute w-64 h-64 rounded-full bg-accent-highlight/5 blur-3xl bottom-20 left-1/2" />
      </div>

      {/* ── Welcome Banner ── */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="animated-gradient-text">System Workspace</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back,{' '}
            <span className="text-accent-secondary font-semibold cursor-blink">Siddiqui</span>.
            Here is the operational health of your SaaS.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={triggerMockSignup}
            className="btn-secondary btn-sheen text-xs px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
          >
            <FiTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Simulate Upgrade
          </button>
          <button
            onClick={triggerMockAttack}
            className="btn-sheen bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/25 text-rose-300 text-xs px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all"
          >
            <FiShield className="w-4 h-4 text-rose-400 heartbeat" />
            Attack Test
          </button>
          <button
            onClick={() => navigate('/api-keys')}
            className="btn-primary btn-sheen text-xs px-3.5 py-2.5 rounded-xl font-semibold flex items-center gap-1.5"
          >
            <FiPlus className="w-4 h-4" /> Create Key
          </button>
        </div>
      </motion.div>

      {/* ── Live Ticker ── */}
      <motion.div variants={fadeUp} custom={1}>
        <LiveTicker />
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        <StatCard
          label="Recurring Revenue"
          value={growthMetrics.monthlyRecurringRevenue}
          change={growthMetrics.mrrGrowth}
          changeLabel="vs last month"
          icon={FiDollarSign}
          color="text-emerald-400"
          accentClass="bg-accent-primary"
          delay={0}
        />
        <StatCard
          label="Active Subscribers"
          value={growthMetrics.activeSubscribers}
          change={growthMetrics.subscriberGrowth}
          changeLabel="vs last month"
          icon={FiUsers}
          color="text-emerald-400"
          accentClass="bg-accent-secondary"
          delay={1}
        />
        <StatCard
          label="API Success Rate"
          value={growthMetrics.apiSuccessRate}
          change="+0.05%"
          changeLabel="uptime solid"
          icon={FiCheckCircle}
          color="text-emerald-400"
          accentClass="bg-emerald-500"
          delay={2}
        />
        <StatCard
          label="Rate Limited"
          value={growthMetrics.rateLimitedRequests}
          change={growthMetrics.rateLimitGrowth}
          changeLabel="safer load"
          icon={FiAlertTriangle}
          color="text-rose-400"
          accentClass="bg-accent-highlight"
          delay={3}
        />
      </motion.div>

      {/* ── Charts Row ── */}
      <motion.div variants={fadeUp} custom={4} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-6 scan-effect">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-softWhite flex items-center gap-2">
                <FiZap className="w-4 h-4 text-accent-secondary heartbeat" />
                Operational Capacity
              </h4>
              <p className="text-xs text-slate-400">Total API workloads & monthly active workloads</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-accent-secondary hover:underline flex items-center gap-1 transition-all hover:gap-2"
            >
              More analytics <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="apiUsage" name="API Calls" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#purpleGrad)" />
                <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#cyanGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health Panel */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div>
            <h4 className="font-bold text-softWhite flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full ping-dot inline-block" />
              Live System Status
            </h4>
            <p className="text-xs text-slate-400 mb-4">Endpoint ping response checks</p>

            <div className="space-y-3.5">
              {[
                { label: 'User Authentication', ms: '12ms', color: 'emerald', pct: 98 },
                { label: 'Gateway Pipeline', ms: '24ms', color: 'emerald', pct: 95 },
                { label: 'Recharts Logs Cache', ms: '145ms', color: 'amber', pct: 72 },
              ].map(({ label, ms, color, pct }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.45 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 bg-${color}-400 rounded-full animate-pulse`} />
                      <span className="text-xs font-semibold">{label}</span>
                    </div>
                    <span className={`text-[10px] bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 px-2 py-0.5 rounded-full font-bold`}>
                      {ms}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-${color}-400`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.15, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Rings */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Performance</p>
            <div className="flex items-center justify-around">
              <ProgressRing label="CPU" pct={34} color="#7C3AED" />
              <ProgressRing label="Memory" pct={61} color="#00E5FF" />
              <ProgressRing label="Uptime" pct={99} color="#34D399" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Keys</h5>
            {apiKeys.length === 0 ? (
              <p className="text-xs text-slate-500">No active keys</p>
            ) : (
              <div className="space-y-2">
                {apiKeys.map(key => (
                  <motion.div
                    key={key.id}
                    whileHover={{ x: 3 }}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-300 font-medium">{key.name}</span>
                    <code className="text-slate-500 text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-900 font-mono">
                      {key.key}
                    </code>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Activity Logs + Status Panel ── */}
      <motion.div variants={fadeUp} custom={5} className="glass-card p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-softWhite">Security Activity Logs</h4>
            <p className="text-xs text-slate-400">Chronological list of background events</p>
          </div>
          <button
            onClick={() => navigate('/logs')}
            className="text-xs text-accent-secondary hover:underline flex items-center gap-1 transition-all hover:gap-2"
          >
            Full timeline <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline */}
          <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-4">
            <AnimatePresence>
              {recentLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative group"
                >
                  <motion.span
                    className={`absolute -left-[31px] top-1 w-3 h-3 rounded-full border border-[#0A0A0F] ${
                      log.category === 'auth' ? 'bg-[#7C3AED]' : log.category === 'security' ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    whileHover={{ scale: 1.5 }}
                  />
                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <p className="font-semibold text-softWhite group-hover:text-accent-secondary transition-colors">
                      {log.action}
                    </p>
                    <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{log.details}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cluster Status Card */}
          <motion.div
            className="aurora-bg bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated border shimmer */}
            <div className="shimmer-line absolute inset-x-0 top-0 h-[1px] opacity-50" />

            <div>
              <span className="float-badge inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF]">
                Environment Status
              </span>
              <h4 className="text-2xl font-bold mt-2 animated-gradient-text">Scale Cluster Beta</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Operating inside a sandboxed local dev virtual environment. API gateway latency is optimal and rate limiting shields are operational.
              </p>
            </div>

            {/* Mini wave loader */}
            <div className="flex items-center gap-1 mt-3">
              <span className="text-xs text-slate-500 mr-2">Signal</span>
              {[...Array(5)].map((_, i) => (
                <span key={i} className="wave-dot text-accent-secondary" style={{ height: `${8 + i * 3}px` }} />
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-4">
              <span className="text-xs text-slate-400">Current Node Version:</span>
              <code className="text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-300 font-mono">
                v24.11.1
              </code>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Overview;
