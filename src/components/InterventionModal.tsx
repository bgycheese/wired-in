import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AGENT_ORDER, AGENTS, type AgentRole } from '@/lib/agents';
import { X } from 'lucide-react';

interface InterventionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (role: AgentRole, directive: string) => void;
}

const InterventionModal = ({ open, onClose, onSubmit }: InterventionModalProps) => {
  const [selectedRole, setSelectedRole] = useState<AgentRole>('CFO');
  const [directive, setDirective] = useState('');

  const handleSubmit = () => {
    if (directive.trim()) {
      onSubmit(selectedRole, directive.trim());
      setDirective('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-surface-1 border border-border rounded-sm w-full max-w-lg mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold">
                ⚡ Executive Intervention
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Agent selector */}
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                  Target Agent
                </label>
                <div className="flex gap-1">
                  {AGENT_ORDER.map(role => (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-1.5 font-mono text-xs rounded-sm border transition-all ${
                        selectedRole === role
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target info */}
              <div className="font-mono text-[10px] text-muted-foreground bg-surface-2 px-3 py-2 rounded-sm">
                {AGENTS[selectedRole].name} — {AGENTS[selectedRole].focus} — KPI: {AGENTS[selectedRole].kpi}
              </div>

              {/* Directive input */}
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground block mb-2">
                  Directive
                </label>
                <textarea
                  value={directive}
                  onChange={(e) => setDirective(e.target.value)}
                  placeholder="e.g., Assume 15% increase in energy costs for this scenario..."
                  className="w-full bg-surface-2 border border-border rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold resize-none h-20"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!directive.trim()}
                className="w-full py-2 bg-gold/10 border border-gold text-gold font-mono text-xs uppercase tracking-[0.15em] rounded-sm hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Issue Directive
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InterventionModal;
