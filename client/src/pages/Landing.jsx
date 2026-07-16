import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Radio, Users, Activity, Eye, Zap, Database, HeartHandshake, ChevronRight 
} from 'lucide-react';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';
import useAuth from '../hooks/useAuth';

export const Landing = () => {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const features = [
    {
      icon: Radio,
      title: 'Emergency Feed',
      desc: 'Real-time telemetry and alerts processed directly via distributed nodes, ensuring crisis tracking is active 24/7.',
      color: 'text-cyber-blue'
    },
    {
      icon: Zap,
      title: 'AI Operator System',
      desc: 'Cognitive artificial intelligence nodes auto-triage incoming crisis incidents and prioritize volunteer routing.',
      color: 'text-cyber-purple'
    },
    {
      icon: Users,
      title: 'Volunteer Dispatch',
      desc: 'Encrypted mesh networks route volunteer teams to supply stations, evacuation grids, and medical centers.',
      color: 'text-cyber-green'
    }
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <CyberBackground variant="blue" />

      {/* Main Core Layout Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-center text-center gap-12"
      >
        {/* Main Hero Header */}
        <motion.div variants={itemVariants} className="flex flex-col items-center max-w-3xl gap-4">
          <div className="flex items-center gap-2 bg-cyber-blue-dim border border-cyber-blue/30 rounded-full px-4 py-1.5 mb-2 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <span className="w-2 h-2 bg-cyber-blue rounded-full animate-ping" />
            <span className="font-mono text-xs text-cyber-blue font-bold tracking-widest uppercase">
              DECENTRALIZED RESCUE ROUTER ACTIVE
            </span>
          </div>

          <h1 className="font-orbitron font-black text-4xl sm:text-6xl tracking-wider uppercase leading-none">
            CRISIS TELEMETRY <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-indigo-400 to-cyber-purple drop-shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              RE-ROUTED IN REAL-TIME
            </span>
          </h1>

          <p className="font-sans text-sm sm:text-base text-zinc-400 max-w-xl mt-4 leading-relaxed">
            SIGNALX coordinates distributed volunteer clusters and vital supply routing in disaster zones using encrypted mesh grids and AI operators.
          </p>
        </motion.div>

        {/* CTA Actions */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <GlowButton variant="blue" className="flex items-center gap-2">
                ENTER DASHBOARD <ChevronRight className="w-4 h-4" />
              </GlowButton>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <GlowButton variant="blue" className="flex items-center gap-2">
                  JOIN DISPATCH NETWORK <ChevronRight className="w-4 h-4" />
                </GlowButton>
              </Link>
              <Link to="/login">
                <GlowButton variant="purple" className="flex items-center gap-2">
                  SECURE NET LOGIN
                </GlowButton>
              </Link>
            </>
          )}
        </motion.div>

        {/* Showcase Core Features Grid */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8"
        >
          {features.map((feat, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md hover:border-cyber-blue/40 transition duration-300 relative overflow-hidden text-left"
            >
              {/* Corner tech highlights */}
              <span className="absolute top-0 right-0 w-8 h-[1px] bg-zinc-800 group-hover:bg-cyber-blue/30 transition-colors" />
              <span className="absolute top-0 right-0 w-[1px] h-8 bg-zinc-800 group-hover:bg-cyber-blue/30 transition-colors" />

              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-center group-hover:border-cyber-blue/30 transition-all duration-300">
                  <feat.icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <span className="font-mono text-[10px] text-zinc-600">SYS_MODULE_0{index + 1}</span>
              </div>

              <h3 className="font-orbitron font-bold text-base text-zinc-100 mb-2 tracking-wide uppercase">
                {feat.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                {feat.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
