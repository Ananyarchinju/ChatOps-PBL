import { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Shield, Key, Save, X, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

export default function Settings() {
  const { user, token, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('chatops_notifications') === 'true';
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.put('http://localhost:3000/api/auth/profile', 
        { name, password: newPassword || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateUser(response.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('chatops_notifications', 'true');
        new Notification("ChatOps", { body: "Notifications enabled!" });
      } else {
        alert("Permission denied for notifications");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('chatops_notifications', 'false');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1">Manage application preferences and security</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {success}
        </div>
      )}

      <div className="glass-panel p-8 rounded-2xl space-y-8">
        {/* Profile Section */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h2 className="text-xl font-semibold">Profile</h2>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-900 shadow-lg">
                {user?.name.substring(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <h3 className="font-medium text-lg">{user?.name}</h3>
                <p className="text-slate-400 text-sm">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" /> {user?.role}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">New Password (optional)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2 px-4 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setName(user?.name || ''); }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border border-slate-700"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-800">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                  {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-medium">Theme Mode</h3>
                  <p className="text-slate-400 text-sm">Currently using {darkMode ? 'Dark' : 'Light'} theme</p>
                </div>
              </div>
              <div 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${darkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-300 ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/30 transition-all border border-transparent hover:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Browser Notifications</h3>
                  <p className="text-slate-400 text-sm">Receive instant alerts for build failures</p>
                </div>
              </div>
              <div 
                onClick={toggleNotifications}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${notificationsEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-md transition-all duration-300 ${notificationsEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Integrations</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-sm">Jenkins Integration</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">CONNECTED</span>
              </div>
              <p className="text-slate-400 text-xs font-mono bg-black/20 p-2 rounded">TOKEN: ************************34FA</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
