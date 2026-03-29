import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS, type ChamberMessage } from '@/lib/agents';
import { AlertTriangle } from 'lucide-react';

interface ChamberFloorProps {
  messages: ChamberMessage[];
  scenario: string;
  isDebating: boolean;
}

const ChamberFloor = ({ messages, scenario, isDebating }: ChamberFloorProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Scenario header */}
      <div className="px-4 py-3 bg-surface-2 border-b border-border">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          Active Scenario
        </div>
        <div className="font-mono text-sm text-gold leading-tight">
          {scenario}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 relative scanline">
        <AnimatePresence>
          {messages.map((msg, i) => {
            const agent = AGENTS[msg.role];
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="font-mono text-sm leading-relaxed"
              >
                <div className="flex items-start gap-2 py-2 group">
                  {/* Timestamp */}
                  <span className="text-muted-foreground shrink-0 text-[11px] pt-0.5 opacity-60">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  {/* Role tag */}
                  <span className={`shrink-0 font-bold ${agent.color} min-w-[4rem]`}>
                    [{msg.role}]
                  </span>

                  {/* Dissent indicator */}
                  {msg.dissent && (
                    <AlertTriangle className="w-3 h-3 text-terminal-amber shrink-0 mt-0.5" />
                  )}

                  {/* Content */}
                  <span className="text-foreground/90">
                    {msg.content}
                    <span className="text-muted-foreground ml-2 text-[10px]">
                      [{msg.source}]
                    </span>
                    {msg.model && (
                      <span className="text-muted-foreground/40 ml-1 text-[9px]">
                        via {msg.model}
                      </span>
                    )}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isDebating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 py-2 font-mono text-xs"
          >
            <span className="text-muted-foreground text-[10px]">
              {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-gold-dim animate-pulse-glow">▮ AGENTS DELIBERATING...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChamberFloor;
