import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, AlertCircle } from 'lucide-react';

export const Loader = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  const bootLogs = [
    'CONNECTING TO SIGNALX CORE NET...',
    'RESOLVING QUANTUM DNS NODES... OK',
    'MOUNTING ENCRYPTED DATA LAYERS...',
    'ESTABLISHING WEBSOCKET SYNC PORT...',
    'VERIFYING GRID DEPLOYMENTS...',
    'CHECKING MONGO DATABASE ATTACHMENT...',
    'COGNITIVE AI AGENT LINKED...',
    'DECRYPTING CREDENTIAL LAYERS...',
    'ALL SYSTEM CORES RUNNING. SIGNALX ACTIVE //',
  ];

  useEffect(() => {
    let logIndex = 0;
    
    // Increment logs over time
    const logInterval = setInterval(() => {
      if (logIndex < bootLogs.length) {
        setLogs((prev) => [...prev, bootLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 300);

    // Progress bar loader
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 400); // Small pause at 100%
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020208] text-white p-6 font-mono selection:bg-transparent">
      {/* Visual background CRT line overlay */}
      <div className="scanline" />

      {/* Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-10" />

      <div className="max-w-md w-full flex flex-col gap-6">
        {/* Logo and Pulsing State */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
              filter: [
                'drop-shadow(0 0 10px rgba(0,240,255,0.4))',
                'drop-shadow(0 0 25px rgba(0,240,255,0.8))',
                'drop-shadow(0 0 10px rgba(0,240,255,0.4))',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 rounded-2xl border border-cyber-blue flex items-center justify-center bg-cyber-blue-dim/20"
          >
            <Shield className="w-8 h-8 text-cyber-blue" />
          </motion.div>
          <h2 className="font-orbitron font-extrabold text-lg tracking-widest text-cyber-blue">
            SIGNALX NETWORK
          </h2>
        </div>

        {/* Terminal Log Console */}
        <div className="bg-[#05050f] border border-cyber-blue/20 rounded-xl p-4 h-56 flex flex-col justify-end shadow-2xl relative overflow-hidden">
          <div className="absolute top-2 right-4 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-ping" />
            <span className="text-[8px] font-bold text-cyber-blue tracking-widest">
              DIAG_MONITOR
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto max-h-full text-[10px] text-zinc-400 font-mono">
            {logs.map((log, index) => (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                key={index}
                className="flex items-center gap-2"
              >
                <span className="text-cyber-blue font-bold">&gt;</span>
                <span className={index === bootLogs.length - 1 ? 'text-cyber-green' : ''}>
                  {log}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress bar container */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-500 uppercase tracking-widest">LOADING CORE SERVICES</span>
            <span className="text-cyber-blue font-bold font-mono">{Math.min(progress, 100)}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple shadow-[0_0_10px_rgba(0,240,255,0.7)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
