import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Handshake, ShieldAlert, Cpu, Heart, CheckCircle2, ChevronRight, CornerDownRight, Play 
} from 'lucide-react';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const Volunteer = () => {
  const [tasks, setTasks] = useState([
    {
      id: 'task-001',
      title: 'Deploy Medical Cargo: Evac Zone 4',
      desc: 'Transport trauma bags and energy units to medical triage in Evac Zone 4. Hazard Level: Minimal.',
      level: 'Standard',
      volunteersNeeded: 2,
      volunteersJoined: 1,
      joined: false,
      status: 'Open'
    },
    {
      id: 'task-002',
      title: 'Grid Substation 02 Reboot Sequence',
      desc: 'Manual restart required for sector backup grid solar node. Requires basic field engineering clearance.',
      level: 'Technical',
      volunteersNeeded: 1,
      volunteersJoined: 0,
      joined: false,
      status: 'Open'
    },
    {
      id: 'task-003',
      title: 'Rations Distribution: Sector 09 Hub',
      desc: 'Organize and distribute meal blocks and clean water pods to civilian units arriving at Sector 09 Hub.',
      level: 'Standard',
      volunteersNeeded: 5,
      volunteersJoined: 4,
      joined: false,
      status: 'Open'
    }
  ]);

  const handleJoin = (id) => {
    setTasks((prev) => 
      prev.map((t) => {
        if (t.id === id) {
          const newJoined = !t.joined;
          const joinedChange = newJoined ? 1 : -1;
          const newStatus = t.volunteersJoined + joinedChange >= t.volunteersNeeded ? 'Full' : 'Open';
          return {
            ...t,
            joined: newJoined,
            volunteersJoined: t.volunteersJoined + joinedChange,
            status: newStatus
          };
        }
        return t;
      })
    );
  };

  const volunteerStats = [
    { title: 'Total Registered Nodes', value: '1,280', label: 'Active Volunteers' },
    { title: 'Completed Runs', value: '452', label: 'Incidents Cleared' },
    { title: 'Active Deployments', value: '44', label: 'Live Operations' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="blue" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            FIELD VOLUNTEER DISPATCH BOARD
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            OPEN INCIDENTS
          </h1>
        </div>
      </div>

      {/* Top statistics panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {volunteerStats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md flex flex-col gap-1"
          >
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
              {stat.title}
            </span>
            <h3 className="font-orbitron font-black text-2xl text-cyber-blue tracking-wider">
              {stat.value}
            </h3>
            <span className="font-mono text-[9px] text-zinc-600 mt-1 uppercase font-semibold">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Active Missions list */}
      <div className="grid grid-cols-1 gap-4 max-w-4xl pt-4">
        {tasks.map((task) => {
          const ratio = (task.volunteersJoined / task.volunteersNeeded) * 100;
          
          return (
            <div
              key={task.id}
              className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                task.joined
                  ? 'border-cyber-green/40 bg-cyber-green-dim/5'
                  : 'border-zinc-800 bg-[#070716]/40 hover:border-cyber-blue/30'
              }`}
            >
              {/* Corner status laser */}
              {task.joined && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyber-green" />
              )}

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-[9px] text-zinc-500">ID: {task.id}</span>
                    <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      task.level === 'Technical' 
                        ? 'bg-cyber-purple-dim text-cyber-purple border border-cyber-purple/20'
                        : 'bg-cyber-blue-dim text-cyber-blue border border-cyber-blue/20'
                    }`}>
                      {task.level} Clearance
                    </span>
                  </div>

                  <h3 className="font-orbitron font-extrabold text-base text-zinc-200 tracking-wide">
                    {task.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
                    {task.desc}
                  </p>

                  {/* Progress Meter */}
                  <div className="pt-2 max-w-xs space-y-1">
                    <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                      <span>DISPATCH ALLOCATION</span>
                      <span>{task.volunteersJoined} / {task.volunteersNeeded}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${ratio}%` }} 
                        className={`h-full transition-all duration-300 ${
                          task.joined ? 'bg-cyber-green' : 'bg-cyber-blue'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Accept button */}
                <div className="shrink-0 self-end sm:self-center">
                  <GlowButton
                    variant={task.joined ? 'green' : 'blue'}
                    onClick={() => handleJoin(task.id)}
                    className="text-xs font-bold uppercase"
                  >
                    {task.joined ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        DEPLOYED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                        ACCEPT MISSION
                      </span>
                    )}
                  </GlowButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Volunteer;
