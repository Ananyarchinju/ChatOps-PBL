import { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Play, Square, Search } from 'lucide-react';

const mockLogs = [
  '[INFO] Starting ChatOps System v1.0.0...',
  '[INFO] Initializing database connection to PostgreSQL...',
  '[SUCCESS] Connected to database successfully.',
  '[INFO] Starting HTTP server on port 3000...',
  '[INFO] Server is running and ready to accept connections.',
  '[WARN] Missing environment variable REDIS_URL, falling back to in-memory cache.',
  '[INFO] [API] GET /status 200 OK - 15ms',
  '[INFO] [API] POST /chat-command 200 OK - 120ms',
  '[INFO] Triggering Jenkins job: frontend-build-prod',
  '[INFO] Job started: Build #1025',
];

export default function Logs() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(true);
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogs(mockLogs);
    
    // Simulate incoming logs
    const interval = setInterval(() => {
      if (isWatching) {
        const newLog = `[INFO] [API] GET /metrics 200 OK - ${Math.floor(Math.random() * 50) + 10}ms`;
        setLogs(prev => [...prev, newLog]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isWatching]);

  useEffect(() => {
    if (isWatching) {
      endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isWatching]);

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
          <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl font-medium transition-colors border border-slate-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-700/50 relative">
        <div className="absolute top-4 right-4 w-64 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              className="w-full bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border-b border-slate-800 p-4 flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-mono text-slate-400 ml-2 flex items-center gap-2">
            <Terminal className="w-4 h-4" /> bash - root@chatops-server
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-sm">
          {logs.map((log, idx) => {
            let color = 'text-slate-300';
            if (log.includes('[INFO]')) color = 'text-blue-300';
            if (log.includes('[SUCCESS]')) color = 'text-emerald-400';
            if (log.includes('[WARN]')) color = 'text-amber-400';
            if (log.includes('[ERROR]')) color = 'text-red-400';

            return (
              <div key={idx} className={`py-1 hover:bg-slate-900/50 px-2 rounded ${color}`}>
                {log}
              </div>
            );
          })}
          <div ref={endOfLogsRef} />
        </div>
      </div>
    </div>
  );
}
