import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, ShieldAlert, Check } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const Register = () => {
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Civilian');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = ['Civilian', 'Volunteer', 'AI Operator', 'Admin'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('ALL METADATA FIELDS REQUIRED');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'REGISTRATION SEQUENCE FAULT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <CyberBackground variant="purple" />

      {/* Cyber Register Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl border border-cyber-purple/30 bg-[#080816]/70 backdrop-blur-md shadow-[0_0_50px_rgba(189,0,255,0.15)] relative overflow-hidden"
      >
        {/* Hologram scan line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-cyber-purple/50 animate-scanline-move pointer-events-none" />

        {/* Card Tech Highlights */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-purple" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-purple" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-purple" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-purple" />

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="w-11 h-11 rounded-lg border border-cyber-purple/20 bg-cyber-purple-dim/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-cyber-purple animate-pulse" />
          </div>
          <h2 className="font-orbitron font-black text-xl tracking-widest text-zinc-100 uppercase">
            REQUEST NET CLEARANCE
          </h2>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            INITIALIZE NODE REGISTRATION PATH
          </p>
        </div>

        {/* Alert Notifications */}
        {(error || authError) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 p-3.5 mb-5 rounded-lg border border-cyber-pink/30 bg-cyber-pink-dim/10 text-cyber-pink font-mono text-xs"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error || authError}</span>
          </motion.div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              NODE CALLSIGN (NAME)
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VALKYRIE_09"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(189,0,255,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              NET IDENTIFIER (EMAIL)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="valk@signalx.net"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(189,0,255,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              PASSCODE HASH MATRIX
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(189,0,255,0.2)] transition-all duration-300"
              />
            </div>
          </div>

          {/* Role selector layout tab buttons */}
          <div className="flex flex-col gap-2">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              NET CLEARANCE LEVEL
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`font-orbitron font-bold text-[10px] py-2 px-3 border rounded text-center transition-all duration-300 flex items-center justify-between ${
                      isSelected
                        ? 'border-cyber-purple bg-cyber-purple-dim text-cyber-purple font-extrabold shadow-[0_0_10px_rgba(189,0,255,0.15)]'
                        : 'border-zinc-800 bg-[#05050f]/50 text-zinc-500 hover:text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span>{r.toUpperCase()}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-cyber-purple" />}
                  </button>
                );
              })}
            </div>
          </div>

          <GlowButton
            variant="purple"
            type="submit"
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? 'REGISTERING MATRIX...' : 'COMPILE CLEARANCE REQUEST'}
          </GlowButton>
        </form>

        {/* Login redirect link */}
        <div className="mt-6 text-center">
          <span className="font-mono text-[10px] text-zinc-500 uppercase">
            Clearance already issued?{' '}
          </span>
          <Link
            to="/login"
            className="font-orbitron text-[10px] font-bold text-cyber-purple hover:underline uppercase tracking-wider"
          >
            Log In Node
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
