import { useState } from 'react';
import { Bell, Moon, Sun, Shield, Key } from 'lucide-react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  const handleUpdate = () => {
    alert("Settings updated successfully!");
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1">Manage application preferences and security</p>
      </div>

      <div className="glass-panel p-8 rounded-2xl space-y-8">
        {/* Profile Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Profile</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-slate-900">
              AD
            </div>
            <div>
              <h3 className="font-medium text-lg">Admin User</h3>
              <p className="text-slate-400 text-sm">admin@chatops.local</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
                <Shield className="w-3.5 h-3.5" /> Administrator
              </div>
            </div>
            <button onClick={handleUpdate} className="ml-auto bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-slate-700">
              Edit Profile
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-slate-400 text-sm">Use dark theme across the application</p>
                </div>
              </div>
              <div 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${darkMode ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-slate-400 text-sm">Receive alerts for failed builds and offline servers</p>
                </div>
              </div>
              <div 
                onClick={() => setPushNotif(!pushNotif)}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${pushNotif ? 'bg-blue-500' : 'bg-slate-700'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${pushNotif ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section>
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-800 pb-2">Integrations</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Jenkins API Token</h3>
                  <p className="text-slate-400 text-sm font-mono mt-1">************************</p>
                </div>
              </div>
              <button onClick={handleUpdate} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Update</button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium">Docker Daemon Host</h3>
                  <p className="text-slate-400 text-sm font-mono mt-1">unix:///var/run/docker.sock</p>
                </div>
              </div>
              <button onClick={handleUpdate} className="text-blue-400 hover:text-blue-300 text-sm font-medium">Update</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
