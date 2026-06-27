import { Scenario, QueueItem, LogLine } from './types';

// In-memory mock databases for rich full-fidelity client interaction
let mockScenarios: Scenario[] = [
  { id: '1', simId: 'SIM_ID: 88421-SF', name: 'Unprotected Left Turn (Rain)', riskLevel: 'MODERATE', status: 'Pass', latency: '142ms', type: 'rain' },
  { id: '2', simId: 'SIM_ID: 99104-SF', name: 'OOD: Pedestrian in Heavy Fog', riskLevel: 'CRITICAL', status: 'Fail', latency: '389ms', type: 'fog' },
  { id: '3', simId: 'SIM_ID: 77402-SF', name: 'Night Intersection Occlusion', riskLevel: 'CRITICAL', status: 'Pass', latency: '210ms', type: 'night' },
  { id: '4', simId: 'SIM_ID: 66291-SF', name: 'Highway Slip Road Merge', riskLevel: 'LOW', status: 'Pass', latency: '98ms', type: 'sun' },
  { id: '5', simId: 'SIM_ID: 55182-SF', name: 'Construction Zone Obstruction', riskLevel: 'MODERATE', status: 'Fail', latency: '412ms', type: 'construction' },
];

let mockQueueItems: QueueItem[] = [
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
];

export async function fetchScenarios(): Promise<Scenario[]> {
  // Simulating small network latency delay
  await new Promise(resolve => setTimeout(resolve, 150));
  return [...mockScenarios];
}

export async function fetchQueueItems(): Promise<QueueItem[]> {
  await new Promise(resolve => setTimeout(resolve, 150));
  return [...mockQueueItems];
}

export async function triggerReSimulation(id: string): Promise<Scenario> {
  // Simulate heavy computation latency delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  mockScenarios = mockScenarios.map(s => {
    if (s.id === id) {
      const optimizedLatency = `${Math.floor(Math.random() * 50 + 80)}ms`;
      return { ...s, status: 'Pass', latency: optimizedLatency };
    }
    return s;
  });

  const updated = mockScenarios.find(s => s.id === id);
  if (!updated) {
    throw new Error('Scenario not found');
  }
  return updated;
}

export async function resolveQueueItem(id: string, action: 'approved' | 'rejected'): Promise<QueueItem> {
  await new Promise(resolve => setTimeout(resolve, 300));
  mockQueueItems = mockQueueItems.map(item => item.id === id ? { ...item, status: action } : item);
  
  const updated = mockQueueItems.find(i => i.id === id);
  if (!updated) {
    throw new Error('Queue item not found');
  }
  return updated;
}

export async function submitCopilotQuery(text: string): Promise<{ reply: string; confidence: number }> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  let reply = "";
  let confidence = 98.4;

  if (text.toLowerCase().includes("lidar") || text.toLowerCase().includes("discrepancy")) {
    reply = "LIDAR cluster analysis matches raw stereo parallax fields perfectly except in the 14m field of view.\n\n**Parallax Discrepancy report:**\n- **Diagnostic:** Stereo lens obstruction by raindrop smear resulted in a +12.4% parallax divergence.\n- **Mitigation:** The AI safety model successfully triggered 'Sensor Fusion Degradation Overrides', transitioning critical path tracking from camera feeds exclusively to the LIDAR top 360° LiDAR node.\n- **Verdict:** PASS. Collision risk was fully mitigated and stayed under the safety threshhold.";
    confidence = 98.2;
  } else if (text.toLowerCase().includes("merge") || text.toLowerCase().includes("rain")) {
    reply = "Auditing **Highway Merge Extreme Rain (SIM-66291)**:\n- **Traction status:** Ground traction measured at 0.9u. Friction coefficient bounds are within safe limits.\n- **Model action:** The safety vehicle model adjusted its cruise speed margin down from 110km/h to 84km/h to ensure a 4.2ms loop threshold latency was upheld.\n- **Regression verification:** Completed 2,400 simulation iterations. Zero collisions detected across 100% of runs.\n- **Recommendation:** Proceed with firmware build v4.2.1-stable release.";
    confidence = 97.9;
  } else if (text.toLowerCase().includes("siren") || text.toLowerCase().includes("emergency")) {
    reply = "Predictive report for **California Ambulance Siren Profiles**:\n- **Diagnostic:** Current audio classification logs reveal high false-positive brake triggers caused by acoustic echoes bouncing off downtown SF highway dividers.\n- **Optimization vector:** Shifting validation rules to combine acoustic classifiers with thermal-LiDAR intersection scans decreases false brakes by 12% across active fleets.\n- **Confidence indicator:** Simulation model predicts high certainty. Ready for container hotpatch.";
    confidence = 95.0;
  } else {
    reply = `I have received your custom telemetry query regarding "${text}".\n\nI am querying active node arrays and running regression audits on our San Francisco simulation batches. All compliance standards are currently NOMINAL, and there are no active sensor degradation alarms reported. Let me know if you would like me to draft a detailed safety release note for this scope.`;
    confidence = 92.5;
  }

  return { reply, confidence };
}
