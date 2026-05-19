import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { apiService } from '../../services/api';
import { FiUser, FiSettings, FiLock, FiCheckCircle, FiGlobe, FiBell, FiSave } from 'react-icons/fi';

/* ── Variants ─────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Animated Toggle ─────────────────────────────── */
const Toggle = ({ value, onToggle, label, description }) => (
  <motion.div
    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800"
    whileHover={{ borderColor: 'rgba(124,58,237,0.3)' }}
    transition={{ duration: 0.2 }}
  >
    <div>
      <h5 className="font-bold text-xs text-softWhite">{label}</h5>
      <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">{description}</p>
    </div>
    <button
      type="button"
      onClick={onToggle}
      className="shrink-0 ml-4"
    >
      <motion.span
        className={`w-12 h-6 flex items-center rounded-full p-0.5 border transition-colors duration-300 ${
          value ? 'bg-accent-secondary/20 border-accent-secondary/40' : 'bg-slate-950 border-slate-800'
        }`}
      >
        <motion.span
          className={`w-5 h-5 rounded-full shadow-md ${value ? 'bg-[#00E5FF]' : 'bg-slate-500'}`}
          animate={{ x: value ? 24 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </motion.span>
    </button>
  </motion.div>
);

const Settings = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // App settings state
  const [globalLimit, setGlobalLimit] = useState(100000);
  const [windowSize, setWindowSize] = useState(15);
  const [alertThreshold, setAlertThreshold] = useState(85);
  const [ddosProtection, setDdosProtection] = useState(true);
  const [ipWhitelisting, setIpWhitelisting] = useState(false);
  const [appSaving, setAppSaving] = useState(false);

  useEffect(() => {
    const loadAppSettings = async () => {
      try {
        const settings = await apiService.getRateLimitSettings();
        setGlobalLimit(settings.globalLimit || 100000);
        setWindowSize(settings.windowSizeMinutes || 15);
        setAlertThreshold(settings.alertThreshold || 85);
        setDdosProtection(settings.ddosProtection !== false);
        setIpWhitelisting(settings.ipWhitelisting === true);
      } catch (err) {
        console.error('Failed to load app configurations', err);
      }
    };
    loadAppSettings();
  }, []);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name || !email) { showToast('Fields cannot be left blank', 'warning'); return; }
    setProfileSaving(true);
    try {
      await updateProfile({ name, email, avatar });
      showToast('Profile details updated successfully', 'success');
    } catch { showToast('Failed to save profile changes', 'error'); }
    finally { setProfileSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { showToast('Please fill out all password fields', 'warning'); return; }
    if (newPassword !== confirmPassword) { showToast('New passwords do not match', 'error'); return; }
    if (newPassword.length < 6) { showToast('Password must be at least 6 characters', 'warning'); return; }
    setPasswordSaving(true);
    try {
      await apiService.resetPassword(currentUser.email, newPassword);
      showToast('Password changed successfully', 'success');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch { showToast('Failed to update password', 'error'); }
    finally { setPasswordSaving(false); }
  };

  const handleUpdateAppSettings = async (e) => {
    e.preventDefault();
    setAppSaving(true);
    try {
      await apiService.updateRateLimitSettings({
        globalLimit: parseInt(globalLimit),
        windowSizeMinutes: parseInt(windowSize),
        alertThreshold: parseInt(alertThreshold),
        ddosProtection,
        ipWhitelisting,
      });
      showToast('Global gateway thresholds saved', 'success');
    } catch { showToast('Failed to update configuration', 'error'); }
    finally { setAppSaving(false); }
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  ];

  const tabs = [
    { key: 'profile', label: 'Operator Profile', icon: FiUser },
    { key: 'app', label: 'Application Settings', icon: FiSettings },
  ];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="animated-gradient-text">System Control Panel</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Modify your active operator profile settings and global microservice rate-limit thresholds.
        </p>
      </div>

      {/* ── Animated Tab Bar ── */}
      <div className="flex border-b border-slate-800 space-x-6 relative">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`pb-4 text-sm font-semibold transition-all relative flex items-center gap-2 ${
              activeTab === key ? 'text-accent-secondary' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === key && (
              <motion.span
                layoutId="tabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-secondary rounded-full"
                style={{ boxShadow: '0 0 8px rgba(0,229,255,0.6)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Profile Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6"
            >
              <motion.h4 variants={cardVariants} className="font-bold text-softWhite border-b border-slate-800 pb-3 flex items-center gap-2">
                <FiUser className="text-[#00E5FF]" /> Profile Credentials
              </motion.h4>

              <motion.form onSubmit={handleUpdateProfile} variants={containerVariants} className="space-y-4 text-left">
                {/* Avatar selector */}
                <motion.div variants={cardVariants} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Choose Avatar</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <motion.img
                      src={avatar}
                      alt="current"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-accent-secondary shadow-lg shrink-0"
                      whileHover={{ scale: 1.08 }}
                    />
                    <div className="flex gap-2">
                      {avatarPresets.map((avUrl, i) => (
                        <motion.button
                          key={i}
                          type="button"
                          onClick={() => setAvatar(avUrl)}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-9 h-9 rounded-lg overflow-hidden border-2 transition-all ${
                            avatar === avUrl ? 'border-[#00E5FF] scale-105 shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={avUrl} className="w-full h-full object-cover" alt="preset" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
                    <input
                      type="text" required value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs text-softWhite"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs text-softWhite"
                    />
                  </div>
                </motion.div>

                <motion.div variants={cardVariants} className="flex justify-end pt-2">
                  <motion.button
                    type="submit" disabled={profileSaving}
                    whileHover={!profileSaving ? { scale: 1.03, y: -1 } : {}}
                    whileTap={!profileSaving ? { scale: 0.97 } : {}}
                    className="btn-primary btn-sheen text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
                  >
                    {profileSaving
                      ? <><span className="spin-ring w-4 h-4" /> Saving...</>
                      : <><FiSave className="w-4 h-4" /> Save Profile Changes</>}
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>

            {/* Password Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card p-6 rounded-2xl space-y-6"
            >
              <h4 className="font-bold text-softWhite border-b border-slate-800 pb-3 flex items-center gap-2">
                <FiLock className="text-[#FF6B6B]" /> Security Keys
              </h4>
              <form onSubmit={handleChangePassword} className="space-y-4 text-left">
                {['Current Password', 'New Password', 'Confirm New Password'].map((lbl, i) => (
                  <div key={lbl} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{lbl}</label>
                    <input
                      type="password" required placeholder="••••••••"
                      value={[currentPassword, newPassword, confirmPassword][i]}
                      onChange={(e) => [setCurrentPassword, setNewPassword, setConfirmPassword][i](e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs text-softWhite"
                    />
                  </div>
                ))}
                <div className="pt-2">
                  <motion.button
                    type="submit" disabled={passwordSaving}
                    whileHover={!passwordSaving ? { scale: 1.02 } : {}}
                    whileTap={!passwordSaving ? { scale: 0.97 } : {}}
                    className="w-full btn-secondary btn-sheen text-xs py-2.5 rounded-xl font-semibold border-rose-500/20 hover:border-rose-500/40 text-rose-300 flex items-center justify-center gap-2"
                  >
                    {passwordSaving
                      ? <><span className="spin-ring w-4 h-4" /> Updating...</>
                      : <><FiLock className="w-4 h-4" /> Change Password</>}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          /* App Settings Tab */
          <motion.div
            key="app"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl glass-card p-6 rounded-2xl space-y-6"
          >
            <h4 className="font-bold text-softWhite border-b border-slate-800 pb-3 flex items-center gap-2">
              <FiGlobe className="text-[#00E5FF]" /> Global API rate limiting parameters
            </h4>

            <form onSubmit={handleUpdateAppSettings} className="space-y-6 text-left">
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {[
                  { label: 'Global request cap', val: globalLimit, set: setGlobalLimit, hint: 'Aggregate capacity calls / minute' },
                  { label: 'Time frame (minutes)', val: windowSize, set: setWindowSize, hint: 'Sliding request frame time' },
                  { label: 'Warning trigger (%)', val: alertThreshold, set: setAlertThreshold, hint: 'Warnings fire on this limit' },
                ].map(({ label, val, set, hint }) => (
                  <motion.div key={label} variants={cardVariants} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{label}</label>
                    <input
                      type="number" value={val}
                      onChange={(e) => set(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border glass-input text-xs text-softWhite"
                    />
                    <p className="text-[10px] text-slate-500">{hint}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="space-y-4 pt-4 border-t border-slate-800/60">
                <Toggle
                  value={ddosProtection}
                  onToggle={() => setDdosProtection(!ddosProtection)}
                  label="Intelligent DDoS Auto Protection"
                  description="Automatically shields and blacklists malicious bursts of traffic from single IPs."
                />
                <Toggle
                  value={ipWhitelisting}
                  onToggle={() => setIpWhitelisting(!ipWhitelisting)}
                  label="Strict IP Whitelisting Gate"
                  description="Only allows incoming API calls originating from white-listed, verified security host origins."
                />
              </div>

              <div className="flex justify-end pt-4">
                <motion.button
                  type="submit" disabled={appSaving}
                  whileHover={!appSaving ? { scale: 1.03, y: -1 } : {}}
                  whileTap={!appSaving ? { scale: 0.97 } : {}}
                  className="btn-primary btn-sheen text-xs px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2"
                >
                  {appSaving
                    ? <><span className="spin-ring w-4 h-4" /> Saving parameters...</>
                    : <><FiCheckCircle className="w-4 h-4" /> Save Configuration Changes</>}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Settings;
