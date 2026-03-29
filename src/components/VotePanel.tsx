import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS, type AgentVote } from '@/lib/agents';

interface VotePanelProps {
  votes: AgentVote[];
  visible: boolean;
}

const positionColor = (pos: string) => {
  if (pos === 'FOR') return 'text-terminal-green border-terminal-green/30 bg-terminal-green/5';
  if (pos === 'AGAINST') return 'text-terminal-red border-terminal-red/30 bg-terminal-red/5';
  return 'text-terminal-amber border-terminal-amber/30 bg-terminal-amber/5';
};

const VotePanel = ({ votes, visible }: VotePanelProps) => {
  const forCount = votes.filter(v => v.position === 'FOR').length;
  const againstCount = votes.filter(v => v.position === 'AGAINST').length;
  const conditionalCount = votes.filter(v => v.position === 'CONDITIONAL').length;
  const avgConfidence = Math.round(votes.reduce((s, v) => s + v.confidence, 0) / votes.length);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-gold/30 bg-surface-1 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
              ▶ Board Vote Results
            </div>
            <div className="flex gap-3 font-mono text-[10px]">
              <span className="text-terminal-green">FOR: {forCount}</span>
              <span className="text-terminal-red">AGAINST: {againstCount}</span>
              <span className="text-terminal-amber">COND: {conditionalCount}</span>
              <span className="text-muted-foreground">AVG CONF: {avgConfidence}%</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2">
            {votes.map((vote, i) => (
              <motion.div
                key={vote.role}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`border rounded-sm px-3 py-2 ${positionColor(vote.position)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-xs font-bold ${AGENTS[vote.role].color}`}>
                    {vote.role}
                  </span>
                  <span className="font-mono text-[10px]">
                    {vote.position} — {vote.confidence}%
                  </span>
                </div>
                <p className="font-mono text-[10px] text-foreground/80 leading-relaxed">
                  {vote.stance}
                </p>
                {/* Confidence bar */}
                <div className="mt-2 h-0.5 bg-surface-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${vote.confidence}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                    className={`h-full rounded-full ${
                      vote.position === 'FOR' ? 'bg-terminal-green' :
                      vote.position === 'AGAINST' ? 'bg-terminal-red' :
                      'bg-terminal-amber'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Verdict */}
          <div className="px-4 py-3 border-t border-border">
            <div className="font-mono text-xs text-center">
              <span className="text-muted-foreground">BOARD VERDICT: </span>
              <span className="text-terminal-red font-bold">MOTION REJECTED</span>
              <span className="text-muted-foreground"> — 1 FOR, 3 AGAINST, 2 CONDITIONAL</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VotePanel;
