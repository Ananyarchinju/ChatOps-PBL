import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-7xl h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
