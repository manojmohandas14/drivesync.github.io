import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Locate, 
  TrendingUp, 
  CloudRain, 
  CloudFog, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Filter, 
  Download, 
  RefreshCw, 
  Sun,
  Moon,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Scenario } from '../types';

const SCENARIO_DETAILS: Record<string, {
  riskReason: string;
  verdictReason: string;
  metrics: { name: string; value: string }[];
}> = {
  '1': {
    riskReason: "MODERATE RISK: Unprotected left turns require predicting oncoming gaps. Rain adds glare and increases braking distance (ground traction coefficient reduced to 0.7μ).",
    verdictReason: "STATUS: PASS. DriveSync safely queued at the intersection limit line, filtered out lens flare artifacts, and initiated the turn only after verifying a 4.5-second minimum gap in oncoming traffic streams.",
    metrics: [
      { name: "Ground Traction", value: "0.74 μ" },
      { name: "Gap Margin", value: "4.8s" },
      { name: "Camera Confidence", value: "98.8%" }
    ]
  },
  '2': {
    riskReason: "CRITICAL RISK: Pedestrian visibility is extremely low (<15m) due to thick fog. Path prediction of OOD (Out-of-Distribution) pedestrian behind an obstruction presents high collision potential.",
    verdictReason: "STATUS: FAIL. Heavy fog caused scattering in the NIR (Near-Infrared) band and localized camera contrast loss. Parallax estimation was delayed, resulting in a 389ms system latency. The vehicle initiated emergency braking late, breaching the 2.0m minimum safety barrier.",
    metrics: [
      { name: "Sensor Visibility", value: "14.2m" },
      { name: "System Latency", value: "389ms" },
      { name: "Braking Distance", value: "Exceeded" }
    ]
  },
  '3': {
    riskReason: "CRITICAL RISK: Blind intersection night occlusion. Target cross-traffic vehicle driving without active headlamps at 54km/h, hidden behind a double-parked delivery truck.",
    verdictReason: "STATUS: PASS. High-frequency 3D LiDAR cluster detected top-cab micro-movements of the arriving vehicle behind the obstruction. DriveSync proactively decelerated to 12km/h and yielded safely before entering the intersection box.",
    metrics: [
      { name: "Occlusion Angle", value: "84°" },
      { name: "LiDAR Reflections", value: "124 pts/s" },
      { name: "Yield Distance", value: "3.2m" }
    ]
  },
  '4': {
    riskReason: "LOW RISK: Standard highway merge into light traffic under sunny daytime conditions. High visibility and clear, dry lane markers.",
    verdictReason: "STATUS: PASS. DriveSync smoothly accelerated on the slip road to match target lane velocity (92km/h), calculated a precise merging trajectory, and merged with zero lateral acceleration discomfort spikes.",
    metrics: [
      { name: "Merge Window", value: "120m" },
      { name: "Lateral Accel", value: "0.14g" },
      { name: "Target Speed", value: "92 km/h" }
    ]
  },
  '5': {
    riskReason: "MODERATE RISK: Non-standard construction cones forcing a narrow 2.8m single-lane detour. Heavy static construction equipment blocking active path view.",
    verdictReason: "STATUS: FAIL. The perception model failed to classify a stationary steamroller's wide shovel, mislabeling it as a road divider. The path planner did not initiate early steering correction, resulting in a hard deceleration override (>4.8m/s²) and manual supervisor takeover.",
    metrics: [
      { name: "Detour Width", value: "2.8m" },
      { name: "Deceleration Rate", value: "4.8m/s²" },
      { name: "Planner Confidence", value: "42.0%" }
    ]
  }
};

interface FleetTabProps {
  scenarios: Scenario[];
  onReSimulate: (id: string) => void;
}

