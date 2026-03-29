import { AGENT_ORDER, AGENTS } from '@/lib/agents';

const AgentRoster = () => {
  return (
    <div className="border-r border-border bg-surface-1 w-52 flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-border">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/70">
          Board Members
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {AGENT_ORDER.map(role => {
          const agent = AGENTS[role];
          return (
            <div key={role} className="px-3 py-2.5 border-b border-border/50 hover:bg-surface-2 transition-colors">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-terminal-green" />
                <span className={`font-mono text-xs font-bold ${agent.color}`}>{role}</span>
              </div>
              <div className="font-mono text-xs text-foreground/80 pl-3.5">{agent.name}</div>
              <div className="font-mono text-[11px] text-foreground/50 pl-3.5 mt-0.5">{agent.focus}</div>
              <div className="font-mono text-[10px] pl-3.5 mt-0.5">
                <span className={agent.provider === 'Anthropic' ? 'text-terminal-amber/70' : 'text-bmw-blue/70'}>
                  {agent.provider}
                </span>
                <span className="text-foreground/30"> / </span>
                <span className="text-foreground/40">{agent.model}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session info */}
      <div className="px-3 py-2 border-t border-border">
        <div className="font-mono text-[11px] text-foreground/40 space-y-0.5">
          <div>SESSION: #0042</div>
          <div>PROTOCOL: v2.1</div>
          <div>LEDGER: 10Y LOADED</div>
          <div>MODELS: 3× Claude, 3× Gemini</div>
        </div>
      </div>
    </div>
  );
};

export default AgentRoster;
