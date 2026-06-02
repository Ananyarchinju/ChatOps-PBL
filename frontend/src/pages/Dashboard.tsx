import { Activity, Container, GitPullRequest, Server, ShieldAlert, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [containersCount, setContainersCount] = useState<number | string>('...');
  const [commandsCount, setCommandsCount] = useState<number | string>('...');
  const [recentCommands, setRecentCommands] = useState<any[]>([]);
  const [deploymentsCount, setDeploymentsCount] = useState<number | string>('...');
  const [onlineServersCount, setOnlineServersCount] = useState<number | string>('...');
  const [systemStats, setSystemStats] = useState({ cpu: 42, memory: 68 });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('chatops_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch real docker containers
        if (isAdmin) {
          const dockerRes = await axios.get('http://localhost:3000/api/docker/containers', { headers });
          setContainersCount(dockerRes.data.length);
        }

        // Fetch user's real command history
        const historyRes = await axios.get('http://localhost:3000/api/chat/history', { headers });
        const allMessages = historyRes.data;
        setCommandsCount(allMessages.length);
        
        // Get the 4 most recent commands for the activity feed (reverse so newest is first)
        const recent = allMessages.slice(-4).reverse();
        setRecentCommands(recent);

        // Fetch Jenkins Jobs to count deployments
        try {
          const jenkinsRes = await axios.get('http://localhost:3000/api/jenkins/jobs', { headers });
          const successfulDeployments = jenkinsRes.data.filter((job: any) => job.status === 'success').length;
          setDeploymentsCount(successfulDeployments);
        } catch (e) {
          setDeploymentsCount('0');
        }

        // Fetch System Stats
        if (isAdmin) {
          try {
            const statsRes = await axios.get('http://localhost:3000/api/system/stats', { headers });
            if (statsRes.data.cpu !== undefined) {
              setSystemStats(statsRes.data);
            }
          } catch (e) {
            console.error("Failed to load system stats", e);
          }
        }

        // If we reached here without throwing a catastrophic error, our backend server is online!
        setOnlineServersCount(1);

      } catch (error) {
        console.error("Failed to fetch dashboard data");
        setContainersCount('0');
        setCommandsCount('0');
        setDeploymentsCount('0');
        setOnlineServersCount(0);
      }
    };
    fetchRealData();
  }, [isAdmin]);

  const stats = [
    { label: 'Commands Executed', value: commandsCount, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10', adminOnly: false },
    { label: 'Active Containers', value: containersCount, icon: Container, color: 'text-purple-400', bg: 'bg-purple-400/10', adminOnly: true },
    { label: 'Deployments', value: deploymentsCount, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', adminOnly: false },
    { label: 'Online Servers', value: onlineServersCount, icon: Server, color: 'text-indigo-400', bg: 'bg-indigo-400/10', adminOnly: true },
  ];

  const visibleStats = stats.filter(s => !s.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          System Normal
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleStats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
          </motion.div>
        ))}
      </div>

      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-2' : ''} gap-6 mt-8`}>
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Commands</h2>
          <div className="space-y-4">
            {recentCommands.length === 0 ? (
              <p className="text-slate-400 text-sm">No commands executed yet. Go to ChatOps to start!</p>
            ) : recentCommands.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-colors">
                <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium font-mono">{activity.command}</p>
                  <p className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {isAdmin && (
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">System Load</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">CPU Usage</span>
                  <span className="font-medium text-blue-400">{systemStats.cpu}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${systemStats.cpu}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Memory Usage</span>
                  <span className="font-medium text-emerald-400">{systemStats.memory}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${systemStats.memory}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
