import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi';

const Signup = () => {
  const { signup } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);

  // Simple password strength meter logic
  useEffect(() => {
    let score = 0;
    if (!password) {
      setStrength(0);
      return;
    }
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(score);
  }, [password]);

  const getStrengthLabel = () => {
    if (strength === 0) return { label: 'Empty', color: 'bg-slate-700', text: 'text-slate-400' };
    if (strength <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (strength <= 4) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-[#00E5FF]', text: 'text-[#00E5FF]' };
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup(name, email, password);
      showToast('Account created successfully! You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      showToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const strengthDetails = getStrengthLabel();

  return (
    <div className="min-h-screen bg-darkBg-primary text-softWhite flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary/5 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-3xl relative z-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-black text-xl text-[#0A0A0F] mx-auto shadow-lg shadow-accent-primary/20 mb-4">
            S
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-softWhite to-slate-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm text-slate-400 mt-1">Get started with your free Siddiqui dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FiUser className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Marcus Wright"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm text-softWhite"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <FiMail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                placeholder="marcus@projectangel.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-sm text-softWhite"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 tracking-wider">Password</label>
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
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border glass-input text-sm text-softWhite"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-softWhite"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Meter UI */}
            {password && (
              <div className="pt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
                  <span className="text-slate-400">Password Strength</span>
                  <span className={strengthDetails.text}>{strengthDetails.label}</span>
                </div>
                <div className="flex gap-1 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strengthDetails.color}`} style={{ width: `${(strength / 5) * 100}%` }} />
                </div>
                <p className="text-[10px] text-slate-500">
                  Include length, capitalization, numbers & special characters
                </p>
              </div>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center gap-2.5 py-1.5">
            <input 
              type="checkbox" 
              required 
              id="terms"
              className="accent-accent-primary w-4 h-4 rounded border-slate-700 bg-slate-900 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-400 cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-accent-secondary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-accent-secondary hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 rounded-xl flex items-center justify-center text-sm font-semibold tracking-wide disabled:opacity-50 mt-1"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <>
                Register Account <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-secondary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
