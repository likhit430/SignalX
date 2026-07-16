import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, AlertTriangle, ShieldAlert, Check, FileText } from 'lucide-react';
import { emergencyService } from '../services/emergencyService';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const NewEmergency = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [locationField, setLocationField] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [suggestedAction, setSuggestedAction] = useState('');
  const [requiredResources, setRequiredResources] = useState([]);
  const [broadcastRadius, setBroadcastRadius] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['Medical', 'Fire', 'Food', 'Water', 'Shelter', 'Missing Person', 'Security', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Check if we came from AI Operator with pre-filled state
  useEffect(() => {
    if (location.state && location.state.aiClassified) {
      const { title, description, category, priority, location: loc, aiSummary, suggestedAction, requiredResources, broadcastRadius } = location.state.aiClassified;
      if (title) setTitle(title);
      if (description) setDescription(description);
      if (category) setCategory(category);
      if (priority) setPriority(priority);
      if (loc) setLocationField(loc);
      if (aiSummary) setAiSummary(aiSummary);
      if (suggestedAction) setSuggestedAction(suggestedAction);
      if (requiredResources) setRequiredResources(requiredResources);
      if (broadcastRadius) setBroadcastRadius(broadcastRadius);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !category || !priority || !locationField) {
      setError('ALL METADATA SCHEMAS REQUIRED');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await emergencyService.createEmergency({
        title,
        description,
        category,
        priority,
        location: locationField,
        aiSummary,
        suggestedAction,
        requiredResources,
        broadcastRadius
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/emergencies');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'EMERGENCY DISPATCH SUBMISSION FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
      <CyberBackground variant="purple" />

      {/* Main Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl p-8 rounded-2xl border border-cyber-purple/30 bg-[#080816]/70 backdrop-blur-md shadow-[0_0_50px_rgba(189,0,255,0.15)] relative overflow-hidden"
      >
        {/* Scan line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-cyber-purple/50 animate-scanline-move pointer-events-none" />

        {/* Tech Corners */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-purple" />
        <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-purple" />
        <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-purple" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-purple" />

        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <div className="w-12 h-12 rounded-lg border border-cyber-purple/20 bg-cyber-purple-dim/10 flex items-center justify-center">
            <Radio className="w-6 h-6 text-cyber-purple animate-pulse" />
          </div>
          <h2 className="font-orbitron font-black text-xl tracking-widest text-zinc-100 uppercase">
            REPORT ACTIVE EMERGENCY
          </h2>
          <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            LOG INCIDENT TO DECENTRALIZED MESH GRID
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-3.5 mb-5 rounded-lg border border-cyber-pink/30 bg-cyber-pink-dim/10 text-cyber-pink font-mono text-xs"
          >
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 p-3.5 mb-5 rounded-lg border border-cyber-green/30 bg-cyber-green-dim/10 text-cyber-green font-mono text-xs"
          >
            <Check className="w-5 h-5 shrink-0" />
            <span>EMERGENCY ROUTED SUCCESSFULLY. REDIRECTING...</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
                INCIDENT TITLE
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gas Leak in Sector 4"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-4 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_10px_rgba(189,0,255,0.15)] transition-all duration-300"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
                GRID LOCATION (COORDINATES / SECTOR)
              </label>
              <input
                type="text"
                value={locationField}
                onChange={(e) => setLocationField(e.target.value)}
                placeholder="e.g. Sector 12 - Evac Zone B"
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-4 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_10px_rgba(189,0,255,0.15)] transition-all duration-300"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
                CRISIS CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_10px_rgba(189,0,255,0.15)] transition-all duration-300"
                required
              >
                <option value="" disabled className="text-zinc-600">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#05050f] text-white">{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
                PRIORITY STATUS
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-white focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_10px_rgba(189,0,255,0.15)] transition-all duration-300"
                required
              >
                <option value="" disabled className="text-zinc-600">Select Priority</option>
                {priorities.map((prio) => (
                  <option key={prio} value={prio} className="bg-[#05050f] text-white">{prio}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-orbitron font-bold text-[10px] text-zinc-400 tracking-wider uppercase">
              DETAILED TELEMETRY (DESCRIPTION)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the crisis incident details, victims, active dangers..."
              rows={4}
              className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-4 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_10px_rgba(189,0,255,0.15)] transition-all duration-300 resize-none"
              required
            />
          </div>

          {/* AI Metadata fields if available */}
          {(aiSummary || suggestedAction || (requiredResources && requiredResources.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border border-cyber-purple/20 bg-cyber-purple-dim/5 space-y-3 font-mono text-[10px] text-zinc-300"
            >
              <div className="flex items-center gap-1.5 text-cyber-purple border-b border-cyber-purple/20 pb-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-orbitron font-bold tracking-wider">AI DIAGNOSTIC REPORT ATTACHED</span>
              </div>
              {aiSummary && (
                <div>
                  <span className="text-zinc-500 uppercase block font-semibold">AI SUMMARY:</span>
                  <p className="text-xs text-zinc-300 mt-0.5">{aiSummary}</p>
                </div>
              )}
              {suggestedAction && (
                <div>
                  <span className="text-zinc-500 uppercase block font-semibold">SUGGESTED ACTION:</span>
                  <p className="text-xs text-zinc-300 mt-0.5">{suggestedAction}</p>
                </div>
              )}
              {requiredResources && requiredResources.length > 0 && (
                <div>
                  <span className="text-zinc-500 uppercase block font-semibold">REQUIRED RESOURCES:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {requiredResources.map((res, idx) => (
                      <span key={idx} className="bg-cyber-purple-dim text-cyber-purple border border-cyber-purple/20 px-2 py-0.5 rounded text-[9px]">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <GlowButton
            variant="purple"
            type="submit"
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? 'COMPILING DISPATCH MATRIX...' : 'BROADCAST EMERGENCY ROUTE'}
          </GlowButton>
        </form>
      </motion.div>
    </div>
  );
};

export default NewEmergency;
