import { motion, AnimatePresence } from 'framer-motion';
import { AGENTS, type ChamberMessage } from '@/lib/agents';
import { AlertTriangle } from 'lucide-react';
import React from 'react';

/** Renders text with **bold** markers and line breaks for numbered items / headers */
const FormattedContent = ({ text }: { text: string }) => {
  // Split on numbered items or known headers to create line breaks
  const lines = text.split(/(?=\(\d+\)\s|(?:Current Assessment|Executive Order|Capability Analysis|R&D Action|Financial Audit|Margin Impact|Capital Allocation|Operational Report|Logistics|Plant Directive|Labor Risk|Talent Strategy|Workforce Impact|Region Analysis|Sales Strategy|Market Intelligence):)/i);

  // Parse bold markers: **text** or *text*
  const parseBold = (str: string) => {
    // First pass: **double asterisks**
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <strong key={j} className="text-foreground font-bold">{part.slice(1, -1)}</strong>;
      }
      return <React.Fragment key={j}>{part}</React.Fragment>;
    });
  };

  return (
    <>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <span className={i > 0 ? 'ml-4 inline-block' : ''}>
            {parseBold(line)}
          </span>
        </React.Fragment>
      ))}
    </>
  );
};

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
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/60 mb-1">
          Active Scenario
        </div>
        <div className="font-mono text-base text-gold leading-tight">
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
                  <span className="text-foreground/40 shrink-0 text-xs pt-0.5">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>

                  {/* Role tag */}
                  <span className={`shrink-0 font-bold text-sm ${agent.color} min-w-[4rem]`}>
                    [{msg.role}]
                  </span>

                  {/* Dissent indicator */}
                  {msg.dissent && (
                    <AlertTriangle className="w-3 h-3 text-terminal-amber shrink-0 mt-0.5" />
                  )}

                  {/* Content */}
                  <div className="text-foreground text-sm flex-1">
                    <FormattedContent text={msg.content} />
                    <span className="text-foreground/40 ml-2 text-xs">
                      [{msg.source}]
                    </span>
                    {msg.model && (
                      <span className="text-bmw-blue/70 ml-2 text-xs font-medium">
                        via {msg.model}
                      </span>
                    )}
                  </div>
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
            <span className="text-foreground/40 text-xs">
              {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-gold-dim animate-pulse-glow text-sm">▮ AGENTS DELIBERATING...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChamberFloor;
