import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Cpu, Radio, CheckCircle, ShieldAlert } from 'lucide-react';

export const Notifications = ({ isOpen, onClose, notifications, onClearAll, onDismiss }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div 
            onClick={onClose} 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-80 sm:w-96 z-50 bg-[#080816]/95 border-l border-cyber-blue/30 backdrop-blur-md p-6 flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyber-blue animate-pulse" />
                <h3 className="font-orbitron font-bold text-sm tracking-widest text-cyber-blue">
                  SYSTEM ALERTS
                </h3>
              </div>
              <button 
                onClick={onClose} 
                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            {notifications.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono text-zinc-500">
                  ACTIVE QUEUE: {notifications.length}
                </span>
                <button
                  onClick={onClearAll}
                  className="text-[10px] font-mono text-cyber-pink hover:underline uppercase"
                >
                  Clear Terminal
                </button>
              </div>
            )}

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <AnimatePresence initial={false}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-zinc-500 font-mono text-xs">
                    <CheckCircle className="w-8 h-8 text-zinc-700 mb-2" />
                    <span>SYSTEM ONLINE // NO ALERTS</span>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const getIcon = (type) => {
                      switch (type) {
                        case 'critical':
                          return <ShieldAlert className="w-5 h-5 text-cyber-pink flex-shrink-0" />;
                        case 'warning':
                          return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
                        case 'system':
                        default:
                          return <Cpu className="w-5 h-5 text-cyber-blue flex-shrink-0" />;
                      }
                    };

                    const getBorderColor = (type) => {
                      switch (type) {
                        case 'critical': return 'border-cyber-pink/30 hover:border-cyber-pink bg-cyber-pink-dim';
                        case 'warning': return 'border-yellow-500/30 hover:border-yellow-500 bg-yellow-500/5';
                        case 'system':
                        default: return 'border-cyber-blue/30 hover:border-cyber-blue bg-cyber-blue-dim';
                      }
                    };

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, x: 50 }}
                        transition={{ duration: 0.2 }}
                        className={`p-3 rounded border flex gap-3 transition-colors ${getBorderColor(notif.type)}`}
                      >
                        {getIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-orbitron text-xs font-bold text-zinc-200">
                              {notif.title}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-normal">
                            {notif.message}
                          </p>
                        </div>
                        <button
                          onClick={() => onDismiss(notif.id)}
                          className="text-zinc-500 hover:text-zinc-300 p-0.5 self-start"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer Panel */}
            <div className="border-t border-zinc-800 pt-4 mt-4 text-center">
              <span className="text-[9px] font-mono text-zinc-600 tracking-wider">
                SECURE ACCESS PORT // USER AUTHENTICATED
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Notifications;
