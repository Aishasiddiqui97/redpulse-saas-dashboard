// Mock API Service with LocalStorage Persistence to simulate real backend interaction.
import axios from 'axios';

// Initialize localStorage seed data if not present
const seedLocalStorage = () => {
  if (!localStorage.getItem('saas_users')) {
    localStorage.setItem('saas_users', JSON.stringify([
      { id: '1', name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'admin', status: 'active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { id: '2', name: 'John Connor', email: 'john@resistance.net', role: 'user', status: 'active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
      { id: '3', name: 'T-800 Model 101', email: 'terminator@cyberdyne.com', role: 'user', status: 'active', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150' },
      { id: '4', name: 'Marcus Wright', email: 'marcus@projectangel.org', role: 'user', status: 'inactive', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { id: '5', name: 'Dr. Serena Kogan', email: 'serena@cyberdyne.com', role: 'user', status: 'blocked', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' }
    ]));
  }

  if (!localStorage.getItem('saas_api_keys')) {
    localStorage.setItem('saas_api_keys', JSON.stringify([
      { id: 'key_1', name: 'Production Main API', key: 'sk_live_51Nv2...a89f', created: '2026-02-14', status: 'active', usage: 14205, limit: 50000 },
      { id: 'key_2', name: 'Staging Sandbox', key: 'sk_test_51Nv2...7c1b', created: '2026-04-10', status: 'active', usage: 4890, limit: 10000 },
      { id: 'key_3', name: 'Analytics Webhook', key: 'sk_live_51Ob8...d5e2', created: '2026-05-01', status: 'revoked', usage: 980, limit: 5000 }
    ]));
  }

  if (!localStorage.getItem('saas_activity_logs')) {
    localStorage.setItem('saas_activity_logs', JSON.stringify([
      { id: 'log_1', userId: '1', userName: 'Sarah Connor', action: 'User login', details: 'Successful login from IP 192.168.1.45', category: 'auth', timestamp: '2026-05-19T21:40:00Z' },
      { id: 'log_2', userId: '1', userName: 'Sarah Connor', action: 'Generated API Key', details: 'Created staging sandbox key', category: 'api', timestamp: '2026-05-19T20:15:00Z' },
      { id: 'log_3', userId: '2', userName: 'John Connor', action: 'API Request Limit Exceeded', details: 'Staging key hit 90% threshold', category: 'warning', timestamp: '2026-05-19T18:30:00Z' },
      { id: 'log_4', userId: '3', userName: 'T-800 Model 101', action: 'Data export', details: 'Exported active users list as CSV', category: 'data', timestamp: '2026-05-19T16:05:00Z' },
      { id: 'log_5', userId: '5', userName: 'Dr. Serena Kogan', action: 'Blocked request', details: 'Unauthorized access attempt to /v1/admin/config', category: 'security', timestamp: '2026-05-19T15:20:00Z' },
      { id: 'log_6', userId: '1', userName: 'Sarah Connor', action: 'Settings Updated', details: 'Changed Rate Limiting threshold to 100/min', category: 'settings', timestamp: '2026-05-19T14:10:00Z' }
    ]));
  }

  if (!localStorage.getItem('saas_rate_limit_settings')) {
    localStorage.setItem('saas_rate_limit_settings', JSON.stringify({
      globalLimit: 100000,
      windowSizeMinutes: 15,
      alertThreshold: 85,
      defaultRoleLimit: 1000,
      ddosProtection: true,
      ipWhitelisting: false
    }));
  }
};

// Execute seeding
seedLocalStorage();

// Helper to simulate network delay
const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const apiService = {
  // --- AUTH SERVICES ---
  login: async (email, password) => {
    await delay(1000);
    // Hardcoded credentials for Demo
    if (email === 'aishaanjumsiddiqui97@gmail.com' && password === 'L@r@1997') {
      const aishaUser = { id: '0', name: 'Aisha A. Siddiqui', email: 'aishaanjumsiddiqui97@gmail.com', role: 'admin', status: 'active', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Aisha' };
      localStorage.setItem('saas_current_user', JSON.stringify(aishaUser));
      return { success: true, user: aishaUser, token: 'mock-jwt-aisha-token' };
    } else if (email === 'admin@saas.com' && password === 'password123') {
      const adminUser = { id: '1', name: 'Sarah Connor', email: 'admin@saas.com', role: 'admin', status: 'active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' };
      localStorage.setItem('saas_current_user', JSON.stringify(adminUser));
      return { success: true, user: adminUser, token: 'mock-jwt-admin-token' };
    } else if (email === 'user@saas.com' && password === 'password123') {
      const normalUser = { id: '2', name: 'John Connor', email: 'user@saas.com', role: 'user', status: 'active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' };
      localStorage.setItem('saas_current_user', JSON.stringify(normalUser));
      return { success: true, user: normalUser, token: 'mock-jwt-user-token' };
    }
    
    // Check if user exists in local user database
    const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
    const match = users.find(u => u.email === email);
    if (match) {
      const savedPassword = match.password || 'password123'; // Fallback for seeded users
      if (password === savedPassword) {
        if (match.status === 'blocked') {
          throw new Error('Your account is blocked. Contact support.');
        }
        localStorage.setItem('saas_current_user', JSON.stringify(match));
        return { success: true, user: match, token: `mock-jwt-token-${match.id}` };
      }
    }
    
    throw new Error('Invalid email or password. Use: admin@saas.com / password123 or user@saas.com / password123');
  },

  signup: async (name, email, password) => {
    await delay(1200);
    const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error('Email address already registered.');
    }
    
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      password, // Persisting chosen password in localStorage
      role: 'user', // defaults to user
      status: 'active',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    users.push(newUser);
    localStorage.setItem('saas_users', JSON.stringify(users));

    // Log the sign up
    const logs = JSON.parse(localStorage.getItem('saas_activity_logs') || '[]');
    logs.unshift({
      id: Math.random().toString(36).substring(2, 9),
      userId: newUser.id,
      userName: newUser.name,
      action: 'Account Signup',
      details: 'Registered a new user profile',
      category: 'auth',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('saas_activity_logs', JSON.stringify(logs));

    return { success: true, user: newUser };
  },

  forgotPassword: async (email) => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
    const userExists = users.some(u => u.email === email) || email === 'admin@saas.com' || email === 'user@saas.com';
    if (!userExists) {
      throw new Error('Email address not found.');
    }
    return { success: true, message: 'OTP verification code sent to your email.' };
  },

  verifyOtp: async (email, otp) => {
    await delay(800);
    if (otp !== '123456') {
      throw new Error('Invalid OTP. Use 123456 for demo.');
    }
    return { success: true, resetToken: 'mock-reset-token-123456' };
  },

  resetPassword: async (email, password) => {
    await delay(1000);
    return { success: true, message: 'Password has been successfully updated.' };
  },

  // --- USER MANAGEMENT (Admin-only simulated checks are done in frontend but state persists here) ---
  getUsers: async () => {
    await delay(500);
    return JSON.parse(localStorage.getItem('saas_users') || '[]');
  },

  updateUserStatus: async (userId, status) => {
    await delay(400);
    const users = JSON.parse(localStorage.getItem('saas_users') || '[]');
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index].status = status;
      localStorage.setItem('saas_users', JSON.stringify(users));
      
      // Log the change
      const logs = JSON.parse(localStorage.getItem('saas_activity_logs') || '[]');
      logs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        userId: 'admin_id',
        userName: 'Admin',
        action: `User status changed to ${status}`,
        details: `Updated status for user: ${users[index].name}`,
        category: 'admin',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('saas_activity_logs', JSON.stringify(logs));
      
      return users[index];
    }
    throw new Error('User not found.');
  },

  // --- API KEY MANAGER ---
  getApiKeys: async () => {
    await delay(400);
    return JSON.parse(localStorage.getItem('saas_api_keys') || '[]');
  },

  createApiKey: async (name, limit = 10000) => {
    await delay(600);
    const keys = JSON.parse(localStorage.getItem('saas_api_keys') || '[]');
    const randomKey = `sk_live_51` + Math.random().toString(36).substring(2, 6) + '...' + Math.random().toString(36).substring(2, 6);
    const newKey = {
      id: 'key_' + Math.random().toString(36).substring(2, 9),
      name,
      key: randomKey,
      created: new Date().toISOString().split('T')[0],
      status: 'active',
      usage: 0,
      limit
    };
    keys.push(newKey);
    localStorage.setItem('saas_api_keys', JSON.stringify(keys));

    // Log the creation
    const logs = JSON.parse(localStorage.getItem('saas_activity_logs') || '[]');
    logs.unshift({
      id: Math.random().toString(36).substring(2, 9),
      userId: 'current',
      userName: 'Current User',
      action: 'Created API Key',
      details: `Generated key: ${name}`,
      category: 'api',
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('saas_activity_logs', JSON.stringify(logs));

    return newKey;
  },

  updateApiKeyStatus: async (keyId, status) => {
    await delay(400);
    const keys = JSON.parse(localStorage.getItem('saas_api_keys') || '[]');
    const index = keys.findIndex(k => k.id === keyId);
    if (index !== -1) {
      keys[index].status = status;
      localStorage.setItem('saas_api_keys', JSON.stringify(keys));

      // Log the change
      const logs = JSON.parse(localStorage.getItem('saas_activity_logs') || '[]');
      logs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        userId: 'current',
        userName: 'Current User',
        action: `API Key Status Updated`,
        details: `API Key '${keys[index].name}' status changed to ${status}`,
        category: 'api',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('saas_activity_logs', JSON.stringify(logs));

      return keys[index];
    }
    throw new Error('API Key not found.');
  },

  deleteApiKey: async (keyId) => {
    await delay(400);
    const keys = JSON.parse(localStorage.getItem('saas_api_keys') || '[]');
    const filtered = keys.filter(k => k.id !== keyId);
    localStorage.setItem('saas_api_keys', JSON.stringify(filtered));
    return { success: true };
  },

  // --- ACTIVITY LOGS ---
  getActivityLogs: async () => {
    await delay(300);
    return JSON.parse(localStorage.getItem('saas_activity_logs') || '[]');
  },

  addActivityLog: async (action, details, category) => {
    const logs = JSON.parse(localStorage.getItem('saas_activity_logs') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('saas_current_user') || '{}');
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      userId: currentUser.id || 'anonymous',
      userName: currentUser.name || 'Anonymous',
      action,
      details,
      category,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem('saas_activity_logs', JSON.stringify(logs));
    return newLog;
  },

  // --- SETTINGS ---
  getRateLimitSettings: async () => {
    await delay(400);
    return JSON.parse(localStorage.getItem('saas_rate_limit_settings') || '{}');
  },

  updateRateLimitSettings: async (settings) => {
    await delay(600);
    localStorage.setItem('saas_rate_limit_settings', JSON.stringify(settings));

    // Log the change
    await apiService.addActivityLog(
      'Settings Updated',
      'Modified global API rate limiting settings & thresholds',
      'settings'
    );
    return settings;
  },

  // --- ANALYTICS SEED GENERATOR ---
  getAnalyticsData: () => {
    // Generates complex structured data for Recharts
    const revenueData = [
      { name: 'Jan', revenue: 45000, activeUsers: 12000, apiUsage: 350000, growth: 12 },
      { name: 'Feb', revenue: 52000, activeUsers: 15400, apiUsage: 420000, growth: 15 },
      { name: 'Mar', revenue: 61000, activeUsers: 19800, apiUsage: 580000, growth: 18 },
      { name: 'Apr', revenue: 68000, activeUsers: 24500, apiUsage: 710000, growth: 22 },
      { name: 'May', revenue: 84000, activeUsers: 31200, apiUsage: 890000, growth: 28 },
      { name: 'Jun', revenue: 98000, activeUsers: 39500, apiUsage: 1250000, growth: 34 }
    ];

    const apiPerformanceData = [
      { name: '00:00', ok: 420, blocked: 2, latency: 12 },
      { name: '04:00', ok: 310, blocked: 0, latency: 9 },
      { name: '08:00', ok: 890, blocked: 18, latency: 25 },
      { name: '12:00', ok: 1450, blocked: 42, latency: 32 },
      { name: '16:00', ok: 1200, blocked: 24, latency: 18 },
      { name: '20:00', ok: 780, blocked: 5, latency: 14 }
    ];

    const resourceDistribution = [
      { name: 'Auth Module', value: 35, color: '#7C3AED' },
      { name: 'Data Pipeline', value: 40, color: '#00E5FF' },
      { name: 'Admin Endpoints', value: 15, color: '#FF6B6B' },
      { name: 'Static Assets', value: 10, color: '#38BDF8' }
    ];

    const growthMetrics = {
      monthlyRecurringRevenue: '$98,400',
      mrrGrowth: '+16.5%',
      activeSubscribers: '3,842',
      subscriberGrowth: '+12.4%',
      apiSuccessRate: '99.82%',
      rateLimitedRequests: '2,402',
      rateLimitGrowth: '-4.8%'
    };

    return {
      revenueData,
      apiPerformanceData,
      resourceDistribution,
      growthMetrics
    };
  }
};
