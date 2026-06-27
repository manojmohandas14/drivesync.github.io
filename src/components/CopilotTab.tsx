import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Brain, 
  Activity, 
  Terminal, 
  Cpu, 
  Sparkles, 
  FileText,
  User,
  RefreshCw,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { submitCopilotQuery } from '../api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  content: string;
  timestamp: string;
  confidence?: number;
}

export default function CopilotTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'copilot',
      content: "System online. Core DriveSync AI Copilot initialized and synced with California fleet neural nodes.\n\nReady to analyze sensor logs, run predictive Monte Carlo collision regressions, and audit safety compliance.",
      timestamp: '08:40:02',
      confidence: 99.8
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const presetQuestions = [
    { text: "Analyze LIDAR vs Stereo-Vision discrepancy", key: "lidar" },
    { text: "Verify regression check in Highway Merge Rain", key: "merge" },
    { text: "Audit emergency vehicle siren noise profile", key: "siren" }
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Append user message
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const { reply, confidence } = await submitCopilotQuery(text);

      const copilotMsg: ChatMessage = {
        id: `cop-${Date.now()}`,
        sender: 'copilot',
        content: reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        confidence
      };

      setMessages(prev => [...prev, copilotMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `cop-err-${Date.now()}`,
        sender: 'copilot',
        content: "Error: Failed to obtain response from neural copilot. Please try again.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        confidence: 0
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-panel-gap h-[calc(100vh-140px)]" id="copilot-console">
      
      {/* Quick Diagnostics Stats Left Panel */}
      <section className="lg:col-span-3 glass-panel p-5 rounded-xl flex flex-col justify-between bg-surface-dim/40 h-full" id="copilot-sidebar">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-primary animate-pulse" />
            <h3 className="font-mono text-[10px] font-bold text-on-surface-variant tracking-widest uppercase">System Diagnostics</h3>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-surface-container-low/60 rounded-lg border border-outline-variant/10 space-y-2">
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>AI INFERENCE ENGINE</span>
                <span className="text-primary font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>Core Temperature</span>
                <span className="text-on-surface font-bold">48.4°C</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Throughput</span>
                <span className="text-on-surface font-bold">124 t/s</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container-low/60 rounded-lg border border-outline-variant/10 space-y-2">
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>ACTIVE POLICIES</span>
                <span className="text-secondary-fixed-dim font-bold">v4.2.1</span>
              </div>
              <div className="flex justify-between">
                <span>SF Regressions</span>
                <span className="text-on-surface font-bold">Verified</span>
              </div>
              <div className="flex justify-between">
                <span>Critical Intercepts</span>
                <span className="text-on-surface font-bold">0 Detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suggestion Prompt List */}
        <div className="space-y-3 pt-4 border-t border-outline-variant/10">
          <div className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">Quick Inquiries</div>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="w-full text-left p-2.5 rounded-lg border border-outline-variant/10 hover:border-primary/40 bg-surface-container-low/30 hover:bg-primary/5 transition-all text-[11px] font-mono flex items-center justify-between group cursor-pointer"
            >
              <span className="text-on-surface-variant group-hover:text-primary transition-colors">{q.text}</span>
              <Sparkles size={11} className="text-on-surface-variant group-hover:text-primary shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* Primary Chat Box Console Right Panel */}
      <section className="lg:col-span-9 glass-panel rounded-xl flex flex-col justify-between overflow-hidden bg-surface-dim/20 h-full border border-outline-variant/30" id="copilot-chat-panel">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-high/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-primary">
              <Brain size={18} className="animate-pulse" />
            </span>
            <div>
              <h3 className="font-display font-semibold text-xs md:text-sm text-on-surface">Interactive Safety Audit Console</h3>
              <p className="font-mono text-[9px] text-on-surface-variant tracking-wider uppercase">Deep neural validation model synced</p>
            </div>
          </div>
          <span className="font-mono text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20 font-bold uppercase tracking-widest">
            AI Copilot Active
          </span>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-grow p-5 overflow-y-auto space-y-4 custom-scrollbar bg-black/10">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Sender Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'user' 
                  ? 'bg-surface-container-high border-outline-variant/30 text-on-surface' 
                  : 'bg-primary-container/20 border-primary/20 text-primary'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Message Body Bubble */}
              <div className="space-y-1.5 max-w-[85%]">
                <div className="flex items-center gap-2 font-mono text-[9px] text-on-surface-variant">
                  <span className="font-bold">{msg.sender === 'user' ? 'EXECUTIVE USER' : 'COPILOT ASSISTANT'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.confidence && (
                    <>
                      <span>•</span>
                      <span className="text-primary font-bold uppercase tracking-wider bg-primary/10 px-1.5 rounded">
                        CONFIDENCE: {msg.confidence}%
                      </span>
                    </>
                  )}
                </div>

                <div className={`p-4 rounded-xl text-xs leading-relaxed whitespace-pre-wrap border ${
                  msg.sender === 'user'
                    ? 'bg-surface-container-high/40 border-outline-variant/30 text-on-surface font-sans'
                    : 'bg-surface-container-low/80 border-outline-variant/15 text-on-surface-variant font-mono'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-lg">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-primary-container/20 border-primary/20 text-primary animate-bounce">
                <Bot size={14} />
              </div>
              <div className="space-y-1.5">
                <div className="font-mono text-[9px] text-on-surface-variant font-bold uppercase">COPILOT COGNITION</div>
                <div className="p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/10 text-xs font-mono text-outline flex items-center gap-2">
                  <RefreshCw size={11} className="animate-spin" />
                  Generating safety diagnostics...
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef}></div>
        </div>

        {/* Message Inputs Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-dim shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2.5 items-center bg-surface-container-low border border-outline-variant/30 rounded-lg px-3.5 py-1.5 focus-within:border-primary transition-all"
          >
            <input 
              type="text" 
              placeholder="Query active AV nodes, request validation regressions, or audit simulation logs..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow bg-transparent text-xs text-on-surface focus:outline-none placeholder-outline/60 py-1.5"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`p-2 rounded-md transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                inputValue.trim() && !isTyping 
                  ? 'bg-primary text-on-primary hover:shadow-[0_0_10px_rgba(148,218,50,0.4)]' 
                  : 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
              }`}
            >
              <Send size={12} />
            </button>
          </form>
        </div>

      </section>

    </div>
  );
}
