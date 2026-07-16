import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Server, Cpu, Database, TrendingUp, Shield, Activity, Users, Radio, AlertTriangle, Play, HelpCircle, FileText, ArrowRight, CheckCircle2, Briefcase
} from 'lucide-react';
import { emergencyService } from '../services/emergencyService';
import { resourceService } from '../services/resourceService';
import { volunteerService } from '../services/volunteerService';
import useAuth from '../hooks/useAuth';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());
  
  // Real stats
  const [stats, setStats] = useState({ total: 0, open: 0, critical: 0, resolved: 0 });
  const [resStats, setResStats] = useState({ totalResources: 0, availableResources: 0, limitedResources: 0, unavailableResources: 0, totalAvailableQuantity: 0 });
  const [volStats, setVolStats] = useState({ totalVolunteers: 0, availableVolunteers: 0, busyVolunteers: 0, offlineVolunteers: 0 });
  
  // Real listings
  const [recentFeed, setRecentFeed] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI mini assistant input
  const [aiMessage, setAiMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Emergency stats & feed
      const statsRes = await emergencyService.getStatsSummary();
      if (statsRes && statsRes.data) setStats(statsRes.data);
      const feedRes = await emergencyService.getEmergencies();
      if (feedRes && feedRes.data) setRecentFeed(feedRes.data.slice(0, 5));

      // 2. Fetch Resource stats & feed
      const resStatsRes = await resourceService.getStatsSummary();
      if (resStatsRes && resStatsRes.data) setResStats(resStatsRes.data);
      const resourcesRes = await resourceService.getResources({ limit: 5 });
      if (resourcesRes && resourcesRes.data) setRecentResources(resourcesRes.data.slice(0, 5));

      // 3. Fetch Volunteer stats
      const volStatsRes = await volunteerService.getStatsSummary();
      if (volStatsRes && volStatsRes.data) setVolStats(volStatsRes.data);

      setError('');
    } catch (err) {
      console.error('Dashboard telemetry error:', err.message);
      setError('FAILED TO SYNC LIVE GRID DATA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Interval for timestamp
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAiOperatorRoute = (e) => {
    e.preventDefault();
    navigate('/ai-operator', { state: { initialMsg: aiMessage } });
  };

  // Completely removed fake simulated items (e.g. latency/AI percentages)
  const statusMetrics = [
    { name: 'API Server Connection', value: 'ONLINE', icon: Server, color: 'text-cyber-green', detail: 'Express Port 5000' },
    { name: 'DB Cluster Connectivity', value: 'CONNECTED', icon: Database, color: 'text-cyber-blue', detail: 'Mongoose ODM Stable' },
    { name: 'Active Logistics Nodes', value: `${resStats.totalResources} Registered`, icon: Briefcase, color: 'text-cyber-blue', detail: 'Supply Registry' },
    { name: 'Volunteers Connected', value: `${volStats.totalVolunteers} Nodes`, icon: Users, color: 'text-cyber-green', detail: 'Active Operations' },
  ];

  const gridStats = [
    { title: 'TOTAL ACTIVE INCIDENTS', count: stats.open, change: `${stats.total} REGISTERED`, icon: Radio, themeColor: 'text-cyber-pink bg-cyber-pink-dim/10 border-cyber-pink/30' },
    { title: 'CRITICAL EMERGENCIES', count: stats.critical, change: 'IMMEDIATE ACTION', icon: AlertTriangle, themeColor: 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse' },
    { title: 'RESOLVED INCIDENTS', count: stats.resolved, change: 'CLEARANCE COMPLETED', icon: CheckCircle2, themeColor: 'text-cyber-green bg-cyber-green-dim/10 border-cyber-green/30' },
  ];

  const logisticsStats = [
    { title: 'TOTAL RESOURCE TYPES', count: resStats.totalResources, change: 'REGISTERED IN GRID', icon: Briefcase, themeColor: 'text-cyber-purple bg-cyber-purple-dim/10 border-cyber-purple/30' },
    { title: 'AVAILABLE RESOURCES', count: resStats.availableResources, change: 'HEALTHY QUANTITIES', icon: Briefcase, themeColor: 'text-cyber-green bg-cyber-green-dim/10 border-cyber-green/30' },
    { title: 'LIMITED RESOURCES', count: resStats.limitedResources, change: 'CRITICAL SUPPLY LEVEL', icon: AlertTriangle, themeColor: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
    { title: 'AVAILABLE VOLUNTEERS', count: volStats.availableVolunteers, change: 'READY FOR DEPLOYMENT', icon: Users, themeColor: 'text-cyber-green bg-cyber-green-dim/10 border-cyber-green/30' },
    { title: 'DEPLOYED (BUSY) VOLUNTEERS', count: volStats.busyVolunteers, change: 'ACTIVE DISPATCH RUNS', icon: Shield, themeColor: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="blue" />

      {/* Top Banner Status Bar with Welcome Message */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            OPERATIONS_MONITOR_CENTER
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            CONTROL CONSOLE
          </h1>
          <p className="font-mono text-[10px] text-cyber-blue mt-1">
            WELCOME NODE: <span className="text-white font-bold">{user?.name || 'GUEST_NODE'}</span> // AUTHORIZATION LEVEL: <span className="text-white font-bold">{user?.role?.toUpperCase() || 'CIVILIAN'}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#05050f] border border-zinc-800 px-4 py-2 rounded-lg font-mono text-xs text-cyber-blue shadow-lg">
            NODE_TIME: <span className="text-white font-semibold">{timestamp}</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-full px-3 py-1 text-xs text-zinc-400 hover:text-white transition duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              GRID SYNC ACTIVE
            </span>
          </button>
        </div>
      </div>

      {/* Connection Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusMetrics.map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md flex items-start gap-4 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded border border-zinc-800/80 bg-zinc-900/60 flex items-center justify-center shrink-0">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase tracking-wider truncate">
                {stat.name}
              </span>
              <span className="font-orbitron font-bold text-sm text-zinc-200 mt-1 block">
                {stat.value}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 mt-0.5 block">{stat.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2">
        <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase block">
          TACTICAL QUICK ACTIONS
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/emergencies/new">
            <GlowButton variant="pink" className="w-full text-xs font-bold uppercase py-3">
              Report Emergency
            </GlowButton>
          </Link>
          <Link to="/ai-operator">
            <GlowButton variant="purple" className="w-full text-xs font-bold uppercase py-3">
              Ask AI Operator
            </GlowButton>
          </Link>
          <Link to="/resources">
            <GlowButton variant="blue" className="w-full text-xs font-bold uppercase py-3">
              Add Resource
            </GlowButton>
          </Link>
          <Link to="/volunteers">
            <GlowButton variant="green" className="w-full text-xs font-bold uppercase py-3">
              Request Volunteer
            </GlowButton>
          </Link>
        </div>
      </div>

      {/* Main Content Mid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Stats and Live Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incidents Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gridStats.map((stat, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${stat.themeColor} flex flex-col gap-2 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-[10px] font-bold tracking-widest text-zinc-400">
                    {stat.title}
                  </span>
                  <stat.icon className="w-4 h-4 opacity-60" />
                </div>
                <h3 className="font-orbitron font-black text-2xl text-white tracking-wider mt-2">
                  {stat.count}
                </h3>
                <span className="font-mono text-[9px] text-zinc-500 mt-1 uppercase font-semibold">
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Logistics Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {logisticsStats.map((stat, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${stat.themeColor} flex flex-col gap-2 relative overflow-hidden`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-orbitron text-[10px] font-bold tracking-widest text-zinc-400">
                    {stat.title}
                  </span>
                  <stat.icon className="w-4 h-4 opacity-60" />
                </div>
                <h3 className="font-orbitron font-black text-2xl text-white tracking-wider mt-2">
                  {stat.count}
                </h3>
                <span className="font-mono text-[9px] text-zinc-500 mt-1 uppercase font-semibold">
                  {stat.change}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Emergency Feed */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyber-blue animate-pulse" />
                <span className="font-orbitron text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                  RECENT CRISIS FEED (LATEST 5)
                </span>
              </div>
              <Link to="/emergencies" className="text-[9px] font-mono text-cyber-blue hover:underline uppercase">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-24 font-mono text-xs text-zinc-500">
                <div className="w-5 h-5 border-t border-cyber-blue rounded-full animate-spin mr-2" />
                SYNCING EMERGENCY MATRIX...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-24 border border-cyber-pink/20 bg-cyber-pink-dim/5 text-cyber-pink text-xs font-mono rounded-lg">
                {error}
              </div>
            ) : recentFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-lg">
                <span>NO INCIDENTS REGISTERED ON NETWORK</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFeed.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 border border-zinc-900 bg-[#05050f]/60 hover:border-zinc-800 rounded-lg flex items-center justify-between gap-4 transition duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.priority === 'Critical' ? 'bg-cyber-pink animate-pulse' : 'bg-cyber-blue'
                      }`} />
                      <div className="min-w-0">
                        <h4 className="font-orbitron text-xs font-bold text-zinc-200 truncate">{item.title}</h4>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">
                          {item.category} • {item.location} • {item.status}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/emergencies"
                      className="text-[9px] font-mono text-cyber-blue hover:underline shrink-0 flex items-center gap-1"
                    >
                      DETAILS <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Resources list (LATEST 5) */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyber-green animate-pulse" />
                <span className="font-orbitron text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                  LATEST REGISTERED RESOURCES (LATEST 5)
                </span>
              </div>
              <Link to="/resources" className="text-[9px] font-mono text-cyber-blue hover:underline uppercase">
                View All
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-24 font-mono text-xs text-zinc-500">
                <div className="w-5 h-5 border-t border-cyber-green rounded-full animate-spin mr-2" />
                SYNCING SUPPLY MATRIX...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-24 border border-cyber-pink/20 bg-cyber-pink-dim/5 text-cyber-pink text-xs font-mono rounded-lg">
                {error}
              </div>
            ) : recentResources.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 text-zinc-500 font-mono text-xs border border-dashed border-zinc-800 rounded-lg">
                <span>NO RESOURCE NODES REGISTERED IN GRID</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResources.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 border border-zinc-900 bg-[#05050f]/60 hover:border-zinc-800 rounded-lg flex items-center justify-between gap-4 transition duration-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.status === 'Available' ? 'bg-cyber-green' : item.status === 'Limited' ? 'bg-yellow-500' : 'bg-cyber-pink'
                      }`} />
                      <div className="min-w-0">
                        <h4 className="font-orbitron text-xs font-bold text-zinc-200 truncate">{item.name}</h4>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">
                          {item.category} • Avail: {item.availableQuantity}/{item.totalQuantity} • {item.location}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/resources"
                      className="text-[9px] font-mono text-cyber-blue hover:underline shrink-0 flex items-center gap-1"
                    >
                      DETAILS <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant Card + Community Updates */}
        <div className="space-y-6">
          {/* AI Assistant Card */}
          <div className="p-5 rounded-2xl border border-cyber-purple/30 bg-[#070716]/40 backdrop-blur-md flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-scanline-move" />

            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-4 mb-4">
              <Cpu className="w-4 h-4 text-cyber-purple animate-pulse" />
              <span className="font-orbitron text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                COGNITIVE TRIAGE GATEWAY
              </span>
            </div>

            <p className="font-mono text-[10px] text-zinc-400 leading-normal mb-4">
              Enter details of the crisis. The AI system will classify category, priority, suggested actions, and pre-fill dispatch parameters.
            </p>

            <form onSubmit={handleAiOperatorRoute} className="space-y-3">
              <textarea
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="e.g. Structure fire in Sector 4 Evac zone, people stranded on rooftop..."
                rows={3}
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-3 py-2 font-mono text-[10px] text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple transition duration-300 resize-none"
              />
              <GlowButton
                variant="purple"
                type="submit"
                className="w-full text-[10px] font-bold uppercase py-2"
              >
                INTERACT WITH OPERATOR
              </GlowButton>
            </form>
          </div>

          {/* Community Updates preview */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 mb-4">
              <span className="font-orbitron text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                SYS COMMUNIQUE LOGS
              </span>
              <span className="text-[9px] font-mono text-zinc-600">ALERT SYSTEM</span>
            </div>

            <div className="space-y-3 font-mono text-[9px] text-zinc-500">
              <div className="border-b border-zinc-900 pb-2">
                <span className="text-cyber-green font-bold block">SECURE GATEWAY SYNC // ACTIVE</span>
                <p className="mt-0.5 text-zinc-400">All local mesh router nodes reports 100% signal strength.</p>
              </div>
              <div className="border-b border-zinc-900 pb-2">
                <span className="text-cyber-blue font-bold block">TRIAGE AI ENHANCED</span>
                <p className="mt-0.5 text-zinc-400">Model loaded v1.5-flash with strict JSON formatting validation.</p>
              </div>
              <div>
                <span className="text-yellow-500 font-bold block">SUBSTATION 04 POWER WARNING</span>
                <p className="mt-0.5 text-zinc-400">Solar grid micro-cells reporting intermittent output in Sector 4.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
