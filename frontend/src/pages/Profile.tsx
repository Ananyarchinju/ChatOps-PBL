import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, MessageSquare, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user, login } = useAuth();
  const [commandsCount, setCommandsCount] = useState<number | string>('...');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('chatops_token');
        const res = await axios.get('/api/chat/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCommandsCount(res.data.length);
      } catch (e) {
        setCommandsCount('Error loading');
      }
    };
    fetchHistory();
  }, []);

  const handleUpdate = async () => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('chatops_token');
      const res = await axios.put('/api/auth/profile', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local auth context
      login(token!, res.data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to update profile');
    }
  };

  const getRank = () => {
    if (typeof commandsCount !== 'number') return 'Loading...';
    if (commandsCount < 5) return 'Junior Operator';
    if (commandsCount < 20) return 'Senior Operator';
    return 'ChatOps Commander';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-slate-400 mt-1">Manage your account settings</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Banner: Profile Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-800 z-10 shrink-0">
            <span className="text-4xl font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          
          <div className="z-10 text-center md:text-left flex-grow">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-slate-400 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>

          <div className="z-10 shrink-0">
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${user?.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">{user?.role === 'admin' ? 'Administrator' : 'Standard User'}</span>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        </motion.div>

        {/* Middle Section: Statistics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Commands Executed</p>
            </div>
            <p className="text-4xl font-bold text-slate-100">{commandsCount}</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <User className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-medium">User Rank</p>
            </div>
            <p className="text-2xl font-bold text-slate-100 mt-2">{getRank()}</p>
          </div>
        </motion.div>

        {/* Bottom Section: Personal Information */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8 rounded-2xl relative overflow-hidden"
        >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Personal Information
              </h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setIsEditing(false); setName(user?.name || ''); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleUpdate} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg transition-colors">
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">{success}</div>}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                ) : (
                  <div className="mt-1 px-4 py-2.5 bg-slate-900/30 border border-slate-800 rounded-xl text-slate-200">
                    {user?.name}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                <div className="mt-1 px-4 py-2.5 bg-slate-900/30 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-1">Email addresses cannot be changed.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
}
