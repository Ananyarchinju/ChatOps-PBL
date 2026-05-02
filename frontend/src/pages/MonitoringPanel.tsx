import { Activity, Server } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonitoringPanel() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            Live Telemetry
          </h1>
          <p className="text-slate-400 mt-1">Real-time metrics powered by Prometheus & Grafana</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Connection
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-grow bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative"
        style={{ minHeight: '600px' }}
      >
        <iframe
          src="http://localhost:3001/d/chatops-dashboard/chatops-system-metrics?orgId=1&refresh=5s&kiosk=tv&theme=dark"
          width="100%"
          height="100%"
          frameBorder="0"
          title="Grafana Dashboard"
          className="absolute inset-0"
        ></iframe>
      </motion.div>
    </div>
  );
}
