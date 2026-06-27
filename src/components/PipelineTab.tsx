import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Eye, 
  Disc, 
  Gauge, 
  AlertTriangle, 
  Brain, 
  CheckCircle2, 
  RotateCw, 
  Play, 
  FileCheck, 
  FolderOpen, 
  Camera, 
  Radio, 
  CloudOff, 
  Rocket,
  Check,
  X,
  Server
} from 'lucide-react';
import { TelemetryData } from '../types';

interface PipelineTabProps {
  telemetry: TelemetryData;
  onDeploy: (approved: boolean) => void;
}

export default function PipelineTab({ telemetry, onDeploy }: PipelineTabProps) {
  // Fluctuating compute states to look incredibly alive
  const [gpuTemp, setGpuTemp] = useState<number>(telemetry.gpuTemp);
  const [vramLoad, setVramLoad] = useState<number>(telemetry.vramLoad);
  const [fanSpeed, setFanSpeed] = useState<number>(telemetry.fanSpeed);
  const [throughput, setThroughput] = useState<number>(telemetry.throughput);
  
  // Interactive simulations
  const [isRenderPlaying, setIsRenderPlaying] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  
  // Deployment Modal status
  const [deploymentStep, setDeploymentStep] = useState<number | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<'deploying' | 'success' | 'failed' | null>(null);

  // Fluctuating values
  useEffect(() => {
    const interval = setInterval(() => {
      setGpuTemp(prev => Math.max(58, Math.min(68, Number((prev + (Math.random() * 2 - 1)).toFixed(1)))));
      setVramLoad(prev => Math.max(11.8, Math.min(13.2, Number((prev + (Math.random() * 0.4 - 0.2)).toFixed(2)))));
      setFanSpeed(prev => Math.max(3180, Math.min(3300, Math.floor(prev + (Math.random() * 40 - 20)))));
      setThroughput(prev => Math.max(1.1, Math.min(1.3, Number((prev + (Math.random() * 0.04 - 0.02)).toFixed(2)))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle render animation simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRenderPlaying) {
      interval = setInterval(() => {
        setRenderProgress(p => {
          if (p >= 100) {
            setIsRenderPlaying(false);
            return 0;
          }
          return p + 2;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRenderPlaying]);

  const handleStartDeploy = (approved: boolean) => {
    if (!approved) {
      onDeploy(false);
      return;
    }
    // Approved deployment animation steps
    setDeploymentStatus('deploying');
    setDeploymentStep(0);
    
    setTimeout(() => setDeploymentStep(1), 1000);
    setTimeout(() => setDeploymentStep(2), 2200);
    setTimeout(() => setDeploymentStep(3), 3500);
    setTimeout(() => {
      setDeploymentStep(4);
      setDeploymentStatus('success');
      onDeploy(true);
    }, 4800);
  };

  return (
    <div className="space-y-6" id="pipeline-dashboard">
      
      {/* Deployment Override Progress Overlay Modal */}
      <AnimatePresence>
        {deploymentStatus && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel max-w-md w-full p-6 rounded-xl border border-primary/30 shadow-2xl space-y-6 bg-surface-dim"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-primary flex items-center gap-2">
                    <Rocket className={deploymentStatus === 'deploying' ? 'animate-bounce' : ''} size={20} />
                    Autonomous Deployment Orchestrator
                  </h3>
                  <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Global Fleet Cluster A</p>
                </div>
                {deploymentStatus !== 'deploying' && (
                  <button 
                    onClick={() => {
                      setDeploymentStatus(null);
                      setDeploymentStep(null);
                    }}
                    className="text-on-surface-variant hover:text-error transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Steps Progress Checklist */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    deploymentStep !== null && deploymentStep >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant animate-pulse'
                  }`}>
                    {deploymentStep !== null && deploymentStep >= 1 ? '✓' : '1'}
                  </span>
                  <span className={deploymentStep !== null && deploymentStep >= 0 ? 'text-on-surface' : 'text-on-surface-variant'}>
                    Verifying safety auditor cryptographic signature
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    deploymentStep !== null && deploymentStep >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {deploymentStep !== null && deploymentStep >= 2 ? '✓' : '2'}
                  </span>
                  <span className={deploymentStep !== null && deploymentStep >= 1 ? 'text-on-surface' : 'text-on-surface-variant'}>
                    Syncing neural network weight profiles
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    deploymentStep !== null && deploymentStep >= 3 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {deploymentStep !== null && deploymentStep >= 3 ? '✓' : '3'}
                  </span>
                  <span className={deploymentStep !== null && deploymentStep >= 2 ? 'text-on-surface' : 'text-on-surface-variant'}>
                    Validating system regression check thresholds
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    deploymentStep !== null && deploymentStep >= 4 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {deploymentStep !== null && deploymentStep >= 4 ? '✓' : '4'}
                  </span>
                  <span className={deploymentStep !== null && deploymentStep >= 3 ? 'text-on-surface' : 'text-on-surface-variant'}>
                    Pushing container firmware image to edge clusters
                  </span>
                </div>
              </div>

              {/* Status footer message */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-[10px] font-mono text-outline">
                  {deploymentStatus === 'deploying' ? 'DEPLOYMENT IN PROGRESS...' : 'DEPLOYMENT SUCCESSFUL'}
                </span>
                {deploymentStatus === 'success' && (
                  <button 
                    onClick={() => {
                      setDeploymentStatus(null);
                      setDeploymentStep(null);
                    }}
                    className="bg-primary text-on-primary text-xs px-4 py-1.5 rounded font-mono font-bold hover:bg-primary-container"
                  >
                    Close & Monitor
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid: Telemetries, Timeline Stream, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-panel-gap">
        
        {/* Left Column: Telemetry & GPU */}
        <div className="md:col-span-3 flex flex-col gap-panel-gap" id="left-sidebar">
          {/* GPU Stats */}
          <section className="glass-panel p-5 rounded-xl bg-surface-dim/40" id="compute-telemetry">
            <h3 className="font-mono text-[10px] font-bold text-on-surface-variant mb-5 flex items-center gap-2 tracking-widest uppercase">
              <Cpu size={14} className="text-primary" />
              Compute Telemetry
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1.5 font-mono text-xs">
                  <span>GPU TEMP</span>
                  <span className="text-primary font-bold">{gpuTemp}°C</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary glow-green" 
                    animate={{ width: `${(gpuTemp / 100) * 100}%` }}
                    transition={{ type: 'spring' }}
                  ></motion.div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 font-mono text-xs">
                  <span>VRAM LOAD</span>
                  <span className="text-secondary-fixed-dim font-bold">{vramLoad}GB</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-secondary-fixed-dim pulse-node-cyan" 
                    animate={{ width: `${(vramLoad / 16) * 100}%` }}
                    transition={{ type: 'spring' }}
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-outline-variant/10 grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase">FAN SPEED</p>
                <p className="font-mono text-sm text-on-surface font-bold">{fanSpeed.toLocaleString()} RPM</p>
              </div>
              <div>
                <p className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase">THROUGHPUT</p>
                <p className="font-mono text-sm text-on-surface font-bold">{throughput} TB/s</p>
              </div>
            </div>
          </section>

          {/* Environmental Constraints */}
          <section className="glass-panel p-5 rounded-xl bg-surface-dim/40 flex-1" id="env-constraints">
            <h3 className="font-mono text-[10px] font-bold text-on-surface-variant mb-4 tracking-widest uppercase">Environmental Constraints</h3>
            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low/50 rounded-lg border border-outline-variant/10">
                <span className="text-on-surface-variant flex items-center gap-1.5"><Eye size={13} /> Visibility</span>
                <span className="font-mono text-xs text-primary font-bold">{telemetry.visibility}m</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low/50 rounded-lg border border-outline-variant/10">
                <span className="text-on-surface-variant flex items-center gap-1.5"><Disc size={13} /> Traction</span>
                <span className="font-mono text-xs text-primary font-bold">{telemetry.traction}u</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low/50 rounded-lg border border-outline-variant/10">
                <span className="text-on-surface-variant flex items-center gap-1.5"><Gauge size={13} /> Latency</span>
                <span className="font-mono text-xs text-secondary-fixed-dim font-bold">{telemetry.latency}ms</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low/50 rounded-lg border border-outline-variant/10">
                <span className="text-on-surface-variant flex items-center gap-1.5"><AlertTriangle size={13} /> Risk Profile</span>
                <span className="font-mono text-xs text-primary font-bold uppercase">{telemetry.riskProfile}</span>
              </div>
            </div>
          </section>
        </div>

        {/* Middle Column: AI Reasoning Stream */}
        <div className="md:col-span-6 flex flex-col gap-panel-gap" id="middle-stream">
          <section className="glass-panel rounded-xl flex-grow flex flex-col overflow-hidden border-cyan-500/20 bg-surface-dim/20" id="reasoning-stream-section">
            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-high/30">
              <h3 className="font-mono text-[10px] font-bold text-on-surface-variant flex items-center gap-1.5 tracking-widest uppercase">
                <Brain size={14} className="text-primary animate-pulse" />
                Live Reasoning Stream
              </h3>
              <span className="font-mono text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-bold">AGENT_ACTIVE</span>
            </div>

            <div className="p-5 overflow-y-auto space-y-6 relative custom-scrollbar max-h-[580px]">
              {/* Vertical Timeline Line */}
              <div className="absolute left-[33px] top-4 bottom-4 w-px bg-outline-variant/30"></div>

              {/* Log Entry 1 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-0.5 w-7 h-7 flex items-center justify-center bg-surface-container-high border border-outline-variant/30 rounded-full z-10 text-primary">
                  <CheckCircle2 size={13} />
                </div>
                <div className="flex items-center gap-3 mb-1 font-mono text-[10px]">
                  <span className="text-on-surface-variant font-bold">08:42:12.492</span>
                  <div className="h-px flex-grow bg-outline-variant/10"></div>
                  <span className="text-primary font-bold">CONFIDENCE: 0.98</span>
                </div>
                <p className="font-sans text-xs text-on-surface leading-relaxed">
                  Analyzing sensor log... <span className="text-primary font-bold">Inconsistency detected</span> in LIDAR vs Stereo-Vision parallax. Calculating variance vectors.
                </p>
                <div className="mt-2 text-primary font-mono text-xs bg-primary/5 p-2 rounded border border-primary/10 select-all">
                  &gt; Collision probability 0.92 [Threshold exceeded]
                </div>
              </div>

              {/* Log Entry 2 (Simulation visualizer toggleable) */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-0.5 w-7 h-7 flex items-center justify-center bg-surface-container-high border border-outline-variant/30 rounded-full z-10 text-secondary-fixed-dim animate-spin duration-1000">
                  <RotateCw size={13} />
                </div>
                <div className="flex items-center gap-3 mb-1 font-mono text-[10px]">
                  <span className="text-on-surface-variant font-bold">08:42:13.105</span>
                  <div className="h-px flex-grow bg-outline-variant/10"></div>
                  <span className="text-secondary-fixed-dim font-bold">SIMULATING...</span>
                </div>
                <p className="font-sans text-xs text-on-surface leading-relaxed">
                  Simulating edge case: <span className="text-secondary-fixed-dim font-bold">Fog (Visibility 20m) + High Speed (110km/h)</span>. Running Monte Carlo batch SIM-992-B.
                </p>

                {/* Simulated Rendering Camera Playback Container */}
                <div className="mt-3 rounded-lg border border-outline-variant/30 overflow-hidden relative aspect-video group bg-black">
                  <div className="absolute inset-0 bg-black/70 z-10 flex flex-col items-center justify-center transition-opacity">
                    <button 
                      onClick={() => {
                        setIsRenderPlaying(true);
                        setRenderProgress(0);
                      }}
                      className="text-white/70 hover:text-primary transition-colors flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer"
                    >
                      <Play size={32} className="animate-pulse" />
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest">
                        {isRenderPlaying ? 'Rendering Simulation...' : 'RENDER: SIM-992-B'}
                      </span>
                    </button>
                  </div>

                  {/* Render Visual overlay scanning bar */}
                  {isRenderPlaying && (
                    <motion.div 
                      className="absolute inset-y-0 w-1 bg-primary/80 shadow-[0_0_8px_#94da32] z-20"
                      style={{ left: `${renderProgress}%` }}
                    ></motion.div>
                  )}

                  {/* Live Simulation coordinates overlay */}
                  <div className="absolute bottom-3 left-3 z-20 flex gap-2 font-mono text-[8px]">
                    <span className="bg-black/80 px-1.5 py-0.5 rounded text-white">X: 12.4m</span>
                    <span className="bg-black/80 px-1.5 py-0.5 rounded text-white">V: 84km/h</span>
                  </div>
                </div>
              </div>

              {/* Log Entry 3 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-0.5 w-7 h-7 flex items-center justify-center bg-surface-container-high border border-outline-variant/30 rounded-full z-10 text-primary">
                  <FileCheck size={13} />
                </div>
                <div className="flex items-center gap-3 mb-1 font-mono text-[10px]">
                  <span className="text-on-surface-variant font-bold">08:42:14.002</span>
                  <div className="h-px flex-grow bg-outline-variant/10"></div>
                  <span className="text-primary font-bold">SUCCESS</span>
                </div>
                <p className="font-sans text-xs text-on-surface leading-relaxed">
                  Compliance check finalized. All safety protocols within 2-sigma deviation. <span className="text-primary font-bold">Ready for deployment.</span>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Evidence & Recommendation */}
        <div className="md:col-span-3 flex flex-col gap-panel-gap" id="right-sidebar">
          {/* Supporting Evidence list */}
          <section className="glass-panel p-5 rounded-xl bg-surface-dim/40" id="supporting-evidence">
            <h3 className="font-mono text-[10px] font-bold text-on-surface-variant mb-4 flex items-center gap-2 tracking-widest uppercase">
              <FolderOpen size={14} className="text-primary" />
              Supporting Evidence
            </h3>
            
            <div className="space-y-2 font-mono text-xs">
              <button 
                onClick={() => setSelectedEvidence(prev => prev === 'camera' ? null : 'camera')}
                className={`w-full group text-left p-2.5 rounded-lg border flex items-center gap-2.5 transition-all cursor-pointer ${
                  selectedEvidence === 'camera' 
                    ? 'bg-primary/15 border-primary/50 text-primary' 
                    : 'bg-surface-container-low/50 border-outline-variant/10 hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                <Camera size={14} className="text-on-surface-variant group-hover:text-primary shrink-0" />
                <span className="truncate">camera_front_wide</span>
              </button>

              <button 
                onClick={() => setSelectedEvidence(prev => prev === 'lidar' ? null : 'lidar')}
                className={`w-full group text-left p-2.5 rounded-lg border flex items-center gap-2.5 transition-all cursor-pointer ${
                  selectedEvidence === 'lidar' 
                    ? 'bg-primary/15 border-primary/50 text-primary' 
                    : 'bg-surface-container-low/50 border-outline-variant/10 hover:border-primary/40 hover:bg-primary/5'
                }`}
              >
                <Radio size={14} className="text-on-surface-variant group-hover:text-primary shrink-0 animate-pulse" />
                <span className="truncate">lidar_top_360fov</span>
              </button>

              {/* Missing offline file indicator */}
              <div className="p-2.5 rounded-lg border bg-error-container/10 border-error/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <CloudOff size={14} className="text-error shrink-0" />
                  <span className="truncate text-error">obstacle.offline</span>
                </div>
                <span className="font-mono text-[8px] text-error font-bold tracking-wider shrink-0 bg-error/15 px-1 rounded">MISSING</span>
              </div>
            </div>

            {/* Evidence Quick Inspection Drawer */}
            <AnimatePresence>
              {selectedEvidence && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg text-[10px] space-y-2 font-mono"
                >
                  <div className="text-primary-fixed-dim font-bold uppercase tracking-wider">Quick Inspector</div>
                  {selectedEvidence === 'camera' ? (
                    <div className="space-y-1">
                      <div>File size: 12.4 MB</div>
                      <div>Format: H.265 Raw</div>
                      <div>FPS: 60 Fixed</div>
                      <div className="text-on-surface-variant italic">Contains raw frontal telemetry camera log with digital lane overlays.</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div>Point Cloud count: 4.2M</div>
                      <div>Laser: 1550nm Class 1</div>
                      <div>Field of View: 360° Horizontal</div>
                      <div className="text-on-surface-variant italic">3D laser depth metrics mapped. Intersection geometry validated nominal.</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Final Recommendation overrides controls card */}
          <section className="glass-panel p-5 rounded-xl border-2 border-primary/40 bg-primary/5 flex flex-col justify-between" id="recommendation-card">
            <div className="text-center mb-5">
              <p className="font-mono text-[9px] font-bold text-on-surface-variant tracking-widest uppercase mb-1">Final Recommendation</p>
              <div className="font-display text-4xl font-extrabold text-primary mb-1 tracking-tight">PASS</div>
              <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
                <span className="text-on-surface font-semibold">95% Confidence</span>
                <span className="text-primary flex">
                  <Check size={14} className="stroke-[3]" />
                </span>
              </div>
            </div>

            <div className="space-y-2.5 mb-5 font-sans text-xs border-y border-outline-variant/10 py-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Validated Compliance</span>
                <span className="text-primary font-mono font-bold text-right">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Policy Match</span>
                <span className="text-primary font-mono font-bold text-right">v4.2.1-stable</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => handleStartDeploy(true)}
                className="w-full bg-primary hover:bg-primary-container py-2.5 rounded-lg font-mono text-xs font-bold text-on-primary hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Rocket size={14} />
                Approve & Deploy
              </button>
              <button 
                onClick={() => handleStartDeploy(false)}
                className="w-full bg-transparent border border-outline-variant/50 hover:bg-surface-bright/20 py-2.5 rounded-lg font-mono text-xs font-bold text-on-surface-variant active:scale-95 transition-all cursor-pointer"
              >
                Reject & Revise
              </button>
            </div>
          </section>
        </div>

      </div>

    </div>
  );
}
