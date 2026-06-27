import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Car, 
  Clock, 
  Workflow, 
  Bot, 
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  LogOut
} from 'lucide-react';
import { Scenario, QueueItem, LogLine, TelemetryData } from './types';
import FleetTab from './components/FleetTab';
import QueueTab from './components/QueueTab';
import PipelineTab from './components/PipelineTab';
import CopilotTab from './components/CopilotTab';
import LoginScreen from './components/LoginScreen';
import { fetchScenarios, fetchQueueItems, triggerReSimulation, resolveQueueItem } from './api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('drivesync_authenticated') === 'true');
  const [currentTab, setCurrentTab] = useState<'fleet' | 'queue' | 'pipeline' | 'copilot'>('fleet');
  const [showCopilotFloating, setShowCopilotFloating] = useState<boolean>(true);

  // Global scenarios list
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: '1', simId: 'SIM_ID: 88421-SF', name: 'Unprotected Left Turn (Rain)', riskLevel: 'MODERATE', status: 'Pass', latency: '142ms', type: 'rain' },
    { id: '2', simId: 'SIM_ID: 99104-SF', name: 'OOD: Pedestrian in Heavy Fog', riskLevel: 'CRITICAL', status: 'Fail', latency: '389ms', type: 'fog' },
    { id: '3', simId: 'SIM_ID: 77402-SF', name: 'Night Intersection Occlusion', riskLevel: 'CRITICAL', status: 'Pass', latency: '210ms', type: 'night' },
    { id: '4', simId: 'SIM_ID: 66291-SF', name: 'Highway Slip Road Merge', riskLevel: 'LOW', status: 'Pass', latency: '98ms', type: 'sun' },
    { id: '5', simId: 'SIM_ID: 55182-SF', name: 'Construction Zone Obstruction', riskLevel: 'MODERATE', status: 'Fail', latency: '412ms', type: 'construction' },
  ]);

  // Global human-in-the-loop pending items queue
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    {
      id: 'q-1',
      agentName: 'ValAgent_09',
      priority: 'URGENT',
      confidence: 98,
      reasoning: '"Emergency braking recommended. Obstacle detected behind van at 14.2m with high deceleration request."',
      scenarioName: 'Pedestrian emerging from behind parked van.',
      cameraLabel: 'CRITICAL_EVENT_CAM_01',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfjdtUPNWV2_yS051HBFyq0LvShniGwwc0dMuohjAmVwqQG1IrIMKtx0JcpunRmOQzjnBiIP3jq-040mh22dF-2PX4jWfkWkPOII4Dn8AbvqFuzIhbfVGvsBLzyQwpjhA67wPyi-VeiubBESCHEr9tU4gfBdl_l1aiQ4UV6FnfP8A38C08GgKIWJsgqkAKAsvcJ0vfAoDMv5JnfC3poZ3k7zxKm8cYeMGPEQKkfXMDInxoeCOxq6Jc',
      status: 'pending'
    },
    {
      id: 'q-2',
      agentName: 'ValAgent_14',
      priority: 'HIGH',
      confidence: 97.9,
      reasoning: '"Vision obstructed by precipitation. Thermal and LIDAR fusion confirms gap for merge at 44km/h."',
      scenarioName: 'Highway Merge Extreme Rain.',
      cameraLabel: 'INFRARED_FUSION_V2',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOWWgxo7Z4kj3mCQqQACwpR9u0GPQK0tgkGyUTsIMR_b9tpAA_YuqSXH4C44PP3QZ7Ba3dpxjZ2jxL9HL_yggWXWUED1rigG_8eqhXqL2ZrdDRo1O_vspj1CO8aHGAlwaVTDHe40KuhY4gz4vv5Z-BQwYJA7rqQMzQ_hqMT-IEIPJN_s7jiv6159w_fJ4067vSaLWRgaQWwUdO7YpTQjZxEHIkZSTCJAy8at7jZRWTU2LEPHzxnO4t',
      status: 'pending'
    }
  ]);

  // Telemetry configurations
  const telemetry: TelemetryData = {
    gpuTemp: 62,
    vramLoad: 12.4,
    fanSpeed: 3240,
    throughput: 1.2,
    visibility: 142,
    traction: 0.9,
    latency: 4.2,
    riskProfile: 'LOW'
  };

  // Pipeline logs state with auto appending stream
  const [logs, setLogs] = useState<LogLine[]>([
    { id: 'l1', timestamp: '09:42:10', level: 'INFO', message: 'Initializing detection layer for Zone_7B...' },
    { id: 'l2', timestamp: '09:42:12', level: 'DATA', message: 'Frame analysis: Confidence 0.992. No anomalies.' },
    { id: 'l3', timestamp: '09:42:15', level: 'INFO', message: 'Syncing metadata with global fleet model...' },
    { id: 'l4', timestamp: '09:42:18', level: 'WARN', message: 'Edge case detected: Unidentified vehicle type (Construction Loader).' },
    { id: 'l5', timestamp: '09:42:21', level: 'INFO', message: 'Redirecting to Human-in-the-loop Queue (Agent_17).' },
    { id: 'l6', timestamp: '09:42:25', level: 'DATA', message: 'Processing frame 55,201 of 120,000...' }
  ]);

  // Log stream append simulation loop
  useEffect(() => {
    const messages = [
      "Telemetry sync: Vehicle_ID_2922 at 98.9ms latency.",
      "Model optimization pass complete for Night_Driving_V4.",
      "Anomaly detected in LIDAR cluster 4. Auto-correcting.",
      "Batch validation for EdgeCase_Construction_Zone starting...",
      "Confidence score updated: 0.9997 across 1,400 simulation runs.",
      "Synchronizing telemetry logs with SafetyAuditor_01 clusters.",
      "Firmware image compile completed in 142ms."
    ];

    const levels: ('INFO' | 'DATA' | 'WARN' | 'ERROR')[] = ['INFO', 'DATA', 'WARN'];

    const interval = setInterval(() => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];

      const newLog: LogLine = {
        id: `log-${now.getTime()}`,
        timestamp,
        level: randomLevel,
        message: randomMsg
      };

      setLogs(prev => [...prev, newLog].slice(-25)); // Cap logs history size
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Fetch initial data on mount from api layer
  useEffect(() => {
    const loadData = async () => {
      try {
        const sc = await fetchScenarios();
        setScenarios(sc);
        const qi = await fetchQueueItems();
        setQueueItems(qi);
      } catch (error) {
        console.error("Failed to load initial safety telemetry from API:", error);
      }
    };
    loadData();
  }, []);

  // Re-simulate action trigger handler using api
  const handleReSimulate = async (id: string) => {
    // 1. Set state to Running
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: 'Running' } : s));

    try {
      const updatedScenario = await triggerReSimulation(id);
      setScenarios(prev => prev.map(s => s.id === id ? updatedScenario : s));
    } catch (error) {
      console.error("Re-simulation execution failed:", error);
      setScenarios(prev => prev.map(s => s.id === id ? { ...s, status: 'Fail' } : s));
    }
  };

  // Human in the Loop approval action handler using api
  const handleResolveQueueItem = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const updatedItem = await resolveQueueItem(id, action);
      setQueueItems(prev => prev.map(item => item.id === id ? updatedItem : item));

      // Append trace info logs
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
      const targetItem = queueItems.find(i => i.id === id);
      const traceLog: LogLine = {
        id: `log-${now.getTime()}`,
        timestamp,
        level: action === 'approved' ? 'INFO' : 'WARN',
        message: `Executive audit override action executed: ${action.toUpperCase()} for ${targetItem?.agentName} - ${targetItem?.scenarioName}`
      };
      setLogs(prev => [...prev, traceLog]);
    } catch (error) {
      console.error("Failed to resolve queue item via API:", error);
    }
  };

  const pendingCount = queueItems.filter(item => item.status === 'pending').length;

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between">
      
      {/* TopAppBar Navigation Header */}
      <header className="fixed top-0 w-full z-50 bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-primary-fixed-dim">
            <ShieldCheck size={28} className="stroke-[2]" />
          </span>
          <h1 className="font-display font-bold text-lg md:text-xl tracking-tighter text-primary-fixed-dim select-none">
            DriveSync
          </h1>

          {/* Active node clusters sub title info for header */}
          {currentTab === 'pipeline' && (
            <div className="hidden md:flex ml-4 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/30 items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-mono text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">SAFETYAUDITOR_01 (RUNNING)</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => setCurrentTab('fleet')}
            className={`font-mono text-xs font-bold uppercase tracking-widest py-1 border-b-2 transition-all cursor-pointer ${
              currentTab === 'fleet' ? 'border-primary text-primary-fixed-dim' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Fleet
          </button>
          <button 
            onClick={() => setCurrentTab('queue')}
            className={`font-mono text-xs font-bold uppercase tracking-widest py-1 border-b-2 transition-all cursor-pointer relative ${
              currentTab === 'queue' ? 'border-primary text-primary-fixed-dim' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Queue
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-3 w-3.5 h-3.5 bg-error text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setCurrentTab('pipeline')}
            className={`font-mono text-xs font-bold uppercase tracking-widest py-1 border-b-2 transition-all cursor-pointer ${
              currentTab === 'pipeline' ? 'border-primary text-primary-fixed-dim' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Pipeline
          </button>
          <button 
            onClick={() => setCurrentTab('copilot')}
            className={`font-mono text-xs font-bold uppercase tracking-widest py-1 border-b-2 transition-all cursor-pointer ${
              currentTab === 'copilot' ? 'border-primary text-primary-fixed-dim' : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            Copilot
          </button>
        </nav>

        {/* Executive User profile block */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            {currentTab === 'pipeline' ? (
              <>
                <span className="font-mono text-[9px] text-on-surface-variant tracking-widest uppercase font-bold">NODE CLUSTER A</span>
                <span className="font-mono text-[10px] text-primary font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span> STABLE | 4.2ms
                </span>
              </>
            ) : (
              <>
                <span className="font-mono text-[9px] text-on-surface-variant tracking-widest uppercase font-bold">SYSTEM STATUS</span>
                <span className="font-mono text-[10px] text-primary font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span> NOMINAL
                </span>
              </>
            )}
          </div>

          {/* Logout Action */}
          <button
            onClick={() => {
              localStorage.removeItem('drivesync_authenticated');
              setIsAuthenticated(false);
            }}
            className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-bright border border-outline-variant/30 text-on-surface-variant hover:text-error px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
            title="Log Out Command Center"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>

          {/* Dynamic Profile headshot frame depend on selected view context */}
          <div className="w-10 h-10 rounded-full border-2 border-primary-container overflow-hidden active:scale-95 duration-150 cursor-pointer select-none">
            <img 
              className="w-full h-full object-cover" 
              src={currentTab === 'pipeline' 
                ? "https://lh3.googleusercontent.com/aida-public/AB6AXuCtpj-Ua6KE5UAcJpYYT3pQukvj8Eah20xVhYORACWg7sTIigzd5F78ik6D4q64Fy44qYxywC2J7VQ_XbVQ3cyujmVyVLYmDrkeuYtf3C78JfQxD5WN65mEvFFm_VEEKsQQ0EjhAjXgjeZV-5eV0czn3GmqAaZ6LjRGNcIytOsUGKiZ0YDsKSgqkDzPhwvdynluhLUTHADljs59RfVBf7YjY7hCEo4NZsmFAi3JS1m4O7C88vraMnvy"
                : "https://lh3.googleusercontent.com/aida-public/AB6AXuC6pF4k07ICptd2bzFJvdptZ3AMXmQcylCwL5gMDyVf7ma4-b-MbafjoWAXBNk_Bt0AkfVFORcdHRR-Y8XEiUJ5xuS09PWAhUiezcepwx_lZed7x7Gcesx2IoWGCux4syvEHd8aXZyGwNE1vyK93kkOefj_brAIPLBMHYVYl6C5k7cHAIjcz8db586LO9ymmnN1LYsY0G-yqBllTLxJt1ARoOfuIQ-Iiiv3V2jmW8-GajkMkJ9AMeUz"
              }
              alt="Profile Headshot"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* Main App Workspace Canvas */}
      <main className="pt-24 pb-28 md:pb-12 px-4 md:px-margin-desktop max-w-[1920px] mx-auto w-full flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {currentTab === 'fleet' && (
              <FleetTab scenarios={scenarios} onReSimulate={handleReSimulate} />
            )}
            {currentTab === 'queue' && (
              <QueueTab 
                queueItems={queueItems} 
                onResolveQueueItem={handleResolveQueueItem} 
                logs={logs}
                onGenerateReport={() => setCurrentTab('copilot')}
              />
            )}
            {currentTab === 'pipeline' && (
              <PipelineTab telemetry={telemetry} onDeploy={() => {}} />
            )}
            {currentTab === 'copilot' && (
              <CopilotTab />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Copilot Floating Trigger Button (Except in dedicated Copilot Tab) */}
      {currentTab !== 'copilot' && (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3 select-none">
          <AnimatePresence>
            {showCopilotFloating && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="glass-panel w-72 rounded-xl p-4 border-2 border-primary-container shadow-2xl bg-surface-dim/95 text-xs"
              >
                <div className="flex justify-between items-start mb-2.5">
                  <span className="font-mono text-[9px] text-primary font-bold tracking-wider">COPILOT ANALYSIS</span>
                  <span className="font-mono text-[9px] bg-primary/20 px-1.5 py-0.5 rounded text-on-surface font-bold">CONFIDENCE: 98%</span>
                </div>
                <p className="font-sans text-on-surface leading-relaxed mb-3">
                  <strong>{pendingCount + 22} scenarios</strong> require human review today. Most critical: Intersection occlusion at 4th & Mission.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setCurrentTab('queue');
                      setShowCopilotFloating(false);
                    }}
                    className="flex-grow bg-primary text-on-primary text-[10px] font-mono font-bold py-2 rounded transition-colors hover:bg-primary-container cursor-pointer"
                  >
                    Review Now
                  </button>
                  <button 
                    onClick={() => setShowCopilotFloating(false)}
                    className="bg-surface-container hover:bg-surface-bright text-on-surface-variant text-[10px] font-mono py-2 px-3 rounded cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowCopilotFloating(!showCopilotFloating)}
            className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-2xl active:scale-95 hover:scale-105 transition-transform neon-glow relative cursor-pointer"
          >
            <Bot size={28} />
            <span className="absolute -top-1 -right-1 w-5.5 h-5.5 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-background">
              {pendingCount + 22}
            </span>
          </button>
        </div>
      )}

      {/* BottomNavBar (Mobile Only Layout) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface-container/90 backdrop-blur-2xl border-t border-outline-variant/20 rounded-t-xl flex justify-around items-center px-4 pb-4 pt-2.5 h-20 shrink-0 select-none">
        <button 
          onClick={() => setCurrentTab('fleet')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'fleet' ? 'bg-primary-container/25 text-primary-fixed-dim rounded-full px-4 py-1 font-bold' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Car size={18} />
          <span className="font-mono text-[9px] mt-1 font-bold">Fleet</span>
        </button>

        <button 
          onClick={() => setCurrentTab('queue')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer relative ${
            currentTab === 'queue' ? 'bg-primary-container/25 text-primary-fixed-dim rounded-full px-4 py-1 font-bold' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Clock size={18} />
          <span className="font-mono text-[9px] mt-1 font-bold">Queue</span>
          {pendingCount > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 bg-error text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-background">
              {pendingCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => setCurrentTab('pipeline')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'pipeline' ? 'bg-primary-container/25 text-primary-fixed-dim rounded-full px-4 py-1 font-bold' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Workflow size={18} />
          <span className="font-mono text-[9px] mt-1 font-bold">Pipeline</span>
        </button>

        <button 
          onClick={() => setCurrentTab('copilot')}
          className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
            currentTab === 'copilot' ? 'bg-primary-container/25 text-primary-fixed-dim rounded-full px-4 py-1 font-bold' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <Bot size={18} />
          <span className="font-mono text-[9px] mt-1 font-bold">Copilot</span>
        </button>
      </nav>

    </div>
  );
}
