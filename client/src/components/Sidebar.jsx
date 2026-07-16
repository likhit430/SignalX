import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, Radio, Briefcase, Users, User, ChevronLeft, ChevronRight, Terminal, Cpu 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { name: 'Crisis Feed', icon: Radio, path: '/emergencies' },
    { name: 'AI Operator', icon: Cpu, path: '/ai-operator' },
    { name: 'Resources', icon: Briefcase, path: '/resources' },
    { name: 'Volunteers', icon: Users, path: '/volunteers' },
    { name: 'Profile Card', icon: User, path: '/profile' },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 70 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-[calc(100vh-64px)] z-20 bg-[#05050f]/60 backdrop-blur-md border-r border-cyber-blue/10 relative overflow-hidden"
    >
      {/* Glitch Overlay scanline */}
      <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none opacity-[0.03] bg-gradient-to-b from-transparent via-cyan-500 to-transparent animate-scanline-move" />

      {/* Collapse Trigger Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-4 z-30 p-1 border border-cyber-blue/20 bg-zinc-950 text-zinc-400 hover:text-cyber-blue rounded hover:bg-zinc-900 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Profile summary status area */}
      <div className="p-4 border-b border-zinc-800/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-gradient-to-tr from-cyber-blue-dim to-cyber-purple-dim border border-cyber-blue/30 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-w-0"
          >
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
              NET_NODE_ACTIVE
            </span>
            <span className="font-orbitron font-bold text-xs text-zinc-200 mt-1 truncate">
              {user?.role || 'Guest Node'}
            </span>
          </motion.div>
        )}
      </div>

      {/* Nav Menu Links */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-3 rounded-md transition-all duration-300 relative group font-orbitron text-xs font-semibold tracking-wider ${
                isActive 
                  ? 'text-cyber-blue bg-cyber-blue-dim/20 border-l-2 border-cyber-blue' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="truncate"
              >
                {item.name}
              </motion.span>
            )}

            {/* Hover Tooltip for collapsed states */}
            {collapsed && (
              <div className="absolute left-16 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-zinc-950 border border-cyber-blue/30 px-3 py-1.5 rounded font-mono text-[10px] text-cyber-blue pointer-events-none whitespace-nowrap shadow-lg">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapsible Panel Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 border-t border-zinc-800/40 flex flex-col gap-1 text-[10px] font-mono text-zinc-500"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyber-purple" />
            <span>CORE STATUS: STABLE</span>
          </div>
          <div className="text-[9px] text-zinc-600 mt-1 text-center font-mono">
            SYS // v1.4.0-SIGMA
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
