import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import TickerTape from '@/components/TickerTape';
import AgentRoster from '@/components/AgentRoster';
import ChamberFloor from '@/components/ChamberFloor';
import ControlBar from '@/components/ControlBar';
import InterventionModal from '@/components/InterventionModal';
import VotePanel, { type VoteResult } from '@/components/VotePanel';
import { useChamberDebate } from '@/hooks/useChamberDebate';
import { supabase } from '@/integrations/supabase/client';
import {
  MOCK_SCENARIO,
  type AgentRole,
  type ChamberMessage,
} from '@/lib/agents';

const Index = () => {
  const [messages, setMessages] = useState<ChamberMessage[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const [showVotes, setShowVotes] = useState(false);
  const [votes, setVotes] = useState<VoteResult[]>([]);
  const [verdict, setVerdict] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [scenario, setScenario] = useState(MOCK_SCENARIO);
  const [scenarioInput, setScenarioInput] = useState('');
  const [showScenarioInput, setShowScenarioInput] = useState(true);
  const roundRef = useRef(0);

  const { runDebateRound, isLoading, error } = useChamberDebate();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const startDebate = async (customScenario?: string) => {
    const activeScenario = customScenario || scenario;
    setScenario(activeScenario);
    setShowScenarioInput(false);
    setIsDebating(true);
    setMessages([]);
    setShowVotes(false);
    setVotes([]);
    setVerdict('');
    roundRef.current += 1;

    const newMessages = await runDebateRound(activeScenario, []);
    if (newMessages.length > 0) {
      setMessages(newMessages);
    }
    setIsDebating(false);
  };

  const continueDebate = async () => {
    if (isLoading) return;
    setIsDebating(true);
    const newMessages = await runDebateRound(scenario, messages);
    if (newMessages.length > 0) {
      setMessages(prev => [...prev, ...newMessages]);
    }
    setIsDebating(false);
  };

  const handleCallVote = async () => {
    if (isVoting || messages.length === 0) return;
    setShowVotes(true);
    setIsVoting(true);
    setVotes([]);
    setVerdict('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chamber-vote', {
        body: {
          scenario,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        },
      });

      if (fnError) throw new Error(fnError.message);

      setVotes(data.votes || []);
      setVerdict(data.verdict || 'UNDETERMINED');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Vote failed');
    } finally {
      setIsVoting(false);
    }
  };

  const handleIntervene = async (role: AgentRole, directive: string) => {
    const marker: ChamberMessage = {
      id: `int-${Date.now()}`,
      role,
      content: `⚡ DIRECTIVE RECEIVED: "${directive}" — Recalculating positions...`,
      source: 'Analysis',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, marker]);

    setIsDebating(true);
    const newMessages = await runDebateRound(scenario, messages, { targetRole: role, directive });
    if (newMessages.length > 0) {
      setMessages(prev => [...prev, ...newMessages]);
    }
    setIsDebating(false);
  };

  const handleReset = () => {
    setMessages([]);
    setShowVotes(false);
    setVotes([]);
    setVerdict('');
    setIsDebating(false);
    setShowScenarioInput(true);
  };

  const handleScenarioSubmit = () => {
    const s = scenarioInput.trim();
    if (s) {
      startDebate(s);
      setScenarioInput('');
    }
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

      {/* Scenario input overlay */}
      {showScenarioInput && (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl px-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/70 mb-3">
              Initialize Board Scenario
            </div>
            <textarea
              value={scenarioInput}
              onChange={(e) => setScenarioInput(e.target.value)}
              placeholder={MOCK_SCENARIO}
              className="w-full bg-surface-1 border border-border rounded-sm px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold resize-none h-24"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleScenarioSubmit();
                }
              }}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleScenarioSubmit}
                disabled={!scenarioInput.trim()}
                className="px-4 py-2 bg-gold/10 border border-gold text-gold font-mono text-[10px] uppercase tracking-[0.15em] rounded-sm hover:bg-gold/20 transition-colors disabled:opacity-30"
              >
                Initiate Debate
              </button>
              <button
                onClick={() => startDebate(MOCK_SCENARIO)}
                className="px-4 py-2 border border-border text-foreground/60 font-mono text-[10px] uppercase tracking-[0.15em] rounded-sm hover:text-foreground hover:border-muted-foreground transition-colors"
              >
                Use Default Scenario
              </button>
            </div>
            <div className="font-mono text-xs text-muted-foreground mt-4">
              6 agents • 3× Anthropic (Claude Opus 4, Sonnet 4, Haiku 4.5) • 3× Google (Gemini 3 Flash) • Parallel execution
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {!showScenarioInput && (
        <>
          <div className="flex-1 flex min-h-0">
            <AgentRoster />
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <ChamberFloor
                messages={messages}
                scenario={scenario}
                isDebating={isLoading}
              />
              <VotePanel votes={votes} verdict={verdict} visible={showVotes} isLoading={isVoting} />
            </div>
          </div>

          <ControlBar
            isDebating={isLoading}
            onIntervene={() => setShowIntervention(true)}
            onVote={handleCallVote}
            onToggleDebate={() => {
              if (isLoading) return;
              continueDebate();
            }}
            onReset={handleReset}
          />
        </>
      )}

      <InterventionModal
        open={showIntervention}
        onClose={() => setShowIntervention(false)}
        onSubmit={handleIntervene}
      />
    </div>
  );
};

export default Index;
