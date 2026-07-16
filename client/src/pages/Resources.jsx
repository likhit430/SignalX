import { useState, useEffect } from 'react';
import { 
  Plus, Minus, CheckCircle, Search, Trash2, Edit2, AlertTriangle, X, Server
} from 'lucide-react';
import { resourceService } from '../services/resourceService';
import useAuth from '../hooks/useAuth';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const Resources = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [location, setLocation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [status, setStatus] = useState('Available');

  const categories = ['Food', 'Water', 'Medical', 'Shelter', 'Transport', 'Communication', 'Equipment', 'Other'];
  const statuses = ['Available', 'Limited', 'Unavailable'];

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await resourceService.getResources({
        search,
        category: categoryFilter,
        status: statusFilter
      });
      setResources(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'FAILED TO RETRIEVE RESOURCE DATABASE');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, categoryFilter, statusFilter]);

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleOpenCreate = () => {
    if (!isAdmin) {
      alert('ACCESS DENIED: ONLY ADMIN CLEARANCE PERMITTED TO CREATE RESOURCES.');
      return;
    }
    setName('');
    setDescription('');
    setCategory('Food');
    setTotalQuantity(10);
    setAvailableQuantity(10);
    setLocation('');
    setContactName('');
    setContactPhone('');
    setStatus('Available');
    setFieldErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEdit = (res) => {
    const isOwner = res.createdBy?._id === user?._id || res.createdBy === user?._id;
    if (!isAdmin && !isOwner) {
      alert('ACCESS DENIED: ONLY CREATOR OR ADMIN PERMITTED TO MODIFY THIS NODE.');
      return;
    }
    setSelectedResource(res);
    setName(res.name);
    setDescription(res.description);
    setCategory(res.category);
    setTotalQuantity(res.totalQuantity);
    setAvailableQuantity(res.availableQuantity);
    setLocation(res.location);
    setContactName(res.contactName);
    setContactPhone(res.contactPhone);
    setStatus(res.status);
    setFieldErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'Resource name is required';
    if (!location.trim()) errors.location = 'Location is required';
    if (!contactName.trim()) errors.contactName = 'Contact name is required';
    
    const qty = Number(totalQuantity);
    if (isNaN(qty) || !Number.isInteger(qty) || qty < 0) {
      errors.totalQuantity = 'Quantity must be a non-negative integer';
    }

    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    if (!contactPhone.trim()) {
      errors.contactPhone = 'Contact phone is required';
    } else if (!phoneRegex.test(contactPhone.trim())) {
      errors.contactPhone = 'Phone number is invalid (7-15 digits)';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await resourceService.createResource({
        name,
        description,
        category,
        totalQuantity,
        availableQuantity: totalQuantity, // defaults to totalQuantity
        location,
        contactName,
        contactPhone
      });
      setShowCreateModal(false);
      triggerSuccess('NEW RESOURCE NODE ROUTED SUCCESSFULLY');
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deploy resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      await resourceService.updateResource(selectedResource._id, {
        name,
        description,
        category,
        totalQuantity,
        location,
        contactName,
        contactPhone
      });
      setShowEditModal(false);
      triggerSuccess('RESOURCE METADATA UPDATE COMPLETED');
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustQuantity = async (res, action) => {
    const isOwner = res.createdBy?._id === user?._id || res.createdBy === user?._id;
    if (!isAdmin && !isOwner) {
      alert('ACCESS DENIED: NOT AUTHORIZED TO ADJUST QUANTITY ON THIS NODE.');
      return;
    }
    
    let newQty = res.availableQuantity;
    if (action === 'inc') {
      newQty = Math.min(res.totalQuantity, newQty + 1);
    } else {
      newQty = Math.max(0, newQty - 1);
    }

    try {
      await resourceService.updateAvailability(res._id, {
        availableQuantity: newQty
      });
      setResources(prev => 
        prev.map(r => r._id === res._id ? { ...r, availableQuantity: newQty, status: newQty === 0 ? 'Unavailable' : newQty <= r.totalQuantity * 0.25 ? 'Limited' : 'Available' } : r)
      );
      triggerSuccess('QUANTITY TELEMETRY IN SYNC');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to adjust quantity');
    }
  };

  const handleDelete = async (id) => {
    try {
      await resourceService.deleteResource(id);
      setConfirmDeleteId(null);
      triggerSuccess('RESOURCE REMOVED FROM MESH DATABASE');
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to terminate resource record');
    }
  };

  const getStatusColor = (st) => {
    switch (st) {
      case 'Available': return 'text-cyber-green bg-cyber-green/10 border-cyber-green/30';
      case 'Limited': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Unavailable':
      default: return 'text-cyber-pink bg-cyber-pink/10 border-cyber-pink/20';
    }
  };

  const getStatusGlow = (st) => {
    switch (st) {
      case 'Available': return 'border-cyber-green/30 shadow-[0_0_15px_rgba(0,255,102,0.1)] bg-cyber-green-dim/5';
      case 'Limited': return 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)] bg-yellow-500/5';
      case 'Unavailable':
      default: return 'border-cyber-pink/30 shadow-[0_0_15px_rgba(255,0,85,0.15)] bg-cyber-pink-dim/5';
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="blue" />

      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-xl border border-cyber-green/30 bg-zinc-950/90 text-cyber-green font-mono text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 animate-bounce" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            GRID SUPPLY LOGISTICS
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            RESOURCE REGISTRY
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className={`font-orbitron font-bold text-xs py-2 px-5 border rounded tracking-wider transition ${
            isAdmin 
              ? 'border-cyber-blue text-cyber-blue bg-cyber-blue-dim/10 hover:bg-cyber-blue hover:text-black shadow-[0_0_10px_rgba(0,240,255,0.15)]'
              : 'border-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
          disabled={!isAdmin}
          title={!isAdmin ? 'ONLY ADMIN CLEARANCE PERMITTED' : ''}
        >
          {isAdmin ? 'Deploy Resource' : 'Deploy Resource (Locked)'}
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-[#05050f]/80 backdrop-blur-md space-y-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resource name, location, details..."
            className="w-full bg-[#03030d] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 font-mono text-xs text-white focus:outline-none focus:border-cyber-blue transition duration-300"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Category filter</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
            >
              <option value="ALL">ALL CATEGORIES</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase">Availability status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#03030d] border border-zinc-800 rounded px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 focus:outline-none focus:border-cyber-blue"
            >
              <option value="ALL">ALL STATUSES</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resource content grid */}
      <div className="relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 font-mono text-zinc-500 text-xs">
            <div className="w-8 h-8 rounded-full border-t border-cyber-blue animate-spin mb-4" />
            <span>PULLING LOGISTICS STACK...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 border border-cyber-pink/30 bg-cyber-pink-dim/10 rounded-2xl text-cyber-pink font-mono text-xs">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <span>{error}</span>
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs text-center">
            <Server className="w-8 h-8 text-zinc-700 mb-2 animate-pulse" />
            <span>No resources available in the registry.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((res) => {
              const dateStr = res.createdAt ? new Date(res.createdAt).toLocaleDateString() : 'Unknown';
              const isOwner = res.createdBy?._id === user?._id || res.createdBy === user?._id;
              const canEdit = isAdmin || isOwner;

              return (
                <div
                  key={res._id}
                  className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between ${getStatusGlow(res.status)}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(res.status)}`}>
                          {res.status}
                        </span>
                        <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                          {res.category}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">{res.location}</span>
                    </div>

                    {/* Name & description */}
                    <div className="space-y-1">
                      <h3 className="font-orbitron font-extrabold text-base text-zinc-200 tracking-wide">
                        {res.name}
                      </h3>
                      <p className="font-sans text-xs text-zinc-400 leading-relaxed pt-1">
                        {res.description || 'No description logged.'}
                      </p>
                    </div>

                    {/* Quantity stats */}
                    <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                      <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400">
                        <span>AVAILABLE QUANTITY:</span>
                        <span className="font-bold text-white">{res.availableQuantity} / {res.totalQuantity}</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${res.totalQuantity > 0 ? (res.availableQuantity / res.totalQuantity) * 100 : 0}%` }}
                          className={`h-full ${
                            res.status === 'Available' ? 'bg-cyber-green' : res.status === 'Limited' ? 'bg-yellow-500' : 'bg-cyber-pink'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Contact & Date info */}
                    <div className="font-mono text-[9px] text-zinc-500 space-y-1 pt-2 border-t border-zinc-900">
                      <div className="flex justify-between">
                        <span>CONTACT: {res.contactName}</span>
                        <span>PHONE: {res.contactPhone}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>CREATED BY: {res.createdBy?.name || 'Unknown'}</span>
                        <span>DEPLOYED: {dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  {canEdit && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-900/50">
                      {/* Quantity quick adj */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustQuantity(res, 'dec')}
                          disabled={res.availableQuantity === 0}
                          className="p-1 border border-zinc-800 hover:border-cyber-blue hover:text-cyber-blue bg-[#03030d] text-zinc-400 rounded transition disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-[10px] text-zinc-400 px-2">ADJUST QTY</span>
                        <button
                          onClick={() => handleAdjustQuantity(res, 'inc')}
                          disabled={res.availableQuantity === res.totalQuantity}
                          className="p-1 border border-zinc-800 hover:border-cyber-blue hover:text-cyber-blue bg-[#03030d] text-zinc-400 rounded transition disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(res)}
                          className="p-1.5 border border-zinc-800 hover:border-cyber-purple hover:text-cyber-purple bg-[#03030d] text-zinc-400 rounded transition"
                          title="Modify Resource Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === res._id ? (
                          <div className="flex items-center gap-1 bg-[#05050f] border border-cyber-pink/20 p-0.5 rounded">
                            <button
                              onClick={() => handleDelete(res._id)}
                              className="font-mono text-[8px] font-bold text-cyber-pink hover:underline uppercase px-2 py-0.5"
                            >
                              CONFIRM
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="font-mono text-[8px] text-zinc-500 hover:underline uppercase px-2 py-0.5"
                            >
                              CANCEL
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(res._id)}
                            className="p-1.5 border border-zinc-800 hover:border-cyber-pink hover:text-cyber-pink bg-[#03030d] text-zinc-400 rounded transition"
                            title="Delete Resource Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-cyber-blue/30 bg-[#080816] relative">
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-orbitron font-bold text-base text-white uppercase mb-4 tracking-wider">DEPLOY RESOURCE NODE</h2>
            <form onSubmit={handleCreate} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Resource name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.name && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.location && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.location}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Total quantity</label>
                  <input type="number" min="0" value={totalQuantity} onChange={(e) => setTotalQuantity(parseInt(e.target.value))} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.totalQuantity && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.totalQuantity}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Contact Name</label>
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Contact Phone</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.contactPhone && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.contactPhone}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 text-[9px] uppercase">Description</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white resize-none" />
              </div>

              <GlowButton variant="blue" type="submit" disabled={submitting} className="w-full">
                {submitting ? 'BROADCASTING...' : 'BROADCAST NODE'}
              </GlowButton>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-cyber-purple/30 bg-[#080816] relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-orbitron font-bold text-base text-white uppercase mb-4 tracking-wider">MODIFY RESOURCE NODE</h2>
            <form onSubmit={handleEdit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Resource name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.name && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.name}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Location</label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.location && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.location}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Total quantity</label>
                  <input type="number" min="0" value={totalQuantity} onChange={(e) => setTotalQuantity(parseInt(e.target.value))} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.totalQuantity && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.totalQuantity}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Contact Name</label>
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-500 text-[9px] uppercase">Contact Phone</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white" />
                  {fieldErrors.contactPhone && <span className="text-[9px] text-cyber-pink font-mono mt-0.5">{fieldErrors.contactPhone}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 text-[9px] uppercase">Description</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-black border border-zinc-800 rounded px-3 py-1.5 text-white resize-none" />
              </div>

              <GlowButton variant="purple" type="submit" disabled={submitting} className="w-full">
                {submitting ? 'SAVING...' : 'SUBMIT MODIFICATIONS'}
              </GlowButton>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
