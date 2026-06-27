import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, User, AlertCircle, KeyRound } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate network authentication timing
    setTimeout(() => {
      if (username === 'admin' && password === 'cot123') {
        localStorage.setItem('drivesync_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid telemetry access credentials.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* Visual background noise/lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.1)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-panel rounded-2xl p-8 border-2 border-primary-container/20 shadow-2xl bg-surface-dim/80 backdrop-blur-xl relative">
          
          {/* Top aesthetic sync indicator */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-container border border-outline-variant/50 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span className="font-mono text-[8px] text-on-surface-variant font-bold tracking-widest uppercase">SECURE NETWORK SYNC</span>
          </div>

          {/* Title block */}
          <div className="text-center mb-8 mt-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 text-primary mb-3">
              <ShieldCheck size={26} className="stroke-[2]" />
            </div>
            <h2 className="font-display font-bold text-2xl tracking-tighter text-primary-fixed-dim">
              DriveSync
            </h2>
            <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mt-1">
              Autonomous Vehicle Fleet Analytics Command Center
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username field */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-on-surface-variant uppercase font-bold tracking-wider block">
                Command Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <User size={14} />
                </span>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant/30 focus:border-primary/80 focus:ring-1 focus:ring-primary/40 rounded-lg pl-10 pr-4 py-2.5 font-sans text-xs outline-none transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="font-mono text-[9px] text-on-surface-variant uppercase font-bold tracking-wider block">
                Security Passkey
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <Lock size={14} />
                </span>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant/30 focus:border-primary/80 focus:ring-1 focus:ring-primary/40 rounded-lg pl-10 pr-4 py-2.5 font-sans text-xs outline-none transition-all"
                />
              </div>
            </div>

            {/* Error dialog */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-error/10 border border-error/20 rounded-lg text-error flex items-start gap-2 text-[11px] leading-relaxed font-sans"
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 py-2.5 px-4 rounded-lg font-mono font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-primary/10 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <KeyRound size={14} />
                  ESTABLISH CONNECTION
                </>
              )}
            </button>
          </form>

          {/* Bottom security assurance footprint */}
          <div className="mt-6 pt-5 border-t border-outline-variant/10 flex items-center justify-between font-mono text-[8px] text-on-surface-variant select-none">
            <span className="uppercase font-semibold">CRYPTO_NODE_SYS: ENCRYPTED</span>
            <span>PORT 3000 SSL</span>
          </div>

        </div>

        {/* Demo instructions */}
        <div className="text-center mt-4">
          <p className="font-mono text-[9px] text-on-surface-variant/70 uppercase">
            Supervisor Bypass: <span className="text-primary-fixed-dim/90 font-bold">admin</span> / <span className="text-primary-fixed-dim/90 font-bold">cot123</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
