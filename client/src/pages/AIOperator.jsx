import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, ShieldAlert, Check, HelpCircle, Activity, ArrowRight, CornerDownRight } from 'lucide-react';
import { aiService } from '../services/aiService';
import CyberBackground from '../components/CyberBackground';
import GlowButton from '../components/GlowButton';

export const AIOperator = () => {
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const presetExamples = [
    {
      title: 'Structural Fire',
      text: 'Structure fire at apartment complex on Main St, multiple people trapped on second floor, heavy smoke visible.'
    },
    {
      title: 'Medical Trauma',
      text: 'Elderly man collapsed at the local grocery store. He is unconscious and breathing slowly.'
    },
    {
      title: 'Grid Outage',
      text: 'A severe power outage occurred in Sector 9, shelter node backup generators are failing and water supplies are cut off.'
    },
    {
      title: 'Missing Child',
      text: 'Civilian reports a young child missing near the local park, last seen 2 hours ago wearing a red jacket.'
    }
  ];

  const handleAnalyze = async () => {
    if (!message.trim()) {
      setError('PLEASE SPECIFY DIAGNOSTIC LOG TEXT');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await aiService.classifyEmergency(message);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'AI ANALYSIS TUNNEL INTERRUPTED');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmergency = () => {
    if (!result) return;

    // Navigate to /emergencies/new and pre-fill form
    navigate('/emergencies/new', {
      state: {
        aiClassified: {
          title: result.summary,
          description: message,
          category: result.category,
          priority: result.priority,
          location: 'AI_DETECTOR_GRID',
          aiSummary: result.summary,
          suggestedAction: result.suggestedAction,
          requiredResources: result.requiredResources,
          broadcastRadius: result.broadcastRadius
        }
      }
    });
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] p-6 space-y-6">
      <CyberBackground variant="purple" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest leading-none">
            COGNITIVE TRIAGE GATEWAY
          </span>
          <h1 className="font-orbitron font-black text-2xl tracking-widest text-zinc-100 uppercase mt-1">
            AI OPERATOR CONSOLE
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns: Text area and Preset suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-cyber-purple">
              <Cpu className="w-5 h-5 animate-pulse" />
              <span className="font-orbitron text-xs font-bold uppercase tracking-wider">
                ANALYSIS TRANSMISSION INPUT
              </span>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-cyber-pink/30 bg-cyber-pink-dim/10 text-cyber-pink font-mono text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Description textarea */}
            <div className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter emergency telemetry data, civilian messages, or event description..."
                rows={6}
                className="w-full bg-[#05050f] border border-zinc-800 rounded-lg px-4 py-3 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyber-purple focus:shadow-[0_0_15px_rgba(189,0,255,0.15)] transition-all duration-300 resize-none"
              />
            </div>

            {/* Analyze button */}
            <GlowButton
              variant="purple"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-t border-cyber-purple rounded-full animate-spin" />
                  ANALYZING COGNITIVE FLOW...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  INITIATE AI TRIAGE
                </>
              )}
            </GlowButton>
          </div>

          {/* Preset Suggested Examples */}
          <div className="space-y-3">
            <span className="font-orbitron text-[9px] text-zinc-500 font-bold tracking-wider uppercase block">
              PRESET TELEMETRY LOGS (TEST CASES)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetExamples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setMessage(ex.text)}
                  className="p-4 rounded-xl border border-zinc-800 bg-[#070716]/20 hover:border-cyber-purple/30 text-left transition duration-300 font-mono text-xs space-y-2 focus:outline-none"
                >
                  <span className="text-cyber-purple font-semibold uppercase text-[9px] block">
                    {ex.title}
                  </span>
                  <p className="text-zinc-400 line-clamp-2 leading-relaxed text-[10px]">
                    {ex.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Triage results */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#070716]/40 backdrop-blur-md flex flex-col shadow-2xl relative overflow-hidden h-[420px]">
          {/* Overlay scanning effect */}
          <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none opacity-[0.02] bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-scanline-move" />

          <div className="flex items-center justify-between border-b border-zinc-800/40 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-purple" />
              <span className="font-orbitron text-[11px] font-bold tracking-wider text-zinc-300 uppercase">
                TRIAGE REPORT MATRIX
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center font-mono text-zinc-500 text-xs gap-3"
                >
                  <div className="w-7 h-7 rounded-full border-t border-cyber-purple animate-spin" />
                  <span>PARSING NEURAL CHANNELS...</span>
                </motion.div>
              ) : result ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 font-mono text-xs text-zinc-300"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-semibold">AI CATEGORY:</span>
                      <span className="block text-white font-bold text-sm uppercase mt-0.5">{result.category}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-semibold">PRIORITY LEVEL:</span>
                      <span className={`block font-bold text-sm uppercase mt-0.5 ${
                        result.priority === 'Critical' ? 'text-cyber-pink' : 'text-cyber-blue'
                      }`}>{result.priority}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[9px] uppercase font-semibold block">SUMMARY:</span>
                    <p className="text-zinc-300 mt-0.5 leading-normal">{result.summary}</p>
                  </div>

                  <div>
                    <span className="text-zinc-500 text-[9px] uppercase font-semibold block">SUGGESTED ACTION:</span>
                    <p className="text-zinc-300 mt-0.5 leading-normal text-[11px]">{result.suggestedAction}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-semibold">RADIUS:</span>
                      <span className="block text-white font-bold mt-0.5">{result.broadcastRadius} KM</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-[9px] uppercase font-semibold block">RESOURCES:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.requiredResources.map((res, idx) => (
                          <span key={idx} className="bg-cyber-purple-dim text-cyber-purple border border-cyber-purple/20 px-2 py-0.2 rounded text-[9px]">
                            {res}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <GlowButton
                    variant="purple"
                    onClick={handleCreateEmergency}
                    className="w-full flex items-center justify-center gap-2 mt-4"
                  >
                    PREFILL DISPATCH FORM
                    <ArrowRight className="w-4 h-4" />
                  </GlowButton>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 font-mono text-center text-xs">
                  <HelpCircle className="w-8 h-8 text-zinc-800 mb-2" />
                  <span>WAITING FOR INCOMING CRISIS TELEMETRY PING...</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOperator;
