import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const NotFound = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <CyberBackground variant="purple" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center gap-6">
        {/* Animated Alert Ring */}
        <div className="relative flex items-center justify-center w-24 h-24 rounded-full border border-cyber-pink/30 bg-cyber-pink-dim/10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-pink/20 opacity-75"></span>
          <ShieldAlert className="w-12 h-12 text-cyber-pink" />
        </div>

        {/* Glitch Status Title */}
        <div className="flex flex-col gap-2">
          <h1 className="font-orbitron font-black text-6xl tracking-widest text-cyber-pink select-none uppercase">
            404
          </h1>
          <h2 className="font-orbitron font-extrabold text-sm tracking-widest text-zinc-400 uppercase">
            Signal node not found.
          </h2>
        </div>

        {/* Terminal Diagnostic readout */}
        <div className="bg-[#05050f] border border-cyber-pink/30 rounded-xl p-4 w-full text-left font-mono text-xs text-zinc-400 shadow-2xl">
          <p className="text-cyber-pink font-semibold">// INTERRUPT REQUEST DETECTED</p>
          <p className="mt-2 text-zinc-500">&gt; PATH RESOLVE RESULT: FAIL</p>
          <p className="text-zinc-500">&gt; COMPILER CODE: STATUS_D10_ERR</p>
          <p className="text-zinc-500">&gt; REASON: SECTOR UNMAPPED OR RESTRICTED</p>
        </div>

        <Link to="/dashboard">
          <GlowButton variant="pink" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Dashboard
          </GlowButton>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
