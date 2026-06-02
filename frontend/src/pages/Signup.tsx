import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Lock, Mail, ChevronRight, Eye, EyeOff, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-50">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-panel p-8 rounded-3xl relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <Terminal className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-slate-400 mt-2">Join the ChatOps Platform</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
              {!loading && <ChevronRight className="w-5 h-5" />}
            </button>

            <div className="text-center mt-6">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
