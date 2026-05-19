import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FiMail, FiLock, FiKey, FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ForgotPassword = () => {
  const { forgotPassword, verifyOtp, resetPassword } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      showToast('OTP sent! Use 123456 for the demo.', 'success');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Verification failed.');
      showToast(err.message || 'Error sending OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP verification code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await verifyOtp(email, otp);
      showToast('OTP verified successfully.', 'success');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid code.');
      showToast(err.message || 'Invalid OTP code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await resetPassword(email, newPassword);
      showToast('Password reset successfully. Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Password reset failed.');
      showToast(err.message || 'Reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg-primary text-softWhite flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-secondary/5 blur-[100px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-3xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-black text-xl text-[#0A0A0F] mx-auto shadow-lg shadow-accent-primary/20 mb-4">
            N
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-softWhite to-slate-400 bg-clip-text text-transparent">
            {step === 1 && 'Recover Password'}
            {step === 2 && 'Verify Account'}
            {step === 3 && 'New Credentials'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {step === 1 && 'Enter your email to request an OTP code'}
            {step === 2 && 'Enter verification code sent to your inbox'}
            {step === 3 && 'Choose a strong, secure new password'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleEmailSubmit}
              className="space-y-5"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FiMail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="admin@saas.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-sm text-softWhite"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center text-sm font-semibold tracking-wide disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Send OTP Code <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleOtpSubmit}
              className="space-y-5"
            >
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
                <p className="text-xs text-[#00E5FF] font-semibold uppercase tracking-wider mb-1">
                  Demo Passcode Hint:
                </p>
                <code className="text-sm font-bold text-softWhite tracking-widest bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  123456
                </code>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 tracking-wider">6-Digit Verification OTP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FiKey className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-center text-lg font-bold tracking-widest text-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary w-1/3 py-3 rounded-xl flex items-center justify-center text-sm font-semibold"
                >
                  <FiArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-2/3 py-3 rounded-xl flex items-center justify-center text-sm font-semibold tracking-wide disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <>
                      Verify Code <FiCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetSubmit}
              className="space-y-4"
            >
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FiLock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-sm text-softWhite"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FiLock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border glass-input text-sm text-softWhite"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center text-sm font-semibold tracking-wide disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    Confirm Reset <FiCheck className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="text-center mt-6">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-softWhite font-semibold transition-all">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
