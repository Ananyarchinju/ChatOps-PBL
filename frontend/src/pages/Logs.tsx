import { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Play, Square, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Logs() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [logs, setLogs] = useState<string[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [isWatching, setIsWatching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const endOfLogsRef = useRef<HTMLDivElement>(null);
  
  // Fetch available containers on mount
  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchContainers = async () => {
      try {
        const token = localStorage.getItem('chatops_token');
        const res = await axios.get('http://localhost:3000/api/docker/containers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContainers(res.data);
        if (res.data.length > 0) {
          setSelectedContainer(res.data[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch containers", e);
      }
    };
    fetchContainers();
  }, [isAdmin]);

  // Poll for logs every 2 seconds if watching and container is selected
  useEffect(() => {
    if (!isWatching || !selectedContainer || !isAdmin) return;

    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('chatops_token');
        const res = await axios.get(`http://localhost:3000/api/docker/logs/${selectedContainer}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Split the giant log string by newlines, filter empty lines
        const logLines = res.data.logs.split('\n').filter((l: string) => l.trim() !== '');
        setLogs(logLines);
      } catch (error) {
        console.error("Failed to fetch logs", error);
      }
    };

    fetchLogs(); // initial fetch
    const interval = setInterval(fetchLogs, 2000); // poll every 2s

    return () => clearInterval(interval);
  }, [isWatching, selectedContainer, isAdmin]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isWatching) {
      endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isWatching]);

  const handleExport = () => {
    const fileData = logs.join('\n');
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `docker-logs-${selectedContainer}-${new Date().toISOString().slice(0,10)}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] items-center justify-center">
        <Terminal className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-slate-400">You must be an admin to view live container logs.</p>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => log.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Live Logs</h1>
          <p className="text-slate-400 mt-1">Real-time system and application logs</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsWatching(!isWatching)}
            className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              isWatching 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
            }`}
          >
            {isWatching ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isWatching ? 'Stop' : 'Watch'}
          </button>
          <button 
            onClick={handleExport}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-medium transition-colors border border-slate-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-700/50 relative">
        
        {/* Header Bar */}
        <div className="bg-slate-900/80 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex items-center gap-2 bg-slate-950/50 rounded-lg px-3 py-1.5 border border-slate-700">
              <Terminal className="w-4 h-4 text-blue-400" />
              <select 
                value={selectedContainer} 
                onChange={(e) => setSelectedContainer(e.target.value)}
                className="bg-transparent border-none text-sm font-mono text-slate-300 focus:outline-none cursor-pointer"
              >
                {containers.length === 0 && <option value="">Loading containers...</option>}
                {containers.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-300">
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="relative w-64 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        
        {/* Log Viewer */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-sm">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 italic">No logs available or fetching...</div>
          ) : (
            filteredLogs.map((log, idx) => {
              // Extremely basic coloring for real docker logs
              let color = 'text-slate-300';
              if (log.toLowerCase().includes('info') || log.includes('200')) color = 'text-blue-300';
              if (log.toLowerCase().includes('warn')) color = 'text-amber-400';
              if (log.toLowerCase().includes('error') || log.toLowerCase().includes('fail')) color = 'text-red-400';

              return (
                <div key={idx} className={`py-0.5 hover:bg-slate-900/50 px-2 rounded ${color} break-words whitespace-pre-wrap`}>
                  {log}
                </div>
              );
            })
          )}
          <div ref={endOfLogsRef} className="h-4" />
        </div>
      </div>
    </div>
  );
}
