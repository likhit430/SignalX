import { motion } from 'framer-motion';

export const GlowButton = ({
  children,
  onClick,
  variant = 'blue',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) => {
  const getColors = () => {
    switch (variant) {
      case 'purple':
        return {
          border: 'border-cyber-purple/50',
          hoverBorder: 'group-hover:border-cyber-purple',
          glow: 'shadow-[0_0_15px_rgba(189,0,255,0.4)]',
          hoverGlow: 'hover:shadow-[0_0_25px_rgba(189,0,255,0.8)]',
          bg: 'bg-cyber-purple-dim',
          text: 'text-cyber-purple',
          accent: 'bg-cyber-purple',
        };
      case 'green':
        return {
          border: 'border-cyber-green/50',
          hoverBorder: 'group-hover:border-cyber-green',
          glow: 'shadow-[0_0_15px_rgba(0,255,102,0.4)]',
          hoverGlow: 'hover:shadow-[0_0_25px_rgba(0,255,102,0.8)]',
          bg: 'bg-cyber-green-dim',
          text: 'text-cyber-green',
          accent: 'bg-cyber-green',
        };
      case 'pink':
        return {
          border: 'border-cyber-pink/50',
          hoverBorder: 'group-hover:border-cyber-pink',
          glow: 'shadow-[0_0_15px_rgba(255,0,85,0.4)]',
          hoverGlow: 'hover:shadow-[0_0_25px_rgba(255,0,85,0.8)]',
          bg: 'bg-cyber-pink-dim',
          text: 'text-cyber-pink',
          accent: 'bg-cyber-pink',
        };
      case 'blue':
      default:
        return {
          border: 'border-cyber-blue/50',
          hoverBorder: 'group-hover:border-cyber-blue',
          glow: 'shadow-[0_0_15px_rgba(0,240,255,0.3)]',
          hoverGlow: 'hover:shadow-[0_0_25px_rgba(0,240,255,0.7)]',
          bg: 'bg-cyber-blue-dim',
          text: 'text-cyber-blue',
          accent: 'bg-cyber-blue',
        };
    }
  };

  const colors = getColors();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden font-orbitron font-semibold tracking-wider text-sm py-2.5 px-6 rounded-md border ${colors.border} ${colors.bg} ${colors.hoverGlow} transition-all duration-300 ${colors.text} disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {/* Visual Glitch/Scan Effect Border Corners */}
      <span className={`absolute top-0 left-0 w-2 h-[2px] ${colors.accent}`} />
      <span className={`absolute top-0 left-0 w-[2px] h-2 ${colors.accent}`} />
      <span className={`absolute bottom-0 right-0 w-2 h-[2px] ${colors.accent}`} />
      <span className={`absolute bottom-0 right-0 w-[2px] h-2 ${colors.accent}`} />

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Glowing background slider */}
      <span className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${colors.accent}`} />
    </motion.button>
  );
};

export default GlowButton;
