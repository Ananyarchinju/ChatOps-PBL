import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const cpuData = [
  { time: '10:00', value: 30 }, { time: '10:05', value: 45 }, { time: '10:10', value: 35 },
  { time: '10:15', value: 60 }, { time: '10:20', value: 40 }, { time: '10:25', value: 80 },
  { time: '10:30', value: 50 },
];

const ramData = [
  { time: '10:00', value: 55 }, { time: '10:05', value: 58 }, { time: '10:10', value: 60 },
  { time: '10:15', value: 62 }, { time: '10:20', value: 58 }, { time: '10:25', value: 65 },
  { time: '10:30', value: 68 },
];

export default function Monitoring() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <p className="text-slate-400 mt-1">Real-time metrics and performance charts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            CPU Usage (%)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            Memory Usage (%)
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '0.5rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
