import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { apiService } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  FiTrendingUp, FiActivity, FiServer, FiLock, FiChevronRight, FiClock,
  FiZap, FiBarChart2
} from 'react-icons/fi';

/* ── Shared Variants ─────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Animated Counter ────────────────────────────── */
const AnimatedValue = ({ value, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    const prefix = String(value).match(/^[^0-9]*/)?.[0] ?? '';
    const sfx = suffix || (String(value).match(/[^0-9.]*$/)?.[0] ?? '');
    if (isNaN(numeric)) { setDisplay(value); return; }
    let start = 0;
    const duration = 1200;
    const step = 16;
    const inc = numeric / (duration / step);
    const timer = setInterval(() => {
      start += inc;
      if (start >= numeric) { setDisplay(`${prefix}${numeric.toLocaleString()}${sfx}`); clearInterval(timer); }
      else { setDisplay(`${prefix}${Math.floor(start).toLocaleString()}${sfx}`); }
    }, step);
    return () => clearInterval(timer);
  }, [inView, value, suffix]);

  return <span ref={ref}>{display}</span>;
};

/* ── Stat Card ───────────────────────────────────── */
const StatCard = ({ icon: Icon, iconColor, iconBg, label, value, sub, subColor, delay }) => (
  <motion.div
    variants={cardVariants}
    custom={delay}
    whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(124,58,237,0.15)' }}
    className="glass-card p-6 rounded-2xl flex items-center gap-4 group cursor-default"
  >
    <motion.div
      className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${iconBg} ${iconColor}`}
      whileHover={{ rotate: 12, scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Icon className="w-6 h-6" />
    </motion.div>
    <div>
      <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-softWhite">
        <AnimatedValue value={value} />
      </h3>
      <span className={`text-[11px] font-semibold ${subColor}`}>{sub}</span>
    </div>
  </motion.div>
);

/* ── Main Page ───────────────────────────────────── */
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = apiService.getAnalyticsData();
        setAnalytics(data);
      } catch (err) {
        console.error('Analytics fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-800/40 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-800/40 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-800/40 animate-pulse rounded-2xl" />
          <div className="h-96 bg-slate-800/40 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  const { revenueData, apiPerformanceData, resourceDistribution, growthMetrics } = analytics;

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* ── Page Title ── */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="animated-gradient-text">System Analytics</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Deep-dive telemetry — revenue performance, active subscribers, and microservice consumption rates.
        </p>
      </motion.div>

      {/* ── Stat Cards ── */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants}>
        <StatCard
          icon={FiTrendingUp}
          iconColor="text-accent-primary"
          iconBg="bg-accent-primary/10 border-accent-primary/20"
          label="MRR Expansion"
          value={growthMetrics.monthlyRecurringRevenue}
          sub={`${growthMetrics.mrrGrowth} monthly increase`}
          subColor="text-emerald-400"
          delay={0}
        />
        <StatCard
          icon={FiActivity}
          iconColor="text-[#00E5FF]"
          iconBg="bg-[#00E5FF]/10 border-[#00E5FF]/20"
          label="Gateway Load"
          value="1.25M requests"
          sub="99.82% successful deliveries"
          subColor="text-emerald-400"
          delay={1}
        />
        <StatCard
          icon={FiClock}
          iconColor="text-[#FF6B6B]"
          iconBg="bg-[#FF6B6B]/10 border-[#FF6B6B]/20"
          label="Average Latency"
          value="18.5 ms"
          sub="Edge routing activated"
          subColor="text-[#00E5FF]"
          delay={2}
        />
      </motion.div>

      {/* ── Charts Row 1 ── */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={containerVariants}>
        {/* Area Chart */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl space-y-6 scan-effect"
        >
          <div>
            <h4 className="font-bold text-softWhite flex items-center gap-2">
              <FiZap className="w-4 h-4 text-accent-primary heartbeat" />
              MRR & Active Users Timeline
            </h4>
            <p className="text-xs text-slate-400">Quarterly growth trajectory mapping</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="revenue" name="MRR ($)" stroke="#7C3AED" strokeWidth={2} fillOpacity={1} fill="url(#purpleG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl space-y-6 scan-effect"
        >
          <div>
            <h4 className="font-bold text-softWhite flex items-center gap-2">
              <FiBarChart2 className="w-4 h-4 text-accent-secondary heartbeat" />
              API Request Load Distribution
            </h4>
            <p className="text-xs text-slate-400">HTTP 200 OK vs rate-limited blockers</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={apiPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="ok" name="Delivered Requests" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="blocked" name="Blocked/Throttled" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Charts Row 2 ── */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6" variants={containerVariants}>
        {/* Pie Chart */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl space-y-6 flex flex-col justify-between"
        >
          <div>
            <h4 className="font-bold text-softWhite">Endpoint Consumption</h4>
            <p className="text-xs text-slate-400">Microservice distribution breakdown</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceDistribution}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {resourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span className="text-2xl font-bold text-softWhite">100%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Capacity</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {resourceDistribution.map((entry, i) => (
              <motion.div
                key={entry.name}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400 truncate">{entry.name} ({entry.value}%)</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Latency Chart */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="glass-card p-6 rounded-2xl lg:col-span-2 space-y-6 scan-effect"
        >
          <div>
            <h4 className="font-bold text-softWhite flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-secondary ping-dot inline-block" />
              Endpoint Pipeline Latencies (ms)
            </h4>
            <p className="text-xs text-slate-400">Real-time pings over chronological windows</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={apiPerformanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#00E5FF" strokeWidth={2.5} fillOpacity={1} fill="url(#cyanGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Analytics;