export default function FleetTab({ scenarios, onReSimulate }: FleetTabProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [isRoiFocused, setIsRoiFocused] = useState<boolean>(false);
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [openMenuScenarioId, setOpenMenuScenarioId] = useState<string | null>(null);
  const [confirmSimScenarioId, setConfirmSimScenarioId] = useState<string | null>(null);

  // SF nodes for map
  const initialNodes = [
    { id: 'node-1', x: 28, y: 22, type: 'critical', name: 'Fisherman Wharf Fog', scenarioId: 'SIM-99104' },
    { id: 'node-2', x: 35, y: 14, type: 'nominal', name: 'Golden Gate Presidio', scenarioId: 'SIM-88421' },
    { id: 'node-3', x: 50, y: 21, type: 'nominal', name: 'San Francisco Financial', scenarioId: 'SIM-77402' },
    { id: 'node-4', x: 27, y: 27, type: 'nominal', name: 'Sunset Boulevard Rain', scenarioId: 'SIM-66291' },
    { id: 'node-5', x: 50, y: 28, type: 'nominal', name: 'Mission District Construction', scenarioId: 'SIM-55182' },
  ];

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 2));
    triggerToast('Zoom level increased');
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
    triggerToast('Zoom level decreased');
  };

  const handleRecenter = () => {
    setZoomLevel(1);
    setMapCenter({ x: 0, y: 0 });
    setSelectedNode(null);
    triggerToast('Map centered to default');
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const filteredScenarios = scenarios.filter(s => {
    const matchesRisk = filterRisk === 'ALL' || s.riskLevel === filterRisk;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesRisk && matchesStatus;
  });

  return (
    <div className="space-y-6" id="fleet-dashboard">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-[100] bg-primary text-on-primary px-4 py-2 rounded-lg font-mono text-xs flex items-center gap-2 neon-glow font-bold"
          >
            <CheckCircle2 size={14} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ROW 1: Map & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-panel-gap">
        
        {/* God Mode: Multi-Agent Pipeline Section */}
        <section className="lg:col-span-8 h-[500px] relative rounded-xl overflow-hidden glass-panel border border-outline-variant/30 flex flex-col justify-between" id="map-section">
          {/* Header */}
          <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright/5 z-10 shrink-0">
            <h3 className="font-display font-bold text-sm md:text-base text-on-surface select-none">
              GOD MODE: MULTI-AGENT PIPELINE
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-mono text-[9px] text-primary font-bold uppercase tracking-widest">
                Live Feed Stream
              </span>
            </div>
          </div>

          {/* God Mode Image & Trajectory Map Layer */}
          <div className="flex-grow relative flex items-center justify-center overflow-hidden bg-surface-container-lowest">
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
              <img 
                alt="God Mode Fleet Management" 
                className="w-full h-full object-cover opacity-65" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKoOstccRE8HeZ3uLhxyrWS1o5URsGl9npOpXQBasU4TjuVs8rD6HmO8pjlUgJuu1Eprp1Uu3ykQF3aXunNDTVbWJio0u7Q1Di6i6BnE13YBdLlvuaj74xlK_keZ3LKZEprK5o1-mxuQn-Qbb5QPqjL5Km6-2ej_w4sHIsEcJwTEOQ5P2soAhzlcOfKaHL26ww9nIkD5upl6Y0G1Qae5FYeASQ4BMEAk9KmKp6pI7nsf7Id8xSfmP-"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Foreground Vector Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="font-mono text-[9px] text-primary font-bold tracking-widest">
                      AGNT_01_TRAJECTORY
                    </span>
                  </div>
                  <div className="w-32 h-px bg-primary/30"></div>
                </div>

                <div className="text-right">
                  <p className="font-mono text-[9px] text-secondary-fixed-dim font-bold tracking-widest uppercase">
                    LIVE_PIPELINE_FLOW
                  </p>
                  <p className="font-mono text-[9px] text-on-surface-variant uppercase">
                    THROUGHPUT: 1.2 GB/S
                  </p>
                </div>
              </div>

              {/* Simulation Hub HUD alerts */}
              <div className="flex justify-center gap-12 mb-20">
                <button 
                  onClick={() => triggerToast("Anomaly node details: NIR Scattering detected")}
                  className="pointer-events-auto flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse mb-1"></div>
                  <span className="font-mono text-[8px] text-error font-bold group-hover:underline">
                    ANOMALY_DET_04
                  </span>
                </button>

                <button 
                  onClick={() => triggerToast("Telemetry synchronization check: Nominal")}
                  className="pointer-events-auto flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse mb-1"></div>
                  <span className="font-mono text-[8px] text-primary font-bold group-hover:underline">
                    NODE_SYNC_OK
                  </span>
                </button>
              </div>

            </div>

            {/* Floating Interaction layer for SF Nodes */}
            <div className="absolute inset-0 z-20 pointer-events-auto">
              {initialNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node.id);
                    triggerToast(`Active stream: ${node.name} (${node.scenarioId})`);
                  }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group focus:outline-none focus:ring-1 focus:ring-primary/40 p-2 rounded-full transition-transform ${
                    selectedNode === node.id ? 'scale-125' : 'hover:scale-110'
                  }`}
                  style={{ top: `${node.y * 3}%`, left: `${node.x * 2}%` }}
                >
                  <div className="relative">
                    {/* Ring glow */}
                    <span className={`absolute -inset-2.5 rounded-full opacity-80 ${
                      node.type === 'critical' ? 'animate-pulse bg-error/35' : 'animate-pulse bg-primary/35'
                    }`}></span>
                    {/* Inner point */}
                    <span className={`relative block w-2.5 h-2.5 rounded-full border border-background ${
                      node.type === 'critical' ? 'bg-error shadow-[0_0_8px_rgba(255,180,170,0.8)]' : 'bg-primary shadow-[0_0_8px_rgba(148,218,50,0.8)]'
                    }`}></span>
                  </div>
                  
                  {/* Hover tooltip label */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-surface-container-highest/95 border border-outline-variant/50 text-[9px] text-on-surface px-2 py-1 rounded font-mono hidden group-hover:block whitespace-nowrap z-30">
                    <div className="font-bold text-primary-fixed-dim">{node.name}</div>
                    <div className="text-on-surface-variant text-[7px]">{node.scenarioId}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Active Node Detail overlay in God Mode */}
            {selectedNode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-16 left-4 right-4 z-30 glass-panel p-3 rounded-lg bg-surface-dim/95 text-[10px] font-mono border-l-2 border-primary-fixed-dim flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                  <span>ACTIVE FEED SYNCHRONIZATION: <span className="text-primary-fixed-dim font-bold">{initialNodes.find(n => n.id === selectedNode)?.name}</span></span>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="text-on-surface-variant hover:text-error ml-2 text-xs font-bold font-sans cursor-pointer"
                >
                  ×
                </button>
              </motion.div>
            )}

            {/* Overlay HUD bottom */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end pointer-events-none select-none">
              <div className="glass-panel px-4 py-2 rounded-lg border-l-4 border-primary bg-surface-dim/90 backdrop-blur-md">
                <p className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase">Fleet Density</p>
                <p className="font-display text-lg md:text-xl font-bold text-primary-fixed-dim">
                  142 <span className="text-[10px] font-normal font-sans text-on-surface-variant">Active Nodes</span>
                </p>
              </div>
              <div className="glass-panel p-3 rounded-lg flex gap-4 md:gap-6 bg-surface-dim/90 backdrop-blur-md">
                <div className="text-center">
                  <p className="font-mono text-[9px] text-on-surface-variant">NOMINAL</p>
                  <p className="font-mono text-sm text-primary font-bold">138</p>
                </div>
                <div className="text-center border-l border-outline-variant/30 pl-4">
                  <p className="font-mono text-[9px] text-on-surface-variant">CRITICAL</p>
                  <p className="font-mono text-sm text-error font-bold">4</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ROI Chart Section */}
        <aside 
          onClick={() => setIsRoiFocused(true)}
          className={`lg:col-span-4 glass-panel rounded-xl p-5 flex flex-col border justify-between h-[500px] transition-all duration-300 relative select-none ${
            isRoiFocused 
              ? 'border-primary ring-2 ring-primary/40 shadow-[0_0_25px_rgba(148,218,50,0.25)] bg-surface-dim/80 scale-[1.01]' 
              : 'border-outline-variant/30 hover:border-outline-variant/60 cursor-pointer'
          }`}
          id="roi-section"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base md:text-lg text-on-surface">Automation ROI</h3>
                {isRoiFocused && (
                  <span className="font-mono text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-widest animate-pulse">
                    FOCUSED ANALYTICS
                  </span>
                )}
              </div>
              <p className="font-sans text-xs text-on-surface-variant">Engineering hours reclaimed</p>
            </div>
            <div className="flex items-center gap-2">
              {isRoiFocused && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRoiFocused(false);
                  }}
                  className="px-2 py-0.5 rounded bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 text-[9px] font-mono font-bold uppercase transition-all cursor-pointer"
                >
                  UNFOCUS
                </button>
              )}
              <span className="text-primary">
                <TrendingUp size={20} />
              </span>
            </div>
          </div>

          {/* Bar Chart Graphics */}
          <div className="flex-grow flex items-end gap-3 md:gap-4 h-48 my-6">
            {/* Bar 1 */}
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
              <div className="relative w-full h-[40%] bg-surface-container-high rounded-t-md overflow-hidden transition-all duration-300 group-hover:bg-primary/10">
                <div className="absolute inset-x-0 bottom-0 bg-primary/20 h-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">180h</div>
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">WK 01</span>
            </div>

            {/* Bar 2 */}
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
              <div className="relative w-full h-[55%] bg-surface-container-high rounded-t-md overflow-hidden transition-all duration-300 group-hover:bg-primary/10">
                <div className="absolute inset-x-0 bottom-0 bg-primary/20 h-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">260h</div>
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">WK 02</span>
            </div>

            {/* Bar 3 */}
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
              <div className="relative w-full h-[75%] bg-surface-container-high rounded-t-md overflow-hidden transition-all duration-300 group-hover:bg-primary/10">
                <div className="absolute inset-x-0 bottom-0 bg-primary/20 h-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">360h</div>
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant">WK 03</span>
            </div>

            {/* Current WK Bar */}
            <div className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
              <div className="relative w-full h-[95%] bg-primary rounded-t-md neon-glow overflow-hidden transition-all duration-300">
                {/* Visual light shine reflection overlay */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-12 bg-white/25 rounded-full blur-[1px]"></div>
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] text-on-primary font-bold">480h</div>
              </div>
              <span className="font-mono text-[9px] text-primary font-bold">CURR</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-on-surface-variant">Total Savings</span>
                <span className="font-mono text-lg md:text-xl font-bold text-primary flex items-baseline gap-1">
                  1,280 <span className="text-[10px] font-normal text-on-surface-variant">HRS</span>
                </span>
              </div>
            </div>

            {isRoiFocused && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-[10px] leading-relaxed font-sans text-on-surface"
              >
                <span className="font-mono text-[9px] text-primary font-bold uppercase block mb-0.5">💡 ROI ANALYTICS INSIGHT</span>
                DriveSync automated model training and cloud simulation cycles bypass physical road test safety latency, reclaiming over <strong>1,280 engineering hours</strong> this month.
              </motion.div>
            )}
          </div>
        </aside>
      </div>

      {/* ROW 2: Scenario Table */}
      <section className="glass-panel rounded-xl overflow-hidden border border-outline-variant/30" id="validation-table-panel">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright/5">
          <h3 className="font-display font-semibold text-base md:text-lg text-on-surface">Validation Scenarios</h3>
          <div className="flex items-center gap-2 relative">
            
            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`px-3 py-1.5 rounded text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                showFilterDropdown || filterRisk !== 'ALL' || filterStatus !== 'ALL'
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:border-primary'
              }`}
              id="filter-toggle"
            >
              <Filter size={12} />
              Filter {(filterRisk !== 'ALL' || filterStatus !== 'ALL') && '•'}
            </button>

            {/* Export Report */}
            <button 
              onClick={() => triggerToast('Successfully generated and downloaded PDF validation audit')}
              className="bg-primary text-on-primary hover:bg-primary-container px-3 py-1.5 rounded text-xs font-mono font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
              id="btn-export-report"
            >
              <Download size={12} />
              Export Report
            </button>

            {/* Filter Dropdown Modal */}
            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)}></div>
                <div className="absolute right-0 top-10 z-50 w-56 glass-panel p-4 rounded-lg shadow-xl bg-surface-dim border border-outline-variant/40 space-y-3">
                  <div className="text-xs font-mono font-bold text-primary-fixed-dim">Filter Settings</div>
                  
                  {/* Risk Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase">Risk Level</label>
                    <select 
                      value={filterRisk} 
                      onChange={(e) => setFilterRisk(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-xs text-on-surface font-sans focus:outline-none focus:border-primary"
                    >
                      <option value="ALL">All Risks</option>
                      <option value="CRITICAL">Critical Risk</option>
                      <option value="MODERATE">Moderate Risk</option>
                      <option value="LOW">Low Risk</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-on-surface-variant uppercase">Compliance Status</label>
                    <select 
                      value={filterStatus} 
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-xs text-on-surface font-sans focus:outline-none focus:border-primary"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  <button 
                    onClick={() => {
                      setFilterRisk('ALL');
                      setFilterStatus('ALL');
                      setShowFilterDropdown(false);
                      triggerToast('Filters reset successfully');
                    }}
                    className="w-full text-center text-[10px] font-mono text-error hover:underline pt-1 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scenarios Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase border-b border-outline-variant/20">
                <th className="px-6 py-3 font-bold">Scenario ID / Context</th>
                <th className="px-6 py-3 font-bold">Risk Level</th>
                <th className="px-6 py-3 font-bold">Status</th>
                <th className="px-6 py-3 font-bold">Latency</th>
                <th className="px-6 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-sans text-xs md:text-sm">
              {filteredScenarios.map((scenario) => {
                const isExpanded = expandedScenarioId === scenario.id;
                const details = SCENARIO_DETAILS[scenario.id];

                return (
                  <React.Fragment key={scenario.id}>
                    <tr 
                      onClick={() => setExpandedScenarioId(isExpanded ? null : scenario.id)}
                      className={`hover:bg-surface-bright/5 transition-colors cursor-pointer group ${
                        isExpanded ? 'bg-surface-container-high/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded flex items-center justify-center border ${
                            scenario.status === 'Fail' 
                              ? 'bg-error-container/10 border-error/20 text-error' 
                              : scenario.status === 'Running'
                              ? 'bg-secondary-container/10 border-secondary-fixed-dim/20 text-secondary-fixed-dim'
                              : 'bg-surface-container border-outline-variant/25 text-primary'
                          }`}>
                            {scenario.type === 'rain' && <CloudRain size={16} />}
                            {scenario.type === 'fog' && <CloudFog size={16} />}
                            {scenario.type === 'sun' && <Sun size={16} />}
                            {scenario.type === 'night' && <Moon size={16} />}
                            {scenario.type === 'construction' && <AlertTriangle size={16} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-on-surface font-semibold">{scenario.name}</p>
                              <span className="text-[9px] text-on-surface-variant bg-surface-container px-1 py-0.5 rounded font-mono uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </span>
                            </div>
                            <p className="text-[10px] text-on-surface-variant font-mono">{scenario.simId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                          scenario.riskLevel === 'CRITICAL' 
                            ? 'bg-error/10 text-error border-error/20' 
                            : scenario.riskLevel === 'MODERATE' 
                            ? 'bg-primary/10 text-primary border-primary/20' 
                            : 'bg-outline-variant/15 text-on-surface-variant border-outline-variant/30'
                        }`}>
                          {scenario.riskLevel} RISK
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {scenario.status === 'Pass' && (
                          <div className="flex items-center gap-1.5 text-primary">
                            <CheckCircle2 size={13} />
                            <span className="font-mono text-xs font-bold">Pass</span>
                          </div>
                        )}
                        {scenario.status === 'Fail' && (
                          <div className="flex items-center gap-1.5 text-error">
                            <XCircle size={13} />
                            <span className="font-mono text-xs font-bold">Fail</span>
                          </div>
                        )}
                        {scenario.status === 'Running' && (
                          <div className="flex items-center gap-1.5 text-secondary-fixed-dim">
                            <RefreshCw size={13} className="animate-spin" />
                            <span className="font-mono text-xs font-bold">Running</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                        {scenario.latency}
                      </td>
                      <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => setOpenMenuScenarioId(openMenuScenarioId === scenario.id ? null : scenario.id)}
                          className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1.5 rounded-full hover:bg-surface-container-high inline-flex items-center justify-center"
                          title="Actions"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {openMenuScenarioId === scenario.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setOpenMenuScenarioId(null)}></div>
                            <div className="absolute right-0 mt-1 z-40 w-48 glass-panel rounded-lg shadow-xl bg-surface-dim border border-outline-variant/40 py-1.5 text-left">
                              <button
                                onClick={() => {
                                  setOpenMenuScenarioId(null);
                                  if (scenario.status === 'Pass') {
                                    setConfirmSimScenarioId(scenario.id);
                                  } else {
                                    onReSimulate(scenario.id);
                                  }
                                }}
                                disabled={scenario.status === 'Running'}
                                className="w-full px-4 py-2 text-xs font-mono text-on-surface hover:bg-primary/10 hover:text-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <RefreshCw size={12} className={scenario.status === 'Running' ? 'animate-spin' : ''} />
                                Re-simulate Run
                              </button>
                              
                              <button
                                onClick={() => {
                                  setOpenMenuScenarioId(null);
                                  triggerToast(`Opening live streams for ${scenario.simId}`);
                                }}
                                className="w-full px-4 py-2 text-xs font-mono text-on-surface hover:bg-primary/10 hover:text-primary flex items-center gap-2 cursor-pointer"
                              >
                                <Play size={12} />
                                View Streams
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenuScenarioId(null);
                                  triggerToast(`Downloading telemetry CSV for ${scenario.simId}`);
                                }}
                                className="w-full px-4 py-2 text-xs font-mono text-on-surface hover:bg-primary/10 hover:text-primary flex items-center gap-2 cursor-pointer"
                              >
                                <Download size={12} />
                                Export Telemetry
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Detail Rows */}
                    {isExpanded && (
                      <tr className="bg-surface-container-lowest/40" onClick={(e) => e.stopPropagation()}>
                        <td colSpan={5} className="px-6 py-5 border-t border-b border-outline-variant/10">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                              
                              {/* Left Column: Why Risk Level */}
                              <div className="md:col-span-6 space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <AlertTriangle size={13} className="text-on-surface-variant" />
                                  <h4 className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Risk Assessment Analysis</h4>
                                </div>
                                <div className="p-3.5 bg-surface-container-low/60 rounded-lg border border-outline-variant/15 text-xs text-on-surface leading-relaxed font-sans">
                                  {details?.riskReason || "No custom risk diagnostic available for this simulation batch."}
                                </div>
                              </div>

                              {/* Right Column: Why Passed/Failed */}
                              <div className="md:col-span-6 space-y-2">
                                <div className="flex items-center gap-1.5">
                                  {scenario.status === 'Pass' ? (
                                    <CheckCircle2 size={13} className="text-primary" />
                                  ) : (
                                    <XCircle size={13} className="text-error" />
                                  )}
                                  <h4 className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                                    Compliance & Verdict Breakdown
                                  </h4>
                                </div>
                                <div className={`p-3.5 rounded-lg border text-xs leading-relaxed font-sans ${
                                  scenario.status === 'Pass' 
                                    ? 'bg-primary/5 border-primary/20 text-on-surface' 
                                    : 'bg-error/5 border-error/20 text-on-surface'
                                }`}>
                                  {details?.verdictReason || "Diagnostics are running. Please wait for official safety report."}
                                </div>
                              </div>

                            </div>

                            {/* Bottom Row: Telemetry Metrics */}
                            <div className="p-3 bg-surface-container-low/30 rounded-lg border border-outline-variant/10 flex flex-wrap gap-6 items-center justify-between">
                              <div className="flex gap-6 flex-wrap">
                                {details?.metrics.map((m, i) => (
                                  <div key={i}>
                                    <span className="font-mono text-[9px] text-on-surface-variant uppercase block">{m.name}</span>
                                    <span className="font-mono text-xs text-on-surface font-bold">{m.value}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-on-surface-variant uppercase">ACTIVE TELEMETRY SYNC</span>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredScenarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-on-surface-variant text-xs font-mono">
                    No validation scenarios found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confirmation Modal for Passing Re-simulation */}
      <AnimatePresence>
        {confirmSimScenarioId !== null && (() => {
          const targetScenario = scenarios.find(s => s.id === confirmSimScenarioId);
          return (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="glass-panel w-full max-w-md rounded-xl p-6 border-2 border-primary-container bg-surface-dim text-xs shadow-2xl relative text-left"
              >
                <div className="flex items-start gap-3 mb-4 text-primary">
                  <AlertTriangle size={24} className="shrink-0 text-primary animate-pulse" />
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface uppercase tracking-wider">Confirm Re-simulation</h3>
                    <p className="font-mono text-[9px] text-on-surface-variant uppercase mt-0.5">Clearing Compliance Verdict</p>
                  </div>
                </div>

                <div className="space-y-3 font-sans text-on-surface mb-6 leading-relaxed">
                  <p>
                    Are you sure you want to re-simulate the passing scenario <strong className="text-primary">{targetScenario?.name}</strong> ({targetScenario?.simId})?
                  </p>
                  <p className="text-on-surface-variant text-[11px] p-2.5 bg-surface-container-low rounded border border-outline-variant/10 font-mono">
                    ⚠️ Warning: This action will reset its current PASS compliance state and re-trigger active AI safety models in our simulated environment.
                  </p>
                </div>

                <div className="flex justify-end gap-3 font-mono">
                  <button 
                    onClick={() => setConfirmSimScenarioId(null)}
                    className="px-4 py-2 bg-surface-container hover:bg-surface-bright text-on-surface rounded transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (confirmSimScenarioId) {
                        onReSimulate(confirmSimScenarioId);
                        setConfirmSimScenarioId(null);
                        triggerToast(`Re-simulation triggered for ${targetScenario?.simId}`);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-on-primary hover:bg-primary-container rounded shadow-md transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider"
                  >
                    Confirm & Re-run
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
