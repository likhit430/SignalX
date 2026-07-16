import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, Search, Trash2, Users, Plus, X
} from 'lucide-react';
import { emergencyService } from '../services/emergencyService';
import { volunteerService } from '../services/volunteerService';
import { resourceService } from '../services/resourceService';
import useAuth from '../hooks/useAuth';
import CyberBackground from '../components/CyberBackground';

export const Emergencies = () => {
  const { user } = useAuth();

  const [emergencies, setEmergencies] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Allocation UI States
  const [selectedResources, setSelectedResources] = useState({});
  const [allocationQuantities, setAllocationQuantities] = useState({});
  const [allocatingMap, setAllocatingMap] = useState({});
  const [allocationErrors, setAllocationErrors] = useState({});

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Deletion confirm state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const categories = ['ALL', 'Medical', 'Fire', 'Food', 'Water', 'Shelter', 'Missing Person', 'Security', 'Other'];
  const priorities = ['ALL', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['ALL', 'Open', 'In Progress', 'Resolved'];

  const fetchLogistics = async () => {
    try {
      const volRes = await volunteerService.getVolunteers();
      // Only available volunteers can be newly assigned
      setVolunteers((volRes.data || []).filter(v => v.availability === 'Available'));
      
      const resRes = await resourceService.getResources();
      // Only resources with available quantity can be allocated
      setResources((resRes.data || []).filter(r => r.availableQuantity > 0));
    } catch (err) {
      console.error('Failed to fetch logistics data:', err);
    }
  };

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await emergencyService.getEmergencies();
      setEmergencies(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'FAILED TO RETRIEVE CRISIS DATASTREAM');
    } finally {
      setLoading(false);
    }
  };

  const syncAll = async () => {
    await fetchEmergencies();
    await fetchLogistics();
  };

  useEffect(() => {
    syncAll();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await emergencyService.updateStatus(id, newStatus);
      syncAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await emergencyService.deleteEmergency(id);
      setEmergencies((prev) => prev.filter((e) => e._id !== id));
      setConfirmDeleteId(null);
      syncAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to terminate incident record');
    }
  };

  const handleAssignVolunteer = async (emergencyId, volunteerId) => {
    try {
      await emergencyService.assignVolunteer(emergencyId, volunteerId);
      syncAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleUnassignVolunteer = async (emergencyId, volunteerId) => {
    if (!window.confirm('ARE YOU SURE YOU WANT TO DE-AUTHORIZE AND UNASSIGN THIS VOLUNTEER?')) {
      return;
    }
    try {
      await emergencyService.unassignVolunteer(emergencyId, volunteerId);
      syncAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Unassignment failed');
    }
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAllocateResource = async (emergencyId) => {
    const resourceId = selectedResources[emergencyId];
    const qtyRaw = allocationQuantities[emergencyId];
    
    if (!resourceId) {
      setAllocationErrors(prev => ({ ...prev, [emergencyId]: 'Please select a resource.' }));
      return;
    }

    const selectedRes = resources.find(r => r._id === resourceId);
    if (!selectedRes) {
      setAllocationErrors(prev => ({ ...prev, [emergencyId]: 'Selected resource not found.' }));
      return;
    }

    const qty = Number(qtyRaw === undefined ? 1 : qtyRaw);

    // Validation rules:
    // - prevent zero, negative, decimal, empty, or excessive quantity
    if (isNaN(qty) || !Number.isInteger(qty) || qty <= 0) {
      setAllocationErrors(prev => ({ ...prev, [emergencyId]: 'Quantity must be a positive integer.' }));
      return;
    }

    if (qty > selectedRes.availableQuantity) {
      setAllocationErrors(prev => ({ ...prev, [emergencyId]: `Insufficient stock. Max available: ${selectedRes.availableQuantity}` }));
      return;
    }

    // Set loading state
    setAllocatingMap(prev => ({ ...prev, [emergencyId]: true }));
    setAllocationErrors(prev => ({ ...prev, [emergencyId]: '' }));

    try {
      await emergencyService.allocateResource(emergencyId, resourceId, qty);
      
      // Reset inputs
      setSelectedResources(prev => ({ ...prev, [emergencyId]: '' }));
      setAllocationQuantities(prev => ({ ...prev, [emergencyId]: 1 }));
      
      triggerSuccess('RESOURCE ALLOCATED SUCCESSFULLY');
      
      // Refresh emergency and resource data
      await syncAll();
    } catch (err) {
      setAllocationErrors(prev => ({ ...prev, [emergencyId]: err.response?.data?.message || 'Allocation failed' }));
    } finally {
      setAllocatingMap(prev => ({ ...prev, [emergencyId]: false }));
    }
  };

  const handleReleaseResource = async (emergencyId, resourceId) => {
    if (!window.confirm('ARE YOU SURE YOU WANT TO RELEASE AND DE-ALLOCATE THIS RESOURCE?')) {
      return;
    }
    try {
      await emergencyService.removeResource(emergencyId, resourceId);
      syncAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Release failed');
    }
  };

  // Filter Logic
  const filteredEmergencies = emergencies.filter((item) => {
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const getPriorityGlow = (prio) => {
    switch (prio) {
      case 'Critical':
        return 'border-cyber-pink/40 shadow-[0_0_15px_rgba(255,0,85,0.2)] bg-cyber-pink-dim/5';
      case 'High':
        return 'border-orange-500/40 shadow-[0_0_15px_rgba(249,115,22,0.2)] bg-orange-500/5';
      case 'Medium':
        return 'border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)] bg-yellow-500/5';
      case 'Low':
      default:
        return 'border-cyber-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.2)] bg-cyber-blue-dim/5';
    }
  };

  const getPriorityBadgeColor = (prio) => {
    switch (prio) {
      case 'Critical': return 'bg-cyber-pink-dim text-cyber-pink border-cyber-pink/30';
      case 'High': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Low':
      default: return 'bg-cyber-blue-dim text-cyber-blue border-cyber-blue/20';
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="blue" />

      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl border border-cyber-green/30 bg-zinc-950/90 text-cyber-green font-mono text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            DECENTRALIZED DATABASE FEED
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            CRISIS REGISTRY
          </h1>
        </div>

        <button
          onClick={syncAll}
          className="font-orbitron font-bold text-[9px] border border-cyber-blue/30 bg-cyber-blue-dim/10 text-cyber-blue py-2 px-4 rounded hover:bg-cyber-blue hover:text-black transition uppercase tracking-widest shrink-0 self-start md:self-auto"
        >
          RE-SYNC NODE
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-[#05050f]/80 backdrop-blur-md space-y-4 shadow-xl">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search title, description, location..."
            className="w-full bg-[#03030d] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-blue transition duration-300"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid display area */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 font-mono text-zinc-500 text-xs">
            <div className="w-8 h-8 rounded-full border-t border-cyber-blue animate-spin mb-4" />
            <span>PULLING TELEMETRY STACK...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 border border-cyber-pink/30 bg-cyber-pink-dim/10 rounded-2xl text-cyber-pink font-mono text-xs">
            <ShieldAlert className="w-8 h-8 mb-2 animate-bounce" />
            <span>{error}</span>
          </div>
        ) : filteredEmergencies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs text-center">
            <CheckCircle2 className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
            <span>
              {emergencies.length === 0 ? 'No active incidents detected.' : 'No active incidents matches current filters.'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredEmergencies.map((item) => {
                const canDelete = user?._id === item.createdBy || user?.role === 'Admin';
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Date Unknown';

                return (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${getPriorityGlow(item.priority)}`}
                  >
                    {item.priority === 'Critical' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-pink animate-pulse" />
                    )}

                    <div className="space-y-4">
                      {/* Top Header line */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                            {item.category}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">{item.location}</span>
                      </div>

                      {/* Main Title & Description */}
                      <div className="space-y-1">
                        <h3 className="font-orbitron font-extrabold text-base text-zinc-200 tracking-wide">
                          {item.title}
                        </h3>
                        <p className="font-sans text-xs text-zinc-400 leading-relaxed pt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* AI Diagnostic details if present */}
                      {(item.aiSummary || item.suggestedAction) && (
                        <div className="p-3.5 rounded-lg border border-cyber-purple/20 bg-cyber-purple-dim/5 space-y-2 font-mono text-[9px] text-zinc-300">
                          {item.aiSummary && (
                            <div>
                              <span className="text-cyber-purple font-semibold uppercase block">AI Summary:</span>
                              <p className="mt-0.5 text-zinc-400 leading-normal">{item.aiSummary}</p>
                            </div>
                          )}
                          {item.suggestedAction && (
                            <div>
                              <span className="text-cyber-purple font-semibold uppercase block">Suggested Action:</span>
                              <p className="mt-0.5 text-zinc-400 leading-normal">{item.suggestedAction}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Logistics Section */}
                      <div className="space-y-3 pt-3 border-t border-zinc-800/40 font-mono text-[10px]">
                        {/* Assigned Volunteers */}
                        <div>
                          <span className="text-zinc-500 font-bold uppercase block mb-1">ASSIGNED VOLUNTEERS:</span>
                          {(!item.assignedVolunteers || item.assignedVolunteers.length === 0) ? (
                            <span className="text-zinc-600 block italic text-[9px]">No volunteers assigned.</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {item.assignedVolunteers.map((vol) => (
                                <span key={vol._id} className="bg-cyber-blue-dim/10 text-cyber-blue border border-cyber-blue/20 px-2 py-0.5 rounded text-[9px] flex items-center gap-1.5">
                                  {vol.name} ({vol.phone})
                                  {user?.role === 'Admin' && item.status !== 'Resolved' && (
                                    <button 
                                      onClick={() => handleUnassignVolunteer(item._id, vol._id)} 
                                      className="text-cyber-pink hover:text-white font-bold ml-1 font-mono"
                                      title="Remove Volunteer"
                                    >
                                      [X]
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Allocated Resources */}
                        <div>
                          <span className="text-zinc-500 font-bold uppercase block mb-1">ALLOCATED RESOURCES:</span>
                          {(!item.allocatedResources || item.allocatedResources.length === 0) ? (
                            <span className="text-zinc-600 block italic text-[9px]">No resources allocated.</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {item.allocatedResources.map((alloc) => {
                                const resName = alloc.resource ? alloc.resource.name : 'Unknown';
                                const qty = alloc.quantity || alloc.allocatedQuantity || 0;
                                return (
                                  <span key={alloc._id || alloc.resource?._id} className="bg-cyber-green-dim/10 text-cyber-green border border-cyber-green/20 px-2 py-0.5 rounded text-[9px] flex items-center gap-1.5">
                                    {resName} [Qty: {qty}]
                                    {user?.role === 'Admin' && item.status !== 'Resolved' && (
                                      <button 
                                        onClick={() => handleReleaseResource(item._id, alloc.resource?._id)} 
                                        className="text-cyber-pink hover:text-white font-bold ml-1 font-mono"
                                        title="Remove Resource"
                                      >
                                        [X]
                                      </button>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Admin allocation/assignment buttons */}
                        {user?.role === 'Admin' && item.status !== 'Resolved' && (
                          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-900/50">
                            {/* Assign Volunteer dropdown */}
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[9px] text-zinc-500 uppercase">Deploy volunteer</span>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignVolunteer(item._id, e.target.value);
                                  }
                                }}
                                className="bg-[#03030d] border border-zinc-800 rounded px-2 py-1 text-[9px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
                              >
                                <option value="">Select Volunteer...</option>
                                {volunteers.map(v => (
                                  <option key={v._id} value={v._id}>{v.name} ({v.skills.join(', ')})</option>
                                ))}
                              </select>
                            </div>

                             {/* Allocate Resource dropdown & quantity */}
                             <div className="flex-1 flex flex-col gap-1.5">
                               <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Allocate resource</span>
                               <select
                                 value={selectedResources[item._id] || ''}
                                 onChange={(e) => {
                                   const resId = e.target.value;
                                   setSelectedResources(prev => ({ ...prev, [item._id]: resId }));
                                   setAllocationQuantities(prev => ({ ...prev, [item._id]: 1 }));
                                   setAllocationErrors(prev => ({ ...prev, [item._id]: '' }));
                                 }}
                                 className="w-full bg-[#03030d] border border-zinc-800 rounded px-2 py-1 text-[9px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
                               >
                                 <option value="">Select Resource...</option>
                                 {resources.map(r => (
                                   <option key={r._id} value={r._id}>{r.name} (Avail: {r.availableQuantity})</option>
                                 ))}
                               </select>

                               {selectedResources[item._id] && (
                                 <div className="flex items-center justify-between text-[8px] text-zinc-400 font-mono">
                                   <span>Available Stock:</span>
                                   <span className="text-cyber-green font-bold">
                                     {resources.find(r => r._id === selectedResources[item._id])?.availableQuantity || 0}
                                   </span>
                                 </div>
                               )}

                               <div className="flex flex-col gap-1">
                                 <label className="text-[8px] text-zinc-500 uppercase">Allocation Quantity</label>
                                 <div className="flex gap-1.5">
                                   <input
                                     type="number"
                                     placeholder="Qty"
                                     min="1"
                                     max={selectedResources[item._id] ? (resources.find(r => r._id === selectedResources[item._id])?.availableQuantity || 1) : 1}
                                     value={allocationQuantities[item._id] !== undefined ? allocationQuantities[item._id] : 1}
                                     disabled={!selectedResources[item._id]}
                                     onChange={(e) => {
                                       const val = e.target.value;
                                       setAllocationQuantities(prev => ({ ...prev, [item._id]: val }));
                                       setAllocationErrors(prev => ({ ...prev, [item._id]: '' }));
                                     }}
                                     className="flex-1 bg-[#03030d] border border-zinc-800 rounded px-2 py-1 text-[9px] text-white focus:outline-none focus:border-cyber-blue disabled:opacity-40 disabled:cursor-not-allowed"
                                   />
                                   <button
                                     onClick={() => handleAllocateResource(item._id)}
                                     disabled={!selectedResources[item._id] || allocatingMap[item._id]}
                                     className="bg-cyber-blue-dim/20 border border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cyber-blue px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition shrink-0"
                                   >
                                     {allocatingMap[item._id] ? 'Allocating...' : 'Allocate Resource'}
                                   </button>
                                 </div>
                               </div>

                               {allocationErrors[item._id] && (
                                 <span className="text-[8px] text-cyber-pink font-mono block mt-1">
                                   {allocationErrors[item._id]}
                                 </span>
                               )}
                             </div>
                          </div>
                        )}
                      </div>

                      {/* Reporter details */}
                      <div className="font-mono text-[9px] text-zinc-500 pt-2 border-t border-cyber-800/40 flex justify-between">
                        <span>REPORTER: {item.reporter}</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Lower actions toolbar */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/40 gap-3">
                      {/* Status select dropdown */}
                      <div className="flex items-center gap-2">
                        <span className="font-orbitron text-[9px] text-zinc-500 font-bold uppercase">Status:</span>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                          className="bg-[#03030d] border border-zinc-800 rounded px-2 py-1 font-mono text-[10px] text-zinc-200 focus:outline-none focus:border-cyber-blue"
                        >
                          {statuses.filter(s => s !== 'ALL').map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Deletion control */}
                      {canDelete && (
                        <div className="relative">
                          {confirmDeleteId === item._id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item._id)}
                                className="font-mono text-[9px] font-bold text-cyber-pink hover:underline uppercase px-2 py-1 bg-cyber-pink-dim/20 border border-cyber-pink/30 rounded"
                              >
                                Confirm Clear
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="font-mono text-[9px] text-zinc-400 hover:underline uppercase px-2 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(item._id)}
                              className="text-zinc-500 hover:text-cyber-pink transition duration-300 p-1.5 rounded hover:bg-zinc-900/50"
                              title="Delete Incident"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Emergencies;
