import { Zap, Vote, RotateCcw, Play, Pause } from 'lucide-react';

interface ControlBarProps {
  isDebating: boolean;
  onIntervene: () => void;
  onVote: () => void;
  onToggleDebate: () => void;
  onReset: () => void;
}

const ControlBar = ({ isDebating, onIntervene, onVote, onToggleDebate, onReset }: ControlBarProps) => {
  return (
    <div className="h-12 bg-surface-1 border-t border-border flex items-center px-4 gap-2">
      {/* Status */}
      <div className="flex items-center gap-2 mr-4">
        <div className={`w-1.5 h-1.5 rounded-full ${isDebating ? 'bg-terminal-green animate-pulse-glow' : 'bg-muted-foreground'}`} />
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {isDebating ? 'LIVE SESSION' : 'PAUSED'}
        </span>
      </div>

      <div className="flex-1" />

      {/* Controls */}
      <button
        onClick={onToggleDebate}
        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
      >
        {isDebating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        {isDebating ? 'Processing...' : 'Next Round'}
      </button>

      <button
        onClick={onIntervene}
        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-gold/50 rounded-sm text-gold hover:bg-gold/10 transition-colors glow-gold"
      >
        <Zap className="w-3 h-3" />
        Intervene
      </button>

      <button
        onClick={onVote}
        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-bmw-blue/50 rounded-sm text-bmw-blue hover:bg-bmw-blue/10 transition-colors glow-blue"
      >
        <Vote className="w-3 h-3" />
        Call Vote
      </button>

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Reset
      </button>
    </div>
  );
};

export default ControlBar;
