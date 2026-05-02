import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Terminal, Server, Container, Activity, ScrollText, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', requireAdmin: false },
  { icon: Terminal, label: 'ChatOps', path: '/chat', requireAdmin: false },
  { icon: Server, label: 'Jenkins', path: '/jenkins', requireAdmin: true },
  { icon: Container, label: 'Docker', path: '/docker', requireAdmin: true },
  { icon: Activity, label: 'Monitoring', path: '/monitoring', requireAdmin: false },
  { icon: ScrollText, label: 'Logs', path: '/logs', requireAdmin: false },
  { icon: Settings, label: 'Settings', path: '/settings', requireAdmin: true },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => !item.requireAdmin || user?.role === 'admin');

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent flex items-center gap-2">
          <Terminal className="text-blue-500" />
          ChatOps
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isActive 
                ? "bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <a
          href="#"
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </a>
      </div>
    </aside>
  );
}
