import { useState, useEffect } from 'react';
import { Play, Square, RotateCw, Trash2, Box, DownloadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DockerPanel() {
  const { token } = useAuth();
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContainers = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:3000/api/docker/containers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContainers(res.data);
    } catch (error) {
      console.error('Failed to fetch containers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const handleAction = async (id: string, action: string) => {
    try {
      await axios.post(`http://localhost:3000/api/docker/containers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContainers();
    } catch (error) {
      console.error(`Failed to ${action} container`, error);
    }
  };

  const runningCount = containers.filter(c => c.state === 'running').length;
  const stoppedCount = containers.filter(c => c.state !== 'running').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Docker Containers</h1>
          <p className="text-slate-400 mt-1">Manage running services and images</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchContainers} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <RotateCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <DownloadCloud className="w-4 h-4" />
            Pull Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Containers', value: containers.length },
          { label: 'Running', value: runningCount },
          { label: 'Stopped', value: stoppedCount },
          { label: 'System Status', value: loading ? 'Loading...' : 'Online' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
            <span className="text-2xl font-bold mt-1 text-slate-100">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading && containers.length === 0 ? (
          <div className="text-slate-400 col-span-2">Loading containers...</div>
        ) : containers.length === 0 ? (
          <div className="text-slate-400 col-span-2">No containers found on the host machine.</div>
        ) : containers.map((container, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={container.id} 
            className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${container.state === 'running' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{container.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{container.image}</p>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                container.state === 'running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {container.state}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-900/50 p-3 rounded-xl border border-slate-800">
              <div className="col-span-2">
                <span className="text-slate-500 block mb-1 text-xs">Container ID</span>
                <span className="font-mono text-slate-300">{container.id}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block mb-1 text-xs">Status</span>
                <span className="font-mono text-slate-300">{container.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-slate-800">
              {container.state !== 'running' ? (
                <button onClick={() => handleAction(container.id, 'start')} className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors group" title="Start">
                  <Play className="w-5 h-5 group-hover:fill-current" />
                </button>
              ) : (
                <button onClick={() => handleAction(container.id, 'stop')} className="p-2 hover:bg-amber-500/20 text-amber-400 rounded-lg transition-colors group" title="Stop">
                  <Square className="w-5 h-5 group-hover:fill-current" />
                </button>
              )}
              <button onClick={() => handleAction(container.id, 'restart')} className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors group" title="Restart">
                <RotateCw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
