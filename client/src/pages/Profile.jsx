import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Shield, Clock, Activity, AlertTriangle, RefreshCw, Cpu, CheckCircle2, Phone, MapPin
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { volunteerService } from '../services/volunteerService';
import { emergencyService } from '../services/emergencyService';
import { resourceService } from '../services/resourceService';
import CyberBackground from '../components/CyberBackground';

// Safe Error Boundary for Profile card
class ProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Profile render error caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border border-cyber-pink/40 bg-cyber-pink-dim/10 text-cyber-pink font-mono text-xs rounded-xl space-y-4">
          <h2 className="font-orbitron font-bold text-sm uppercase">IDENTITY CHIP CRITICAL ERROR</h2>
          <p className="mt-2 text-zinc-400">The security pass card failed to parse identity hashes. Refreshing registry might restore link.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-1.5 border border-cyber-pink bg-[#03030d] text-white hover:bg-cyber-pink hover:text-black transition text-[10px] uppercase font-bold"
          >
            Reboot Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Volunteer specific state
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [profileNotFound, setProfileNotFound] = useState(false);
  
  // Admin specific stats
  const [adminStats, setAdminStats] = useState({
    emergenciesCreated: 0,
    resourcesCreated: 0,
    volunteersAssigned: 0,
    resolvedEmergencies: 0
  });

  // AI Operator specific stats
  const [aiStats, setAiStats] = useState({
    totalAiAnalyses: 0,
    emergenciesCreatedFromAi: 0,
    lastActivity: 'N/A'
  });

  const fetchProfileData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    setProfileNotFound(false);

    try {
      const isVolunteer = user.role?.toLowerCase() === 'volunteer';

      if (isVolunteer) {
        try {
          const response = await volunteerService.getMyProfile();
          // Use safe defaults requested
          const profile = response?.data?.data || response?.data?.volunteer || response?.data || null;
          
          if (!profile) {
            setProfileNotFound(true);
          } else {
            setVolunteerProfile(profile);
          }
        } catch (profileErr) {
          // If GET /api/volunteers/me returns 404, do not treat it as a fatal page error.
          if (profileErr.response?.status === 404) {
            setProfileNotFound(true);
            setVolunteerProfile(null);
          } else {
            setError(profileErr.response?.data?.message || 'FAILED TO RETRIEVE VOLUNTEER PASS DATA');
          }
        }
      } else if (user.role?.toLowerCase() === 'admin') {
        try {
          const statsRes = await emergencyService.getStatsSummary();
          const resStatsRes = await resourceService.getStatsSummary();
          const volStatsRes = await volunteerService.getStatsSummary();

          setAdminStats({
            emergenciesCreated: statsRes?.data?.total || 0,
            resourcesCreated: resStatsRes?.data?.totalResources || 0,
            volunteersAssigned: volStatsRes?.data?.busyVolunteers || 0,
            resolvedEmergencies: statsRes?.data?.resolved || 0
          });
        } catch (statsErr) {
          console.error('Failed to load admin stats:', statsErr);
        }
      } else if (user.role?.toLowerCase() === 'ai operator') {
        try {
          const allEmergenciesRes = await emergencyService.getEmergencies();
          const emergencies = allEmergenciesRes.data || [];

          // Compute AI statistics from database emergencies
          const aiAnalyses = emergencies.filter(e => e.aiSummary && e.aiSummary.trim() !== '');
          const operatorAiEmergencies = aiAnalyses.filter(e => e.createdBy === user._id || e.createdBy?._id === user._id);
          
          let lastActivityDate = 'N/A';
          const myEmergencies = emergencies.filter(e => e.createdBy === user._id || e.createdBy?._id === user._id);
          if (myEmergencies.length > 0) {
            const sortedByDate = [...myEmergencies].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            lastActivityDate = new Date(sortedByDate[0].updatedAt).toLocaleString();
          } else if (user.createdAt) {
            lastActivityDate = new Date(user.createdAt).toLocaleString();
          }

          setAiStats({
            totalAiAnalyses: aiAnalyses.length,
            emergenciesCreatedFromAi: operatorAiEmergencies.length,
            lastActivity: lastActivityDate
          });
        } catch (aiErr) {
          console.error('Failed to load AI Operator stats:', aiErr);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'FAILED TO RETRIEVE PROFILE CORE TELEMETRY');
    } finally {
      // Ensure the loading state always stops using finally
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const accountCreatedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  // Apply safe defaults mapping:
  const skills = Array.isArray(volunteerProfile?.skills)
    ? volunteerProfile.skills
    : [];

  const completedAssignments = Array.isArray(
    volunteerProfile?.completedAssignments
  )
    ? volunteerProfile.completedAssignments
    : [];

  const activeAssignment =
    volunteerProfile?.activeAssignment || null;

  const currentAvailability = volunteerProfile?.availability || 'Offline';

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="purple" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            USER ENCRYPTED PASS CARD
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            NODE IDENTITY
          </h1>
        </div>

        <button 
          onClick={fetchProfileData}
          className="flex items-center gap-1.5 font-mono text-[9px] text-cyber-purple hover:text-white uppercase border border-cyber-purple/30 bg-cyber-purple-dim/5 hover:bg-cyber-purple-dim/20 px-3 py-1.5 rounded transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Registry
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 font-mono text-zinc-500 text-xs">
          <div className="w-8 h-8 rounded-full border-t border-cyber-purple animate-spin mb-4" />
          <span>QUERYING IDENT METADATA...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 border border-cyber-pink/30 bg-cyber-pink-dim/10 rounded-2xl text-cyber-pink font-mono text-xs">
          <AlertTriangle className="w-8 h-8 mb-2 animate-bounce" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Identity Security Card */}
          <div className="p-6 rounded-2xl border border-cyber-purple/30 bg-[#080816]/70 backdrop-blur-md shadow-[0_0_30px_rgba(189,0,255,0.08)] relative overflow-hidden flex flex-col justify-between">
            {/* Hologram scan line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-cyber-purple/40 animate-scanline-move pointer-events-none" />

            {/* Corners */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyber-purple" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t border-r border-cyber-purple" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-cyber-purple" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyber-purple" />

            {/* Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border border-cyber-purple/40 bg-cyber-purple-dim/10 flex items-center justify-center relative shrink-0">
                  <User className="w-6 h-6 text-cyber-purple animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-orbitron font-black text-base text-white tracking-wide truncate">
                    {user?.name || 'NODE_GUEST_01'}
                  </h3>
                  <span className="font-mono text-[10px] text-cyber-purple font-semibold uppercase tracking-widest block mt-0.5">
                    LEVEL: {user?.role || 'Civilian'}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-4 space-y-3 font-mono text-[10px] text-zinc-400">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600 uppercase shrink-0">Account ID:</span>
                  <span className="text-zinc-300 truncate">{user?._id || 'MOCK-USR-GUEST'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600 uppercase shrink-0">Sys Net:</span>
                  <span className="text-zinc-300 truncate">{user?.email || 'unlinked@signalx.net'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600 uppercase shrink-0">Clearance:</span>
                  <span className="text-zinc-300 uppercase">{user?.role || 'Civilian'} ACCESS</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600 uppercase shrink-0">Created Date:</span>
                  <span className="text-zinc-300">{accountCreatedDate}</span>
                </div>
                {user?.role?.toLowerCase() === 'volunteer' && (
                  <div className="flex justify-between gap-4">
                    <span className="text-zinc-600 uppercase shrink-0">Availability:</span>
                    <span className={`font-bold ${
                      currentAvailability === 'Available' ? 'text-cyber-green' : currentAvailability === 'Busy' ? 'text-yellow-500' : 'text-zinc-500'
                    }`}>{currentAvailability.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-zinc-900 pt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500">
                <Shield className="w-3.5 h-3.5 text-cyber-purple" />
                <span>SECURE ACCESS PASS</span>
              </div>
              <span className="font-mono text-[9px] text-cyber-green font-bold tracking-widest uppercase">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Right side: Operations Log / completed missions depending on role */}
          <div className="lg:col-span-2 space-y-6">

            {/* Volunteer Profile Diagnostics Box */}
            {user?.role?.toLowerCase() === 'volunteer' && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3 font-orbitron text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-cyber-blue" />
                  <span>Volunteer Diagnostics</span>
                </div>
                
                {profileNotFound ? (
                  <div className="space-y-4 py-2 font-mono text-zinc-500 text-[10px]">
                    <p>Volunteer profile not configured yet.</p>
                    <button
                      onClick={() => navigate('/volunteers', { state: { openProfileModal: true } })}
                      className="font-orbitron font-bold text-[9px] tracking-wider py-2 px-4 border border-cyber-blue text-cyber-blue bg-cyber-blue-dim/10 hover:bg-cyber-blue hover:text-black transition uppercase rounded"
                    >
                      Create Volunteer Profile
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[10px]">
                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-zinc-600 uppercase text-[9px]">Secure Line:</span>
                        <span className="text-zinc-300 text-xs font-semibold">{volunteerProfile?.phone || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-zinc-600 uppercase text-[9px]">Sector Location:</span>
                        <span className="text-zinc-300 text-xs font-semibold">{volunteerProfile?.location || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-zinc-600 uppercase text-[9px]">Active incident:</span>
                        <span className={`text-xs font-semibold ${activeAssignment ? 'text-yellow-500' : 'text-zinc-400'}`}>
                          {activeAssignment ? activeAssignment.title : 'None assigned'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-col">
                        <span className="text-zinc-600 uppercase text-[9px]">Skill Matrix:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {skills.length > 0 ? (
                            skills.map((s, idx) => (
                              <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[9px] px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500">None logged</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col mt-2">
                        <span className="text-zinc-600 uppercase text-[9px]">Dispatches Cleared:</span>
                        <span className="text-cyber-green text-sm font-black">{completedAssignments.length} Runs</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Completed missions grid (ONLY for Volunteer role) */}
            {user?.role?.toLowerCase() === 'volunteer' && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md flex flex-col shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyber-purple animate-pulse" />
                    <span className="font-orbitron text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                      DISPATCH RUN HISTORY
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600">COMPLETED_LIST</span>
                </div>

                {/* Missions List */}
                <div className="space-y-3 overflow-y-auto max-h-80 font-mono text-[11px]">
                  {profileNotFound || completedAssignments.length === 0 ? (
                    <div className="text-center py-10 text-zinc-500 italic">
                      No completed dispatches yet.
                    </div>
                  ) : (
                    completedAssignments.map((mis) => {
                      const completeDate = mis.updatedAt ? new Date(mis.updatedAt).toLocaleDateString() : 'Date Unknown';
                      return (
                        <div
                          key={mis._id}
                          className="p-3.5 rounded-xl border border-zinc-900 bg-[#05050f]/60 hover:border-cyber-purple/20 transition duration-300 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-4 h-4 text-cyber-green shrink-0 animate-pulse" />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-zinc-300">{mis.title}</span>
                              <span className="text-[9px] text-zinc-500">
                                CATEGORY: {mis.category} • LOCATION: {mis.location} • COMPLETED: {completeDate}
                              </span>
                            </div>
                          </div>
                          <span className="text-cyber-green font-bold shrink-0 text-[10px] uppercase">
                            {mis.status}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Admin specific stats summary box */}
            {user?.role?.toLowerCase() === 'admin' && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3 font-orbitron text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-cyber-purple animate-pulse" />
                  <span>Admin Operations Registry</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Emergencies Registered</span>
                    <span className="font-orbitron font-black text-2xl text-cyber-pink">{adminStats.emergenciesCreated}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Resources Deployed</span>
                    <span className="font-orbitron font-black text-2xl text-cyber-blue">{adminStats.resourcesCreated}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Volunteers Deployed</span>
                    <span className="font-orbitron font-black text-2xl text-yellow-500">{adminStats.volunteersAssigned}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Resolved Incidents</span>
                    <span className="font-orbitron font-black text-2xl text-cyber-green">{adminStats.resolvedEmergencies}</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI Operator specific stats summary box */}
            {user?.role?.toLowerCase() === 'ai operator' && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3 font-orbitron text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-cyber-purple animate-pulse" />
                  <span>AI Operator Control Console</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Total AI Analyses</span>
                    <span className="font-orbitron font-black text-2xl text-cyber-purple">{aiStats.totalAiAnalyses}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">AI Creations</span>
                    <span className="font-orbitron font-black text-2xl text-cyber-blue">{aiStats.emergenciesCreatedFromAi}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-900 bg-black/40 flex flex-col gap-1.5 sm:col-span-3">
                    <span className="font-mono text-[9px] text-zinc-500 uppercase">Last Operator Activity</span>
                    <span className="font-mono text-xs font-semibold text-zinc-300 mt-1">{aiStats.lastActivity}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Civilian specific box */}
            {user?.role?.toLowerCase() === 'civilian' && (
              <div className="p-5 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3 font-orbitron text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Civilian Node Dashboard</span>
                </div>
                <div className="font-mono text-[10px] text-zinc-400 leading-relaxed">
                  You are logged into the SIGNALX mesh network as a civilian observer. Register as a Volunteer or contact an Operator to elevate node clearances.
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export const ProfileWrapper = () => (
  <ProfileErrorBoundary>
    <Profile />
  </ProfileErrorBoundary>
);

export default ProfileWrapper;
