import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiUserCheck, FiUserX, FiShield, FiX, FiCheck } from 'react-icons/fi';

const Users = () => {
  const { showToast } = useNotifications();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId, currentStatus) => {
    // Prevent admin from blocking themselves
    if (userId === currentUser.id) {
      showToast("Operation rejected: You cannot block your own Administrator session.", "error");
      return;
    }

    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const updated = await apiService.updateUserStatus(userId, nextStatus);
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      showToast(`User status updated to ${nextStatus}`, "success");
    } catch (err) {
      showToast("Error updating user status", "error");
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    if (userId === currentUser.id) {
      showToast("Operation rejected: You cannot demote your own Administrator privileges.", "error");
      return;
    }

    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const usersList = JSON.parse(localStorage.getItem('saas_users') || '[]');
      const index = usersList.findIndex(u => u.id === userId);
      if (index !== -1) {
        usersList[index].role = nextRole;
        localStorage.setItem('saas_users', JSON.stringify(usersList));
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
        
        await apiService.addActivityLog(
          'User Role Modified',
          `Privileges for user "${usersList[index].name}" changed to ${nextRole}`,
          'admin'
        );
        showToast(`User role successfully changed to ${nextRole}`, "success");
      }
    } catch (err) {
      showToast("Error updating user privilege", "error");
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-softWhite to-slate-400 bg-clip-text text-transparent">
          User Telemetries
        </h1>
        <p className="text-sm text-slate-400">
          Supervise operational SaaS access credentials, promote privilege roles, and toggle session blocks on active users.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
            <FiSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search full name, email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border glass-input text-xs"
          />
        </div>

        {/* Filter selection */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1 w-full md:w-auto">
          <button 
            onClick={() => setRoleFilter('all')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'all' ? 'bg-slate-800 text-softWhite' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            All Accounts
          </button>
          <button 
            onClick={() => setRoleFilter('admin')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'admin' ? 'bg-slate-800 text-softWhite' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Admins
          </button>
          <button 
            onClick={() => setRoleFilter('user')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              roleFilter === 'user' ? 'bg-slate-800 text-softWhite' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Users table list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-800/40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <p className="text-slate-500 text-sm">No profiles match the filter options.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4 pl-6">Full Profile</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Security Level</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4 text-center pr-6">access controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/30 transition-all">
                    {/* Full Profile */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-softWhite text-sm">{user.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Account ID: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4 font-medium text-slate-400">
                      {user.email}
                    </td>

                    {/* Security level (Role) */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-[#7C3AED]/10 border-[#7C3AED]/20 text-[#7C3AED]' 
                          : 'bg-[#00E5FF]/10 border-[#00E5FF]/20 text-[#00E5FF]'
                      }`}>
                        {user.role}
                      </span>
                    </td>

                    {/* Operational Status */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                        user.status === 'active' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : user.status === 'blocked'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                          : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center pr-6 space-x-1.5">
                      {/* Toggle Privileges */}
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="p-1.5 rounded-lg border border-slate-800 hover:border-[#7C3AED] hover:bg-[#7C3AED]/10 text-slate-400 hover:text-softWhite transition-all inline-flex items-center"
                        title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                      >
                        <FiShield className="w-4 h-4 text-slate-400 hover:text-[#7C3AED]" />
                      </button>

                      {/* Toggle block/unblock */}
                      <button
                        onClick={() => handleUpdateStatus(user.id, user.status)}
                        className={`p-1.5 rounded-lg border transition-all inline-flex items-center ${
                          user.status === 'active'
                            ? 'border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400'
                            : 'border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'
                        }`}
                        title={user.status === 'active' ? "Block User Account" : "Unblock Account"}
                      >
                        {user.status === 'active' ? (
                          <FiUserX className="w-4 h-4" />
                        ) : (
                          <FiUserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
