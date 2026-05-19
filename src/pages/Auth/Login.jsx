import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiZap } from 'react-icons/fi';

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed.');
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const autofillCredentials = (role) => {
    if (role === 'admin') { setEmail('sarah@skynet.com'); setPassword('password123'); }
    else                  { setEmail('john@resistance.net'); setPassword('password123'); }
  };

  return (
    <div className="min-h-screen bg-darkBg-primary text-softWhite flex items-center justify-center p-4 relative overflow-hidden">

      {/* === Animated floating background orbs === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="orb-float      absolute top-[15%]  left-[10%]  w-80 h-80 rounded-full bg-accent-primary/15  blur-[110px]" />
        <div className="orb-float-delay absolute bottom-[20%] right-[8%]  w-96 h-96 rounded-full bg-accent-secondary/10 blur-[120px]" />
        <div className="orb-float-slow  absolute top-[55%]  left-[55%]  w-64 h-64 rounded-full bg-[#FF6B6B]/8    blur-[90px]" />

        {/* Floating particle dots */}
        <div className="absolute inset-0 flex items-start justify-around pt-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? 'rgba(124,58,237,0.6)' : 'rgba(0,229,255,0.5)',
                animationDelay: `${i * 0.5}s`,
                marginTop: `${[40, 120, 60, 180, 30, 100][i]}px`
              }}
            />
          ))}
        </div>
      </div>

      {/* === Login Card === */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Animated gradient border wrapper */}
        <div className="animated-border">
          <div className="animated-border-inner glass-card p-8 rounded-[calc(1rem-1.5px)]">

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-0">

              {/* Header Logo */}
              <motion.div variants={itemVariants} className="text-center mb-8">
                <motion.div
                  className="logo-bounce w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-black text-2xl text-[#0A0A0F] mx-auto mb-4 glow-pulse-purple"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  S
                </motion.div>
                <h1 className="animated-gradient-text text-3xl font-extrabold tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-sm text-slate-400 mt-1">Sign in to manage your Siddiqui dashboard</p>
              </motion.div>

              {/* Demo Fast Logins */}
              <motion.div variants={itemVariants} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6">
                <p className="text-xs text-[#00E5FF] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiZap className="w-3 h-3" /> Demo Autofill Profiles:
                </p>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    onClick={() => autofillCredentials('admin')}
                    whileHover={{ scale: 1.03, borderColor: 'rgba(124,58,237,0.5)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 text-left px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs flex flex-col transition-colors"
                  >
                    <span className="font-semibold text-slate-300">Admin Console</span>
                    <span className="text-[10px] text-slate-500">sarah@skynet.com</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => autofillCredentials('user')}
                    whileHover={{ scale: 1.03, borderColor: 'rgba(0,229,255,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 text-left px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs flex flex-col transition-colors"
                  >
                    <span className="font-semibold text-slate-300">User Console</span>
                    <span className="text-[10px] text-slate-500">john@resistance.net</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs leading-relaxed overflow-hidden"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <motion.form onSubmit={handleSubmit} variants={containerVariants} className="space-y-5">
                {/* Email */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 tracking-wider">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <FiMail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="admin@siddiqui.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-sm text-softWhite"
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-xs text-accent-secondary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                      <FiLock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border glass-input text-sm text-softWhite"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-softWhite transition-colors"
                    >
                      {showPassword ? <FiEye className="w-4 h-4" /> : <FiEye className="w-4 h-4 opacity-40" />}
                    </button>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center text-sm font-semibold tracking-wide disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <span className="spin-ring w-5 h-5" />
                    ) : (
                      <>
                        Access Workspace <FiArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Signup link */}
              <motion.p variants={itemVariants} className="text-center text-xs text-slate-400 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-accent-secondary hover:underline font-semibold">
                  Create an account
                </Link>
              </motion.p>

            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
