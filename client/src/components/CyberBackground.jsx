import { motion } from 'framer-motion';

export const CyberBackground = ({ variant = 'blue' }) => {
  const isPurple = variant === 'purple';
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#020208]">
      {/* Scanline overlay */}
      <div className="scanline" />

      {/* Grid Pattern */}
      <div className={`absolute inset-0 ${isPurple ? 'cyber-grid-purple' : 'cyber-grid'}`} />

      {/* Radial Gradient Ambient Highlights */}
      <motion.div
        animate={{
          scale: [1, 1.1, 0.9, 1],
          x: [0, 40, -30, 0],
          y: [0, -50, 40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 ${
          isPurple ? 'bg-cyber-purple' : 'bg-cyber-blue'
        }`}
      />

      <motion.div
        animate={{
          scale: [1, 0.9, 1.2, 1],
          x: [0, -50, 30, 0],
          y: [0, 40, -50, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-15 ${
          isPurple ? 'bg-cyber-pink' : 'bg-cyber-purple'
        }`}
      />

      {/* CRT flicker scan effect overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(3,3,13,0.3)_100%)] mix-blend-overlay opacity-50" />
    </div>
  );
};

export default CyberBackground;
