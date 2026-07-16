import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Users, ShieldAlert, Heart, CheckCircle2, Search, Phone, MapPin, X, AlertTriangle, Edit
} from 'lucide-react';
import { volunteerService } from '../services/volunteerService';
import { emergencyService } from '../services/emergencyService';
import useAuth from '../hooks/useAuth';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const Volunteers = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'Admin';
  const isVolunteerRole = user?.role === 'Volunteer';

  const [volunteers, setVolunteers] = useState([]);
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [profileNotFound, setProfileNotFound] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Modals / forms state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [assigningVolunteerId, setAssigningVolunteerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Profile Form state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileSkills, setProfileSkills] = useState([]);

  const skillOptions = [
    'Medical', 'Fire Response', 'Food Distribution', 'Transport', 
    'Search and Rescue', 'Communication', 'Security', 'General Support'
  ];
  
  const availabilities = ['Available', 'Busy', 'Offline'];

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const fetchVolunteersAndEmergencies = async () => {
    setLoading(true);
    setError('');
    setProfileNotFound(false);
    try {
      if (isVolunteerRole) {
        try {
          const myProfileRes = await volunteerService.getMyProfile();
          const profile = myProfileRes?.data?.data || myProfileRes?.data?.volunteer || myProfileRes?.data || null;
          if (profile) {
            setMyProfile(profile);
            setProfileName(profile.name);
            setProfilePhone(profile.phone);
            setProfileLocation(profile.location);
            setProfileSkills(profile.skills || []);
          } else {
            setProfileNotFound(true);
            setMyProfile(null);
          }
        } catch (profileErr) {
          if (profileErr.response?.status === 404) {
            setProfileNotFound(true);
            setMyProfile(null);
          } else {
            setError(profileErr.response?.data?.message || 'FAILED TO RETRIEVE VOLUNTEER PASS DATA');
          }
        }
      } else {
        // Fetch all volunteers registry for Admin/Operator
        const response = await volunteerService.getVolunteers({
          search,
          skill: skillFilter,
          availability: availabilityFilter
        });
        setVolunteers(response.data || []);

        if (isAdmin) {
          const emergenciesRes = await emergencyService.getEmergencies();
          const active = (emergenciesRes.data || []).filter(e => e.status !== 'Resolved');
          setActiveEmergencies(active);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'FAILED TO RETRIEVE MESH INFORMATION');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteersAndEmergencies();
  }, [search, skillFilter, availabilityFilter, user]);

  useEffect(() => {
    if (location.state?.openProfileModal) {
      setShowProfileModal(true);
    }
  }, [location]);

  useEffect(() => {
    if (showProfileModal) {
      if (myProfile) {
        setProfileName(myProfile.name || '');
        setProfilePhone(myProfile.phone || '');
        setProfileLocation(myProfile.location || '');
        setProfileSkills(myProfile.skills || []);
      } else {
        setProfileName('');
        setProfilePhone('');
        setProfileLocation('');
        setProfileSkills([]);
      }
      setFieldErrors({});
    }
  }, [showProfileModal, myProfile]);

  const validateForm = () => {
    const errors = {};
    if (!profileName.trim()) errors.name = 'Node name is required';
    if (!profileLocation.trim()) errors.location = 'Location is required';
    
    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    if (!profilePhone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(profilePhone.trim())) {
      errors.phone = 'Phone number is invalid (7-15 digits)';
    }

    if (!profileSkills || profileSkills.length === 0) {
      errors.skills = 'At least one skill must be selected';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await volunteerService.createOrUpdateProfile({
        name: profileName,
        phone: profilePhone,
        location: profileLocation,
        skills: profileSkills
      });
      const updatedProfile = response?.data || response;
      setMyProfile(updatedProfile);
      setProfileNotFound(false);
      setShowProfileModal(false);
      triggerSuccess('VOLUNTEER NODE PROFILE INSTANTIATED');
      fetchVolunteersAndEmergencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkillToggle = (skill) => {
    setProfileSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleToggleMyAvailability = async (avail) => {
    try {
      await volunteerService.updateAvailability(avail);
      triggerSuccess(`AVAILABILITY UPDATED: ${avail.toUpperCase()}`);
      fetchVolunteersAndEmergencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleAssignSubmit = async (emergencyId) => {
    try {
      await emergencyService.assignVolunteer(emergencyId, assigningVolunteerId);
      setAssigningVolunteerId(null);
      triggerSuccess('VOLUNTEER DEPLOYED TO INCIDENT NODE');
      fetchVolunteersAndEmergencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign volunteer');
    }
  };

  const handleCompleteTask = async (volunteerId, emergencyId) => {
    try {
      await volunteerService.completeAssignment(volunteerId, emergencyId);
      triggerSuccess('ASSIGNMENT COMPLETED AND CREDITED');
      fetchVolunteersAndEmergencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete assignment');
    }
  };

  const getAvailColor = (av) => {
    switch (av) {
      case 'Available': return 'text-cyber-green bg-cyber-green/10 border-cyber-green/30';
      case 'Busy': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Offline':
      default: return 'text-zinc-500 bg-zinc-900 border-zinc-800';
    }
  };

  const getAvailGlow = (av) => {
    switch (av) {
      case 'Available': return 'border-cyber-green/30 shadow-[0_0_15px_rgba(0,255,102,0.08)] bg-cyber-green-dim/5';
      case 'Busy': return 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.08)] bg-yellow-500/5';
      case 'Offline':
      default: return 'border-zinc-800 bg-[#070716]/20';
    }
  };

  // Safe checks
  const mySkills = Array.isArray(myProfile?.skills) ? myProfile.skills : [];
  const myCompletedCount = Array.isArray(myProfile?.completedAssignments) ? myProfile.completedAssignments.length : 0;
  const myActiveAssignment = myProfile?.activeAssignment || null;

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="blue" />

      {/* Success notification */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl border border-cyber-green/30 bg-zinc-950/90 text-cyber-green font-mono text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            {isVolunteerRole ? 'MY VOLUNTEER IDENTITY MODULE' : 'FIELD VOLUNTEER DISPATCH BOARD'}
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            {isVolunteerRole ? 'VOLUNTEER CONSOLE' : 'VOLUNTEER MESH'}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 font-mono text-zinc-500 text-xs">
          <div className="w-8 h-8 rounded-full border-t border-cyber-blue animate-spin mb-4" />
          <span>CONNECTING MESH REGISTRY...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 border border-cyber-pink/30 bg-cyber-pink-dim/10 rounded-2xl text-cyber-pink font-mono text-xs">
          <AlertTriangle className="w-8 h-8 mb-2" />
          <span>{error}</span>
        </div>
      ) : isVolunteerRole ? (
        /* VOLUNTEER ROLE LAYOUT */
        <div className="max-w-2xl mx-auto space-y-6">
          {profileNotFound || !myProfile ? (
            <div className="p-8 rounded-2xl border border-zinc-800 bg-[#070716]/60 backdrop-blur-md text-center space-y-4">
              <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto animate-pulse" />
              <p className="font-mono text-xs text-zinc-400">Volunteer profile not configured yet.</p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="font-orbitron font-bold text-xs py-2.5 px-6 border border-cyber-blue text-cyber-blue bg-cyber-blue-dim/10 hover:bg-cyber-blue hover:text-black rounded tracking-wider transition uppercase"
              >
                CREATE VOLUNTEER PROFILE
              </button>
            </div>
          ) : (
            <div className={`p-6 rounded-2xl border ${getAvailGlow(myProfile.availability)} relative space-y-6`}>
              {/* Profile Card Header */}
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800/60 pb-4">
                <div className="space-y-1">
                  <h2 className="font-orbitron font-black text-lg text-white uppercase tracking-wider">{myProfile.name}</h2>
                  <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>SECTOR LOCATION: {myProfile.location}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-1 font-mono text-[9px] text-cyber-blue hover:underline uppercase"
                  >
                    <Edit className="w-3 h-3" />
                    Edit Profile
                  </button>
                  <span className={`font-mono text-[9px] font-bold px-2 py-0.5 border rounded uppercase ${getAvailColor(myProfile.availability)}`}>
                    {myProfile.availability}
                  </span>
                </div>
              </div>

              {/* Secure Line & Completed runs */}
              <div className="grid grid-cols-2 gap-4 font-mono text-[10px] text-zinc-400">
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-600 uppercase text-[9px]">Secure Line:</span>
                  <span className="text-zinc-200 text-sm font-semibold">{myProfile.phone}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-600 uppercase text-[9px]">Completed Missions:</span>
                  <span className="text-cyber-green text-sm font-bold">{myCompletedCount} Runs</span>
                </div>
              </div>

              {/* Skills matrix */}
              <div className="space-y-2">
                <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest block">SKILL MATRIX</span>
                <div className="flex flex-wrap gap-1.5">
                  {mySkills.map((s, idx) => (
                    <span key={idx} className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] px-2.5 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                  {mySkills.length === 0 && <span className="text-zinc-500 italic text-[10px]">No skills logged.</span>}
                </div>
              </div>

              {/* Availability toggler */}
              <div className="border-t border-zinc-900 pt-4 space-y-2">
                <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest block">SET STATUS VALUE</span>
                <div className="flex bg-[#03030c] border border-zinc-800 rounded p-1 max-w-xs">
                  {availabilities.map(av => (
                    <button
                      key={av}
                      onClick={() => handleToggleMyAvailability(av)}
                      className={`flex-1 font-mono text-[8px] font-bold px-3 py-1.5 rounded transition uppercase ${
                        myProfile.availability === av 
                          ? 'bg-cyber-blue text-black font-extrabold shadow' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Assignment indicator */}
              {myActiveAssignment ? (
                <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
                  <div>
                    <span className="text-yellow-500 font-bold block text-[10px] tracking-wider uppercase">ACTIVE ASSIGNMENT DEPLOYED</span>
                    <p className="mt-1 text-zinc-300">
                      Crisis: <span className="text-white font-bold">{myActiveAssignment.title}</span> ({myActiveAssignment.location})
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteTask(myProfile._id, myActiveAssignment._id)}
                    className="py-1.5 px-4 bg-cyber-green text-black font-orbitron font-extrabold text-[10px] rounded hover:bg-white transition uppercase shrink-0"
                  >
                    Mark Run Completed
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/20 text-zinc-500 font-mono text-[10px] text-center italic">
                  No active incidents assigned to this node. Set status to AVAILABLE to get requests.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ADMIN / OPERATOR LAYOUT */
        <>
          {/* Search & Filters */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-[#05050f]/80 backdrop-blur-md space-y-4 shadow-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search volunteers by name, location, skills..."
                className="w-full bg-[#03030d] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white focus:outline-none focus:border-cyber-blue transition duration-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Skill filter</span>
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
                >
                  <option value="ALL">ALL SKILLS</option>
                  {skillOptions.map((s) => (
                    <option key={s} value={s}>{s.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Availability filter</span>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
                >
                  <option value="ALL">ALL AVAILABILITIES</option>
                  {availabilities.map((av) => (
                    <option key={av} value={av}>{av.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Volunteer Grid List */}
          <div className="relative">
            {volunteers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs text-center">
                <Users className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
                <span>No volunteers currently online.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {volunteers.map((vol) => {
                  const compCount = vol.completedAssignments ? vol.completedAssignments.length : 0;
                  const hasActive = !!vol.activeAssignment;

                  return (
                    <div
                      key={vol._id}
                      className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${getAvailGlow(vol.availability)}`}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getAvailColor(vol.availability)}`}>
                              {vol.availability}
                            </span>
                          </div>
                          <span className="font-mono text-[9px] text-zinc-500 uppercase flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                            {vol.location}
                          </span>
                        </div>

                        {/* Name, Contact, & Skills */}
                        <div className="space-y-2">
                          <h3 className="font-orbitron font-extrabold text-base text-zinc-200 tracking-wide">
                            {vol.name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {vol.skills.map((s, idx) => (
                              <span key={idx} className="bg-zinc-900 border border-zinc-800/80 text-zinc-400 font-mono text-[9px] px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Contact stats */}
                        <div className="font-mono text-[10px] text-zinc-400 space-y-1.5 pt-3 border-t border-zinc-900">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>SECURE LINE: <span className="text-zinc-200">{vol.phone}</span></span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>COMPLETED RUNS: <span className="text-cyber-green font-bold">{compCount}</span></span>
                            {hasActive && (
                              <span className="text-yellow-500 font-bold uppercase truncate max-w-[150px]">
                                ACTIVE: {vol.activeAssignment.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Admin controls */}
                      {isAdmin && (
                        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-zinc-900/50">
                          {assigningVolunteerId === vol._id ? (
                            <div className="space-y-2">
                              <span className="font-orbitron text-[9px] text-zinc-500 font-bold uppercase block">SELECT INCIDENT OBJECTIVE</span>
                              {activeEmergencies.length === 0 ? (
                                <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono">
                                  <span>NO ACTIVE INCIDENTS REGISTERED</span>
                                  <button onClick={() => setAssigningVolunteerId(null)} className="text-[9px] font-bold text-zinc-400 hover:underline uppercase">CANCEL</button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <select
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleAssignSubmit(e.target.value);
                                      }
                                    }}
                                    className="w-full bg-[#03030d] border border-zinc-800 rounded px-2 py-1.5 font-mono text-[10px] text-zinc-200 focus:outline-none focus:border-cyber-blue"
                                  >
                                    <option value="">CHOOSE OBJECTIVE...</option>
                                    {activeEmergencies.map(e => (
                                      <option key={e._id} value={e._id}>{e.title.toUpperCase()} ({e.location})</option>
                                    ))}
                                  </select>
                                  <button onClick={() => setAssigningVolunteerId(null)} className="text-[8px] font-bold text-zinc-500 text-right hover:underline uppercase mt-1">CANCEL</button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setAssigningVolunteerId(vol._id)}
                              disabled={vol.availability === 'Busy' || vol.availability === 'Offline'}
                              className={`font-orbitron font-bold text-[9px] py-1.5 px-3 border rounded tracking-wider transition uppercase text-center w-full ${
                                vol.availability === 'Available'
                                  ? 'border-cyber-blue text-cyber-blue bg-cyber-blue-dim/10 hover:bg-cyber-blue hover:text-black'
                                  : 'border-zinc-900 text-zinc-600 cursor-not-allowed'
                              }`}
                            >
                              {vol.availability === 'Busy' ? 'Currently Deployed' : vol.availability === 'Offline' ? 'Volunteer Offline' : 'Assign to Incident'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* PROFILE DIALOG */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-cyber-blue/30 bg-[#080816] relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-orbitron font-bold text-base text-white uppercase mb-4 tracking-wider">
              {myProfile ? 'UPDATE VOLUNTEER PROFILE' : 'SETUP VOLUNTEER PROFILE'}
            </h2>
            <form onSubmit={handleCreateOrUpdateProfile} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Node name</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.name && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Secure phone</label>
                  <input type="text" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.phone && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.phone}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 text-[9px] uppercase">Current sector location</label>
                <input type="text" value={profileLocation} onChange={(e) => setProfileLocation(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                {fieldErrors.location && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.location}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 text-[9px] uppercase block mb-1">Select Skills</label>
                <div className="grid grid-cols-2 gap-2 border border-zinc-800 p-3 rounded bg-black">
                  {skillOptions.map(skill => {
                    const isChecked = profileSkills.includes(skill);
                    return (
                      <label key={skill} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSkillToggle(skill)}
                          className="rounded text-cyber-blue focus:ring-0 accent-cyber-blue bg-zinc-950 border-zinc-800"
                        />
                        <span>{skill}</span>
                      </label>
                    );
                  })}
                </div>
                {fieldErrors.skills && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.skills}</span>}
              </div>

              <GlowButton variant="blue" type="submit" disabled={submitting} className="w-full">
                {submitting ? 'SUBMITTING...' : 'SUBMIT PROFILE DATA'}
              </GlowButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
