import { useState, useEffect } from 'react';
import { Play, Square, RotateCw, Box, DownloadCloud, AlertCircle, Terminal, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function DockerPanel() {
  const { token } = useAuth();
  const [containers, setContainers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemStatus, setSystemStatus] = useState<'Online' | 'Offline' | 'Loading'>('Loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatusAndContainers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Check if Docker daemon is online
      const statusRes = await axios.get('/api/docker/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSystemStatus(statusRes.data.status);

      if (statusRes.data.status === 'Online') {
        // 2. Fetch containers if online
        const containersRes = await axios.get('/api/docker/containers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContainers(containersRes.data);
        setError('');
      } else {
        setContainers([]);
        setError('Docker Engine is not reachable.');
      }
    } catch (err: any) {
      console.error('Failed to fetch docker data', err);
      setSystemStatus('Offline');
      setError('Failed to connect to backend Docker service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndContainers();
    const interval = setInterval(fetchStatusAndContainers, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [token]);

  const handleAction = async (id: string, action: string) => {
    try {
      await axios.post(`/api/docker/containers/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStatusAndContainers();
    } catch (error) {
      console.error(`Failed to ${action} container`, error);
    }
  };

  const runningCount = containers.filter(c => c.state === 'running').length;
  const stoppedCount = containers.filter(c => c.state !== 'running').length;

  const handlePullImage = async () => {
    const imageName = prompt("Enter the image name to pull (e.g., nginx:latest):");
    if (!imageName) return;
    
    try {
      setLoading(true);
      await axios.post(`/api/docker/pull`, { image: imageName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Successfully pulled ${imageName}`);
      fetchStatusAndContainers();
    } catch (error: any) {
      console.error('Failed to pull image', error);
      alert(`Failed to pull image: ${error.response?.data?.error || error.message}`);
      setLoading(false);
    }
  };

  const filteredContainers = containers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.image.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Docker Containers</h1>
          <p className="text-slate-400 mt-1">Manage running services and images</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchStatusAndContainers} 
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 border border-slate-700 active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handlePullImage}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <DownloadCloud className="w-4 h-4" />
            Pull Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Containers', value: containers.length },
          { label: 'Running', value: runningCount },
          { label: 'Stopped', value: stoppedCount },
          { 
            label: 'System Status', 
            value: systemStatus, 
            color: systemStatus === 'Online' ? 'text-emerald-500' : systemStatus === 'Offline' ? 'text-red-500' : 'text-amber-500' 
          },
        ].map((stat, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl flex flex-col justify-center">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
            <span className={`text-3xl font-black mt-1 ${stat.color || 'text-slate-50'}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {systemStatus === 'Online' && (
        <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center bg-slate-900/50 border border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search containers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {systemStatus === 'Offline' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel p-12 rounded-3xl flex flex-col items-center text-center space-y-6"
          >
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-bold">Docker Engine Unreachable</h2>
              <p className="text-slate-400 mt-2">
                We couldn't connect to the local Docker daemon. Please ensure **Docker Desktop** is running and the "Expose daemon on tcp://localhost:2375" setting is enabled if applicable.
              </p>
            </div>

            <div className="bg-black/40 rounded-xl p-6 text-left font-mono text-sm border border-slate-800 w-full max-w-lg">
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <Terminal className="w-4 h-4" />
                <span>Check Docker status:</span>
              </div>
              <div className="space-y-2">
                <p className="text-blue-400"># Start Docker Desktop from your applications</p>
                <p className="text-slate-300"># Then verify with: <span className="text-emerald-400">docker ps</span></p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button 
                onClick={fetchStatusAndContainers}
                className="flex-1 bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Retry Connection
              </button>
              <a 
                href="https://docs.docker.com/desktop/" 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                Install Docker <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {loading && containers.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <RotateCw className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Scanning for containers...</p>
              </div>
            ) : containers.length === 0 ? (
              <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2">
                <Box className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No Containers Found</h3>
                <p className="text-slate-400 mt-2">The Docker daemon is online, but no containers exist on this machine.</p>
                <button className="mt-6 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors flex items-center gap-2 mx-auto">
                  <DownloadCloud className="w-5 h-5" /> Pull your first image
                </button>
              </div>
            ) : filteredContainers.length === 0 ? (
              <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2">
                <Box className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold">No Containers Found</h3>
                <p className="text-slate-400 mt-2">No containers matched your search criteria.</p>
              </div>
            ) : filteredContainers.map((container, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={container.id} 
                className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-slate-700/50 hover:border-indigo-500/50 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${container.state === 'running' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800 text-slate-500'}`}>
                      <Box className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{container.name}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-1 bg-black/10 px-2 py-0.5 rounded inline-block">{container.image}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    container.state === 'running' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {container.state}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm bg-black/20 p-4 rounded-xl border border-slate-800/50">
                  <div>
                    <span className="text-slate-500 block mb-1 text-[10px] font-bold uppercase tracking-tight">Container ID</span>
                    <span className="font-mono text-slate-300 text-xs">{container.id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1 text-[10px] font-bold uppercase tracking-tight">Current Status</span>
                    <span className="font-mono text-slate-300 text-xs">{container.status}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-800/50">
                  {container.state !== 'running' ? (
                    <button 
                      onClick={() => handleAction(container.id, 'start')} 
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all font-bold text-xs shadow-lg active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" /> START
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction(container.id, 'stop')} 
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all font-bold text-xs shadow-lg active:scale-95"
                    >
                      <Square className="w-4 h-4 fill-current" /> STOP
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction(container.id, 'restart')} 
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all font-bold text-xs active:scale-95"
                  >
                    <RotateCw className="w-4 h-4" /> RESTART
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
