import { Play, CheckCircle2, XCircle, Clock, Search, Filter, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function JenkinsPanel() {
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/jenkins/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBuilds(res.data);
      } catch (err) {
        console.error("Failed to fetch Jenkins jobs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jenkins Pipelines</h1>
          <p className="text-slate-400 mt-1">Manage and monitor CI/CD workflows</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <Play className="w-4 h-4 fill-current" />
          Trigger Build
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search jobs..." 
              className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm font-medium border border-slate-700 px-3 py-2 rounded-lg bg-slate-950">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-sm">
                <th className="py-4 px-6 font-medium">Job Name</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">Loading jobs from Jenkins...</td>
                </tr>
              ) : builds.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">No jobs found or Jenkins is disconnected.</td>
                </tr>
              ) : builds.map((build, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={build.name} 
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="py-4 px-6 font-medium text-slate-200">{build.name}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {build.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {build.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                      {build.status === 'building' && <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-0.5" />}
                      <span className="capitalize text-sm font-medium">
                        {build.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <a href={build.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-end gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Open in Jenkins <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
