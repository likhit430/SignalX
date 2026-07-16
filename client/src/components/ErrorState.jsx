import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import GlowButton from './GlowButton';

export const ErrorState = ({ title, message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-cyber-pink/20 bg-cyber-pink-dim/5 rounded-2xl max-w-lg mx-auto text-center space-y-4 shadow-xl">
      <div className="w-12 h-12 rounded-full border border-cyber-pink/30 bg-cyber-pink-dim/15 flex items-center justify-center text-cyber-pink animate-pulse">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-orbitron font-black text-sm tracking-wider text-cyber-pink uppercase">
          {title || 'SYSTEM CRITICAL ERROR'}
        </h3>
        <p className="font-mono text-xs text-zinc-400 mt-2 leading-relaxed">
          {message || 'An unexpected database or node connection error occurred.'}
        </p>
      </div>
      {onRetry && (
        <GlowButton variant="pink" onClick={onRetry} className="flex items-center gap-2 text-[10px] py-2 px-4 uppercase font-bold tracking-wider mt-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Re-establish Connection
        </GlowButton>
      )}
    </div>
  );
};

export default ErrorState;
