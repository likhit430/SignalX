import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, Cpu } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('ALL CREDENTIAL SCHEMAS REQUIRED');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'GATEWAY ACCESS DENIED');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo123');
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'Demo123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'GATEWAY ACCESS DENIED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <CyberBackground variant="blue" />

      {/* Cyber Keycard Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl border border-cyber-blue/30 bg-[#080816]/70 backdrop-blur-md shadow-[0_0_50px_rgba(0,240,255,0.15)] relative overflow-hidden"
      >
        {/* Hologram scan line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-cyber-blue/50 animate-scanline-move pointer-events-none" />

        {/* Card Tech Highlights */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-blue" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-blue" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-blue" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-blue" />

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-lg border border-cyber-blue/20 bg-cyber-blue-dim/10 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-cyber-blue animate-pulse" />
          </div>
          <h2 className="font-orbitron font-black text-xl tracking-widest text-zinc-100 uppercase">
            SECURE ACCESS GATEWAY
          </h2>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            AUTHENTICATE NODE VIA USER ID
          </p>
        </div>

        {/* Alert Notifications */}
        {(error || authError) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 p-3.5 mb-6 rounded-lg border border-cyber-pink/30 bg-cyber-pink-dim/10 text-cyber-pink font-mono text-xs"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error || authError}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              NODE EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@signalx.net"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              PASSKEY MATRIX
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-blue focus:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          <GlowButton
            variant="blue"
            type="submit"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'RUNNING DECRYPT...' : 'INITIATE CONNECTION'}
          </GlowButton>
        </form>

        {/* Demo password statement */}
        <div className="mt-4 text-center">
          <p className="font-mono text-[10px] text-zinc-400">
            Demo password for all roles: <span className="text-white font-bold">Demo123</span>
          </p>
        </div>

        {/* Demo Login Actions */}
        <div className="mt-6 border-t border-zinc-900 pt-4 flex flex-col gap-2">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest text-center">
            QUICK ACCESS DEMO NODES
          </span>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@email.com')}
              className="py-1.5 px-3 border border-cyber-blue/30 bg-[#05050f] text-cyber-blue rounded hover:bg-cyber-blue hover:text-black font-orbitron text-[9px] font-bold tracking-wider transition duration-300 uppercase text-center flex-1"
            >
              Login as Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('operator@email.com')}
              className="py-1.5 px-3 border border-cyber-purple/30 bg-[#05050f] text-cyber-purple rounded hover:bg-cyber-purple hover:text-black font-orbitron text-[9px] font-bold tracking-wider transition duration-300 uppercase text-center flex-1"
            >
              Login as AI Operator
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('volunteer@email.com')}
              className="py-1.5 px-3 border border-cyber-green/30 bg-[#05050f] text-cyber-green rounded hover:bg-cyber-green hover:text-black font-orbitron text-[9px] font-bold tracking-wider transition duration-300 uppercase text-center flex-1"
            >
              Login as Volunteer
            </button>
          </div>
        </div>

        {/* Register Redirect link */}
        <div className="mt-4 text-center">
          <span className="font-mono text-[10px] text-zinc-500 uppercase">
            New node in the grid?{' '}
          </span>
          <Link
            to="/register"
            className="font-orbitron text-[10px] font-bold text-cyber-blue hover:underline uppercase tracking-wider"
          >
            Request Clearance
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
