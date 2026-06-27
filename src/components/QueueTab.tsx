import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Bot, 
  Cpu, 
  Wifi, 
  ChevronRight, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause,
  Clock,
  RotateCw,
  RefreshCw,
  Server
} from 'lucide-react';
import { QueueItem, LogLine } from '../types';

interface QueueTabProps {
  queueItems: QueueItem[];
  onResolveQueueItem: (id: string, action: 'approved' | 'rejected') => void;
  logs: LogLine[];
  onGenerateReport: () => void;
}

export default function QueueTab({ queueItems, onResolveQueueItem, logs, onGenerateReport }: QueueTabProps) {
  const [isPlayingSim, setIsPlayingSim] = useState<boolean>(true);
  const [playbackProgress, setPlaybackProgress] = useState<number>(45);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log container to bottom on change
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle mock simulation visualizer progress increment
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingSim) {
      interval = setInterval(() => {
        setPlaybackProgress(p => (p >= 100 ? 0 : p + 1));
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingSim]);

  const activePendingItems = queueItems.filter(item => item.status === 'pending');

  return (
    <div className="space-y-6" id="queue-dashboard">
      
      {/* Dashboard Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-panel-gap" id="stats-grid">
        <div className="glass-panel p-5 rounded-xl flex flex-col gap-2">
          <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">AUTOMATION SAVINGS</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-primary">740</span>
            <span className="font-mono text-xs text-on-surface-variant">HRS</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col gap-2">
          <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">FLEET HEALTH</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-primary">98.2</span>
            <span className="font-mono text-xs text-on-surface-variant">%</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col gap-2">
          <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">ACTIVE SIMS</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-primary">342</span>
            <span className="font-mono text-xs text-on-surface-variant">SIMS</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl flex flex-col gap-2">
          <span className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase">VEHICLES MONITORED</span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl md:text-3xl font-bold text-primary">5,102</span>
            <span className="text-primary-fixed-dim">
              <Wifi size={16} className="animate-pulse" />
            </span>
          </div>
        </div>
      </section>

      {/* Pipeline Tracker */}
      <section className="glass-panel p-5 rounded-xl" id="pipeline-tracker-section">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-semibold text-sm md:text-base text-on-surface">Active Validation Pipeline</h2>
          <span className="font-mono text-[10px] text-secondary-fixed-dim animate-pulse font-bold flex items-center gap-1">
            <RotateCw size={10} className="animate-spin" />
            LTM SYNCING...
          </span>
        </div>
        
        {/* Horizontal Line & Nodes */}
        <div className="relative flex items-center justify-between px-6 md:px-12 py-3">
          <div className="absolute h-0.5 w-[calc(100%-48px)] bg-outline-variant left-6 md:left-12"></div>
          <div className="absolute h-0.5 w-[66%] bg-primary left-6 md:left-12"></div>
          
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_#94da32] border border-background"></div>
            <span className="font-mono text-[8px] md:text-[9px] text-primary font-bold">INGESTION</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_#94da32] border border-background"></div>
            <span className="font-mono text-[8px] md:text-[9px] text-primary font-bold">SYNC</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-secondary-fixed-dim pulse-node-cyan border border-background"></div>
            <span className="font-mono text-[8px] md:text-[9px] text-secondary-fixed-dim font-bold">DETECTION</span>
          </div>
          
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-outline-variant border border-background"></div>
            <span className="font-mono text-[8px] md:text-[9px] text-on-surface-variant">VALIDATION</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-panel-gap">
        
        {/* Human-in-the-Loop Queue (Left) */}
        <div className="lg:col-span-8 flex flex-col gap-panel-gap" id="hitl-queue-column">
          <div className="flex items-center gap-3 px-1.5 py-1">
            <span className="text-primary">
              <Clock size={18} />
            </span>
            <h3 className="font-display font-bold text-base md:text-lg">Human-in-the-Loop Queue</h3>
            <span className="bg-primary/20 text-primary-fixed-dim px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
              {activePendingItems.length} Pending
            </span>
          </div>

          {/* Urgent / High Cards List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {activePendingItems.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className={`glass-panel p-5 rounded-xl border-2 transition-all duration-300 relative ${
                    item.priority === 'URGENT' 
                      ? 'border-error/30 hover:border-error/60' 
                      : 'border-secondary/30 hover:border-secondary/60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-5">
                    
                    {/* Left explanation part */}
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase ${
                          item.priority === 'URGENT'
                            ? 'bg-error text-on-error'
                            : 'bg-secondary-container text-on-secondary-container'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="font-mono text-xs text-primary font-bold">{item.agentName}</span>
                        {item.confidence && (
                          <span className="font-mono text-[9px] text-secondary-fixed-dim ml-auto md:ml-2">
                            CONFIDENCE {item.confidence}%
                          </span>
                        )}
                      </div>

                      <div className="glass-panel bg-surface-container-low/60 p-4 rounded-lg font-mono text-xs border-l-2 border-primary space-y-2">
                        <p className="text-on-surface">
                          <span className="text-primary-fixed-dim font-bold">AI Reasoning:</span> {item.reasoning}
                        </p>
                        <p className="text-on-surface-variant">
                          <span className="text-outline font-bold">Scenario:</span> {item.scenarioName}
                        </p>
                      </div>
                    </div>

                    {/* Visual stream preview part */}
                    <div className="w-full md:w-60 h-36 rounded-lg overflow-hidden bg-surface-container-highest relative group border border-outline-variant/20 self-center">
                      <img 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                        src={item.imageUrl} 
                        alt={item.cameraLabel}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 font-mono text-[9px] font-bold text-primary-fixed-dim uppercase tracking-wider">
                        {item.cameraLabel}
                      </div>
                    </div>

                  </div>

                  {/* Approve / Reject deployment buttons */}
                  <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/10">
                    <button 
                      onClick={() => onResolveQueueItem(item.id, 'rejected')}
                      className="px-4 py-1.5 rounded-md border border-outline-variant text-on-surface hover:bg-surface-bright transition-colors font-mono text-xs font-bold active:scale-95 cursor-pointer"
                    >
                      REJECT & REVISE
                    </button>
                    <button 
                      onClick={() => onResolveQueueItem(item.id, 'approved')}
                      className="px-4 py-1.5 rounded-md bg-primary text-on-primary font-mono text-xs font-bold hover:shadow-[0_0_15px_rgba(148,218,50,0.4)] transition-all active:scale-95 cursor-pointer"
                    >
                      APPROVE & DEPLOY
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {activePendingItems.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-8 text-center rounded-xl font-mono text-xs text-primary-fixed-dim border border-dashed border-primary/30"
              >
                <CheckCircle2 className="mx-auto text-primary mb-2" size={24} />
                All human-in-the-loop pending validations cleared. Fleet operates autonomously!
              </motion.div>
            )}
          </div>

          {/* Pipeline Logs Panel */}
          <div className="glass-panel p-4 rounded-xl border border-outline-variant/20 mt-2" id="logs-panel">
            <div className="flex items-center justify-between mb-3 border-b border-outline-variant/20 pb-2">
              <span className="font-mono text-[10px] text-on-surface-variant font-bold tracking-widest uppercase">PIPELINE LOGS</span>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></span>
              </div>
            </div>
            
            <div 
              ref={logContainerRef}
              className="log-stream font-mono text-[11px] h-32 overflow-y-auto space-y-1 text-outline custom-scrollbar leading-relaxed scroll-smooth bg-black/20 p-2 rounded"
            >
              {logs.map((log) => (
                <div key={log.id} className="hover:bg-white/5 px-1 py-0.5 rounded transition-colors flex items-start gap-2">
                  <span className="text-on-surface-variant text-[10px] shrink-0">{log.timestamp}</span>
                  <span className={`font-bold uppercase text-[9px] shrink-0 w-12 text-center rounded px-1 ${
                    log.level === 'INFO' ? 'bg-primary/10 text-primary' : 
                    log.level === 'DATA' ? 'bg-secondary-fixed-dim/10 text-secondary-fixed-dim' : 
                    log.level === 'WARN' ? 'bg-tertiary-fixed-dim/10 text-tertiary' : 
                    'bg-error-container/20 text-error'
                  }`}>
                    [{log.level}]
                  </span>
                  <span className="text-on-surface text-left select-text">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panels (Right) */}
        <div className="lg:col-span-4 flex flex-col gap-panel-gap" id="side-column">
          
          {/* AI Copilot Recommendation */}
          <div className="glass-panel p-5 rounded-xl border-l-4 border-primary bg-primary/5 flex flex-col justify-between" id="copilot-insight-card">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-primary mt-1">
                <Bot size={24} className="animate-bounce" />
              </span>
              <div>
                <h4 className="font-display font-semibold text-sm md:text-base text-on-surface">AI Copilot</h4>
                <span className="font-mono text-[9px] text-primary font-bold tracking-widest uppercase">CORE ACTIVATED</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30">
                <p className="font-sans text-xs text-on-surface mb-2">32 new edge cases identified, focusing on <span className="text-primary font-bold">emergency vehicles</span>.</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-outline-variant rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[72%]"></div>
                  </div>
                  <span className="font-mono text-[9px] text-outline font-bold">72% RELEVANCE</span>
                </div>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed italic border-l border-outline-variant/30 pl-2.5">
                "I recommend prioritizing the validation of the new ambulance siren sound profile across the California fleet to reduce false-positive braking events by 12%."
              </p>
              <button 
                onClick={onGenerateReport}
                className="w-full py-2 bg-surface-bright/50 hover:bg-primary hover:text-on-primary text-primary font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer border border-outline-variant/20 uppercase tracking-wider"
              >
                Generate Detailed Report
              </button>
            </div>
          </div>

          {/* Live Simulator Visualizer Playback */}
          <div className="glass-panel p-5 rounded-xl flex flex-col relative overflow-hidden group h-[280px]" id="visualizer-playback-card">
            {/* Visual simulation running dots canvas mockup */}
            <div className="absolute inset-0 z-0 bg-surface-container-lowest/90 overflow-hidden flex flex-col justify-center items-center">
              {isPlayingSim ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Grid lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f241a_1px,transparent_1px),linear-gradient(to_bottom,#1f241a_1px,transparent_1px)] bg-[size:14px_24px] opacity-25"></div>
                  
                  {/* Wave effect radar scans */}
                  <span className="absolute w-44 h-44 rounded-full border border-primary/20 animate-ping opacity-45"></span>
                  <span className="absolute w-24 h-24 rounded-full border border-secondary-fixed-dim/30 animate-pulse"></span>
                  
                  {/* Dots representing node telemetry in visualizer */}
                  <div className="absolute top-1/4 left-1/3 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim shadow-lg shadow-secondary-fixed-dim animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/2 w-2 h-2 rounded-full bg-error shadow-lg shadow-error"></div>
                  
                  {/* Radar rotating sweep sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent animate-spin origin-center duration-[5000ms]"></div>
                </div>
              ) : (
                <div className="text-on-surface-variant font-mono text-[10px] uppercase">Simulation Paused</div>
              )}
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between pointer-events-none">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase font-bold">SIM_PLAYBACK_V4</span>
                <button 
                  onClick={() => setIsPlayingSim(!isPlayingSim)}
                  className="pointer-events-auto bg-primary-container/20 hover:bg-primary-container/40 text-primary-fixed-dim px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  {isPlayingSim ? <Pause size={9} /> : <Play size={9} />}
                  {isPlayingSim ? 'LIVE' : 'PAUSED'}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-outline">LAT: 37.7749</span>
                  <span className="text-outline">LNG: -122.4194</span>
                </div>
                <div className="h-1 bg-outline-variant/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-secondary-fixed-dim" 
                    animate={{ width: `${playbackProgress}%` }}
                    transition={{ ease: 'linear' }}
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Fleet list */}
          <div className="glass-panel p-4 rounded-xl overflow-hidden" id="active-fleets-card">
            <h4 className="font-mono text-[10px] font-bold text-on-surface-variant tracking-widest uppercase mb-3">Active Fleet Analytics</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded hover:bg-surface-bright/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-mono text-[11px]">Fleet_Delta_7</span>
                </div>
                <span className="font-mono text-[9px] text-outline group-hover:text-primary font-bold">RUNNING</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-surface-bright/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-mono text-[11px]">Fleet_Epsilon_1</span>
                </div>
                <span className="font-mono text-[9px] text-outline group-hover:text-primary font-bold">RUNNING</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-surface-bright/10 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim pulse-node-cyan"></span>
                  <span className="font-mono text-[11px] text-secondary-fixed-dim">Sim_Edge_99</span>
                </div>
                <span className="font-mono text-[9px] text-secondary-fixed-dim font-bold">COMPUTING</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
