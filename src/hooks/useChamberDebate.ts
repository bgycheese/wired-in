import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AgentRole, ChamberMessage } from '@/lib/agents';

interface AgentResponse {
  role: string;
  model: string;
  content: string;
  error: boolean;
}

interface DebateRoundResult {
  responses: AgentResponse[];
}

export function useChamberDebate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebateRound = useCallback(async (
    scenario: string,
    previousMessages: ChamberMessage[],
    userDirective?: { targetRole: AgentRole; directive: string }
  ): Promise<ChamberMessage[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chamber-debate', {
        body: {
          scenario,
          previousMessages: previousMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userDirective,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to invoke chamber debate');
      }

      const result = data as DebateRoundResult;

      const newMessages: ChamberMessage[] = result.responses.map((r, i) => ({
        id: `${Date.now()}-${i}`,
        role: r.role as AgentRole,
        content: r.content,
        source: r.content.includes('[Source: Ledger]') ? 'Ledger' as const :
                r.content.includes('[Source: Analysis]') ? 'Analysis' as const :
                'Live: News' as const,
        timestamp: new Date(),
        dissent: r.content.toLowerCase().includes('however') ||
                 r.content.toLowerCase().includes('disagree') ||
                 r.content.toLowerCase().includes('challenge') ||
                 r.content.toLowerCase().includes('risk') ||
                 r.content.toLowerCase().includes('but '),
        model: r.model,
      }));

      return newMessages;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { runDebateRound, isLoading, error };
}
