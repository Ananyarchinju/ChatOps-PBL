import { useState, useEffect } from 'react';
import { Activity, Server, RefreshCw, AlertCircle, Terminal, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonitoringPanel() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  const checkConnectivity = async () => {
    setChecking(true);
    try {
      // Try to fetch the Grafana login page (no-cors mode to avoid preflight issues)
      await fetch('http://localhost:3001/login', { mode: 'no-cors', cache: 'no-cache' });
      setIsOnline(true);
    } catch (err) {
      console.error("Monitoring service unreachable:", err);
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkConnectivity();
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            Live Telemetry
          </h1>
          <p className="text-slate-400 mt-1">Real-time metrics powered by Prometheus & Grafana</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={checkConnectivity}
            disabled={checking}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
            title="Refresh Status"
          >
            <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
          </button>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {checking ? 'Checking...' : isOnline ? 'Service Online' : 'Service Offline'}
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-grow bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative flex flex-col items-center justify-center min-h-[600px]"
      >
        {isOnline === false ? (
          <div className="max-w-md w-full p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Monitoring Stack Offline</h2>
              <p className="text-slate-400 mt-2">
                The Prometheus and Grafana services are currently unreachable. Please ensure Docker Desktop is running and the monitoring stack is started.
              </p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 text-left font-mono text-sm border border-slate-800 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 text-xs">Run this command in project root:</span>
                <Terminal className="w-4 h-4 text-slate-600" />
              </div>
              <code className="text-blue-400 break-all">
                docker-compose -f docker-compose.monitoring.yml up -d
              </code>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={checkConnectivity}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
              >
                Retry Connection
              </button>
              <a 
                href="http://localhost:3001" 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-400 hover:text-slate-200 text-sm flex items-center justify-center gap-2"
              >
                Open Grafana directly <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : isOnline === true ? (
          <iframe
            src="http://localhost:3001/d/chatops-dashboard/chatops-system-metrics?orgId=1&refresh=5s&kiosk=tv&theme=dark"
            width="100%"
            height="100%"
            frameBorder="0"
            title="Grafana Dashboard"
            className="absolute inset-0"
          ></iframe>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-400 font-medium">Connecting to Monitoring Services...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
