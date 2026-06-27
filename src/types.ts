export interface Scenario {
  id: string;
  simId: string;
  name: string;
  riskLevel: 'MODERATE' | 'CRITICAL' | 'LOW';
  status: 'Pass' | 'Fail' | 'Running';
  latency: string;
  type: 'rain' | 'fog' | 'sun' | 'night' | 'construction';
}

export interface QueueItem {
  id: string;
  agentName: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  confidence: number;
  reasoning: string;
  scenarioName: string;
  cameraLabel: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface LogLine {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DATA' | 'WARN' | 'ERROR';
  message: string;
}

export interface TelemetryData {
  gpuTemp: number;
  vramLoad: number;
  fanSpeed: number;
  throughput: number;
  visibility: number;
  traction: number;
  latency: number;
  riskProfile: 'LOW' | 'MODERATE' | 'HIGH';
}
