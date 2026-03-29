import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS, type AgentRole } from '@/lib/agents';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';

export interface VoteResult {
  role: string;
  position: string;
  stance: string;
}

interface VotePanelProps {
  votes: VoteResult[];
  verdict: string;
  visible: boolean;
  isLoading: boolean;
}

const positionBadge = (pos: string) => {
  if (pos === 'FOR') return 'bg-terminal-green/15 text-terminal-green border-terminal-green/30';
  if (pos === 'AGAINST') return 'bg-terminal-red/15 text-terminal-red border-terminal-red/30';
  if (pos === 'OPINION') return 'bg-bmw-blue/15 text-bmw-blue border-bmw-blue/30';
  return 'bg-terminal-amber/15 text-terminal-amber border-terminal-amber/30';
};

const verdictColor = (v: string) => {
  if (v.includes('APPROVED')) return 'text-terminal-green';
  if (v.includes('REJECTED')) return 'text-terminal-red';
  if (v.includes('CONSENSUS')) return 'text-bmw-blue';
  return 'text-terminal-amber';
};

const VotePanel = ({ votes, verdict, visible, isLoading }: VotePanelProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gold/30 bg-surface-1 overflow-hidden"
        >
          {/* Header — always visible, clickable to toggle */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="w-full px-4 py-3 border-b border-border flex items-center justify-between cursor-pointer hover:bg-surface-2/40 transition-colors"
          >
            <div className="font-mono text-sm uppercase tracking-[0.15em] text-gold font-semibold flex items-center gap-2">
              Board Vote
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
            {!isLoading && votes.length > 0 && (
              <div className="flex gap-4 font-mono text-xs">
                {votes.some(v => v.position === 'FOR' || v.position === 'AGAINST') ? (
                  <>
                    <span className="text-terminal-green">{votes.filter(v => v.position === 'FOR').length} FOR</span>
                    <span className="text-terminal-red">{votes.filter(v => v.position === 'AGAINST').length} AGAINST</span>
                    <span className="text-terminal-amber">{votes.filter(v => v.position === 'CONDITIONAL').length} COND</span>
                  </>
                ) : (
                  <span className="text-bmw-blue">{votes.length} OPINIONS</span>
                )}
              </div>
            )}
          </button>

          {/* Collapsible content */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Loading state */}
                {isLoading && (
                  <div className="px-4 py-8 flex items-center justify-center gap-3">
                    <Loader2 className="w-4 h-4 text-gold animate-spin" />
                    <span className="font-mono text-sm text-foreground/60">Agents casting votes...</span>
                  </div>
                )}

                {/* Votes list */}
                {!isLoading && votes.length > 0 && (
                  <div className="p-4 space-y-2">
                    {votes.map((vote, i) => {
                      const agent = AGENTS[vote.role as AgentRole];
                      return (
                        <motion.div
                          key={vote.role}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3 py-2 px-3 rounded bg-surface-2/50"
                        >
                          <span className={`font-mono text-sm font-bold w-14 ${agent?.color || 'text-foreground'}`}>
                            {vote.role}
                          </span>
                          <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${positionBadge(vote.position)}`}>
                            {vote.position}
                          </span>
                          <span className="font-mono text-sm text-foreground flex-1">
                            {vote.stance}
                          </span>
                        </motion.div>
                      );
                    })}

                    {/* Verdict */}
                    <div className="mt-3 pt-3 border-t border-border text-center">
                      <span className="font-mono text-sm text-foreground/60 mr-2">VERDICT:</span>
                      <span className={`font-mono text-base font-bold ${verdictColor(verdict)}`}>{verdict}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VotePanel;
