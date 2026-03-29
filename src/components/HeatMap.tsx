import { AGENT_ORDER, type ConsensusData, AGENTS } from '@/lib/agents';

interface HeatMapProps {
  consensus: ConsensusData[];
}

const getColor = (val: number): string => {
  if (val >= 0.6) return 'bg-terminal-green/80';
  if (val >= 0.2) return 'bg-terminal-green/30';
  if (val > -0.2) return 'bg-surface-3';
  if (val > -0.6) return 'bg-terminal-red/30';
  return 'bg-terminal-red/80';
};

const HeatMap = ({ consensus }: HeatMapProps) => {
  return (
    <div className="border-l border-border bg-surface-1 w-64 flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-border">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Consensus Matrix
        </div>
      </div>

      <div className="p-3 flex-1 overflow-auto">
        {/* Header row */}
        <div className="flex gap-0.5 mb-0.5 pl-12">
          {AGENT_ORDER.map(role => (
            <div key={role} className="w-8 text-center font-mono text-[8px] text-muted-foreground">
              {role.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Grid */}
        {consensus.map(row => (
          <div key={row.role} className="flex gap-0.5 mb-0.5 items-center">
            <span className={`font-mono text-[10px] font-bold w-12 text-right pr-2 ${AGENTS[row.role].color}`}>
              {row.role}
            </span>
            {AGENT_ORDER.map(col => (
              <div
                key={col}
                className={`w-8 h-6 rounded-sm ${getColor(row.alignment[col])} transition-colors duration-500`}
                title={`${row.role} → ${col}: ${(row.alignment[col] * 100).toFixed(0)}%`}
              />
            ))}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-1 font-mono text-[8px] text-muted-foreground">
          <div className="w-3 h-2 bg-terminal-red/80 rounded-sm" />
          <span>Dissent</span>
          <div className="w-3 h-2 bg-surface-3 rounded-sm ml-2" />
          <span>Neutral</span>
          <div className="w-3 h-2 bg-terminal-green/80 rounded-sm ml-2" />
          <span>Aligned</span>
        </div>
      </div>

      {/* Aggregate score */}
      <div className="px-3 py-2 border-t border-border">
        <div className="font-mono text-[10px] text-muted-foreground mb-1">Overall Consensus</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-terminal-amber rounded-full" style={{ width: '42%' }} />
          </div>
          <span className="font-mono text-xs text-terminal-amber font-bold">42%</span>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
