import { useState } from 'react';
import TickerTape from '@/components/TickerTape';
import AgentRoster from '@/components/AgentRoster';
import ChamberFloor from '@/components/ChamberFloor';
import HeatMap from '@/components/HeatMap';
import ControlBar from '@/components/ControlBar';
import InterventionModal from '@/components/InterventionModal';
import VotePanel from '@/components/VotePanel';
import {
  MOCK_MESSAGES,
  MOCK_SCENARIO,
  MOCK_CONSENSUS,
  MOCK_VOTES,
  type AgentRole,
  type ChamberMessage,
} from '@/lib/agents';

const Index = () => {
  const [messages, setMessages] = useState<ChamberMessage[]>(MOCK_MESSAGES);
  const [isDebating, setIsDebating] = useState(true);
  const [showIntervention, setShowIntervention] = useState(false);
  const [showVotes, setShowVotes] = useState(false);

  const handleIntervene = (role: AgentRole, directive: string) => {
    const newMsg: ChamberMessage = {
      id: `int-${Date.now()}`,
      role,
      content: `[DIRECTIVE RECEIVED] Adjusting parameters: "${directive}" — recalculating position...`,
      source: 'Analysis',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    setIsDebating(false);
  };

  const handleReset = () => {
    setMessages(MOCK_MESSAGES);
    setShowVotes(false);
    setIsDebating(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-10 bg-surface-1 border-b border-border flex items-center px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs font-bold text-gold tracking-[0.1em]">
            THE CHAMBER
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="font-mono text-[10px] text-muted-foreground tracking-[0.15em] uppercase">
            BMW Board Intelligence System
          </div>
        </div>
        <div className="flex-1" />
        <div className="font-mono text-[10px] text-muted-foreground">
          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          {' '}
          {new Date().toLocaleTimeString('en-US', { hour12: false })}
        </div>
      </div>

      {/* Ticker */}
      <TickerTape />

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Agent roster */}
        <AgentRoster />

        {/* Center: Chamber floor */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <ChamberFloor
            messages={messages}
            scenario={MOCK_SCENARIO}
            isDebating={isDebating}
          />
          <VotePanel votes={MOCK_VOTES} visible={showVotes} />
        </div>

        {/* Right: Heat map */}
        <HeatMap consensus={MOCK_CONSENSUS} />
      </div>

      {/* Control bar */}
      <ControlBar
        isDebating={isDebating}
        onIntervene={() => setShowIntervention(true)}
        onVote={() => setShowVotes(v => !v)}
        onToggleDebate={() => setIsDebating(v => !v)}
        onReset={handleReset}
      />

      {/* Intervention modal */}
      <InterventionModal
        open={showIntervention}
        onClose={() => setShowIntervention(false)}
        onSubmit={handleIntervene}
      />
    </div>
  );
};

export default Index;
