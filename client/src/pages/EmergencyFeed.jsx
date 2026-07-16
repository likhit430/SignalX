import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, AlertTriangle, ShieldAlert, Cpu, Heart, CheckCircle2, Filter, CornerDownRight, ShieldCheck
} from 'lucide-react';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const EmergencyFeed = () => {
  const [filter, setFilter] = useState('ALL');
  const [feedItems, setFeedItems] = useState([
    {
      id: 'inc-101',
      title: 'Power Outage: Medical Center Grid',
      desc: 'Grid substation 04 reported terminal failure. ICU backup batteries running at 45% remaining charge.',
      level: 'critical',
      sector: 'SECTOR_04',
      time: '12 mins ago',
      assigned: null,
      resolved: false
    },
    {
      id: 'inc-102',
      title: 'Flood Barrier Breach Sector 12',
      desc: 'Local sensors indicating water levels surpassing threshold by 1.2m. Flooding warning issued for residential sectors.',
      level: 'critical',
      sector: 'SECTOR_12',
      time: '24 mins ago',
      assigned: 'Alpha Unit',
      resolved: false
    },
    {
      id: 'inc-103',
      title: 'Supply Drop Blockage: Zone 9',
      desc: 'Triage drone delivery pathway blocked by fallen communication towers. Physical clearance required.',
      level: 'warning',
      sector: 'SECTOR_09',
      time: '1 hr ago',
      assigned: null,
      resolved: false
    },
    {
      id: 'inc-104',
      title: 'Emergency Comm Hub Restored',
      desc: 'Decentralized mesh networks back online. Node encryption synced across 24 channels.',
      level: 'info',
      sector: 'SECTOR_01',
      time: '3 hrs ago',
      assigned: null,
      resolved: true
    }
  ]);

  const handleTriage = (id) => {
    setFeedItems((prev) => 
      prev.map((item) => 
        item.id === id ? { ...item, assigned: 'AI Operator Node Beta' } : item
      )
    );
  };

  const handleResolve = (id) => {
    setFeedItems((prev) => 
      prev.map((item) => 
        item.id === id ? { ...item, resolved: true } : item
      )
    );
  };

  const filteredItems = feedItems.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return item.level === 'critical' && !item.resolved;
    if (filter === 'ACTIVE') return !item.resolved;
    if (filter === 'RESOLVED') return item.resolved;
    return true;
  });

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="blue" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            REAL-TIME TELEMETRY STREAM
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            CRISIS QUEUE
          </h1>
        </div>

        {/* Filter Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-[#05050f]/80 border border-zinc-800 rounded-lg p-1.5 shadow-lg">
          <Filter className="w-3.5 h-3.5 text-zinc-500 ml-2" />
          {['ALL', 'ACTIVE', 'CRITICAL', 'RESOLVED'].map((type) => {
            const isSelected = filter === type;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`font-orbitron font-bold text-[9px] py-1.5 px-3 rounded tracking-wider transition ${
                  isSelected 
                    ? 'bg-cyber-blue-dim text-cyber-blue border border-cyber-blue/30 font-extrabold shadow-[0_0_8px_rgba(0,240,255,0.1)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed List Grid */}
      <div className="grid grid-cols-1 gap-4 max-w-4xl">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const isCritical = item.level === 'critical';
            const isWarning = item.level === 'warning';

            const getBorderClass = () => {
              if (item.resolved) return 'border-zinc-800 bg-[#070716]/10 opacity-70';
              if (isCritical) return 'border-cyber-pink/30 hover:border-cyber-pink bg-cyber-pink-dim/5';
              if (isWarning) return 'border-yellow-500/30 hover:border-yellow-500 bg-yellow-500/5';
              return 'border-cyber-blue/20 hover:border-cyber-blue bg-cyber-blue-dim/5';
            };

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${getBorderClass()}`}
              >
                {/* Visual Laser highlight for critical items */}
                {isCritical && !item.resolved && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyber-pink animate-pulse" />
                )}

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Badge indicator */}
                      <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        item.resolved 
                          ? 'bg-zinc-800 text-zinc-500'
                          : isCritical 
                            ? 'bg-cyber-pink-dim text-cyber-pink border border-cyber-pink/20'
                            : isWarning
                              ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                              : 'bg-cyber-blue-dim text-cyber-blue border border-cyber-blue/20'
                      }`}>
                        {item.resolved ? 'RESOLVED' : `${item.level}_ALERT`}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">{item.sector}</span>
                      <span className="font-mono text-[10px] text-zinc-600">• {item.time}</span>
                    </div>

                    <h3 className="font-orbitron font-extrabold text-base text-zinc-200 tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
                      {item.desc}
                    </p>

                    {item.assigned && (
                      <div className="flex items-center gap-2 mt-3 text-zinc-400 text-[10px] font-mono">
                        <CornerDownRight className="w-3.5 h-3.5 text-cyber-blue" />
                        <span>TACTICAL STATUS: </span>
                        <span className="text-cyber-blue font-bold uppercase">{item.assigned}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Interactive actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {!item.resolved && (
                      <>
                        {!item.assigned && (
                          <GlowButton
                            variant={isCritical ? 'pink' : 'blue'}
                            onClick={() => handleTriage(item.id)}
                            className="text-xs py-1.5 px-4 font-bold uppercase shrink-0"
                          >
                            Triage Dispatch
                          </GlowButton>
                        )}
                        <button
                          onClick={() => handleResolve(item.id)}
                          className="font-orbitron font-bold text-[10px] tracking-wider text-zinc-400 border border-zinc-800 hover:border-cyber-green hover:text-cyber-green bg-[#05050f] py-2 px-4 rounded-md transition duration-300 flex items-center justify-center gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          RESOLVED
                        </button>
                      </>
                    )}
                    {item.resolved && (
                      <div className="flex items-center gap-1.5 text-cyber-green font-mono text-xs font-semibold py-2 px-3 border border-cyber-green/20 bg-cyber-green-dim/10 rounded">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>CLEARANCE COMPLETED</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmergencyFeed;
