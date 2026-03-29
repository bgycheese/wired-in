import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentConfig {
  role: string;
  name: string;
  model: string;
  systemPrompt: string;
}

const AGENTS: AgentConfig[] = [
  {
    role: "CEO",
    name: "O. Zipse",
    model: "openai/gpt-5.2",
    systemPrompt: `You are Oliver Zipse, CEO of BMW Group. You think in decades, not quarters. Your north star is "Technology Neutrality"—never bet the company on a single powertrain. You protect long-term brand value above all. You reference BMW's strategic history: the i3 launch (2013), its commercial underperformance, the pivot to iX3, and the Neue Klasse announcement. You are diplomatic but firm. You often cite brand equity metrics and competitor missteps. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be direct, corporate, and sharp.`,
  },
  {
    role: "CTO",
    name: "F. Weber",
    model: "google/gemini-2.5-pro",
    systemPrompt: `You are Frank Weber, CTO of BMW Group. You live and breathe the Neue Klasse architecture, Gen6 battery cells, and BMW's software-defined vehicle strategy. You push for engineering focus—split resources produce mediocre outcomes. You cite specific technical specs: Wh/kg figures, charging curves, software stack capabilities, and R&D headcount allocation. You challenge the CEO when technology neutrality dilutes engineering excellence. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be technical, precise, and assertive.`,
  },
  {
    role: "CFO",
    name: "W. Mertl",
    model: "openai/gpt-5",
    systemPrompt: `You are Walter Mertl, CFO of BMW Group. Your sacred metrics: EBIT margin 8-10%, CapEx ratio, free cash flow, and shareholder ROI. You are the financial conscience of the board. You flag margin erosion, quantify risk in euros, and demand cost offset plans before approving any initiative. You cite Tesla's margin compression, VW's cost overruns, and BMW's own financial history. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be numbers-driven, cautious, and incisive.`,
  },
  {
    role: "COO",
    name: "M. Nedeljković",
    model: "google/gemini-3.1-pro-preview",
    systemPrompt: `You are Milan Nedeljković, COO of BMW Group. You manage the iFactory concept, production flexibility, supply chain resilience, and energy costs across 31 plants. You think in lead times, retooling costs, and logistics bottlenecks. You champion modular production cells that can run dual powertrains. You cite specific plant data: Munich, Dingolfing, Spartanburg capacity and retooling timelines. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be operational, pragmatic, and detail-oriented.`,
  },
  {
    role: "CHRO",
    name: "I. Horstmeier",
    model: "openai/gpt-5-mini",
    systemPrompt: `You are Ilka Horstmeier, CHRO of BMW Group. You protect the workforce and "BMW Way" culture. You manage the EV skill-gap transition for 120,000+ employees, IG Metall labor agreements, retraining programs, and organizational change velocity. You flag when strategic decisions exceed the workforce's capacity to adapt. You cite specific labor metrics: retraining positions, union agreement caps, attrition rates. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be empathetic but firm, people-first.`,
  },
  {
    role: "CSO",
    name: "J. Goller",
    model: "google/gemini-3-flash-preview",
    systemPrompt: `You are Jochen Goller, CSO of BMW Group. You own global sales strategy, with acute focus on China-market volatility, premium pricing power, and inventory management. You track BEV penetration rates by region, competitive pricing moves from Li Auto/NIO/Mercedes, and dealer network readiness. You balance urgency (China EV adoption) against caution (global portfolio hedging). Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be market-savvy, data-driven, and commercially sharp.`,
  },
];

const LEDGER_CONTEXT = `
BMW STRATEGIC LEDGER (10-Year Summary):

2013: i3 Launch — First mass-market premium EV. Invested €2.5B. Carbon fiber body. Sold 165K units total vs. 300K target. [Financial Impact: -€800M vs plan]
2015: i8 hybrid supercar — halo effect positive, 20K units. Brand perception +12% in tech surveys.
2018: iX3 decision — pivot from dedicated EV platform to flexible CLAR architecture. Saved €1.8B in platform costs.
2020: iX3 launch — outsold i3 2:1 in first year. China sales 58% of volume. Margin: 7.2% (below 8% target).
2021: Neue Klasse announced — €10B investment through 2025. Dedicated EV platform. Gen6 cells target 30% range increase, 30% faster charging.
2022: Q3 EBIT margin hit 10.6% — driven by pricing power and semiconductor allocation strategy. Best-in-class among German OEMs.
2023: BEV share reached 15% of total deliveries. i5 and iX1 strong performers. China BEV penetration: 33% market-wide.
2024: Neue Klasse prototypes in testing. Samsung SDI solid-state partnership confirmed. iFactory Munich retooling begins (€1.2B). IG Metall agreement: max 800 involuntary transitions/year.
2025: Competitor landscape — Tesla margin compressed to 8.1%. VW Wolfsburg cuts shifts. Mercedes delays EQ platform. Li Auto #1 premium EV in China.

KEY METRICS:
- Current EBIT margin: 9.8%
- R&D headcount: 6,200 engineers (split ~60/40 EV/ICE)
- Global workforce: 120,800
- Plants: 31 worldwide
- China revenue share: 33%
- BEV models in portfolio: 7 (targeting 12 by 2026)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, previousMessages, userDirective } = await req.json();

    if (!scenario) {
      return new Response(
        JSON.stringify({ error: "Scenario is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the narrative thread from previous messages
    const narrativeThread = (previousMessages || [])
      .map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`)
      .join("\n");

    const directiveNote = userDirective
      ? `\n\nIMPORTANT DIRECTIVE FROM THE BOARD CHAIR: ${userDirective.directive} (Directed at: ${userDirective.targetRole})`
      : "";

    // Run all 6 agents in parallel
    const agentPromises = AGENTS.map(async (agent) => {
      const isDirectiveTarget =
        userDirective && userDirective.targetRole === agent.role;

      const messages = [
        {
          role: "system",
          content: `${agent.systemPrompt}\n\nBMW STRATEGIC LEDGER:\n${LEDGER_CONTEXT}`,
        },
        {
          role: "user",
          content: `SCENARIO FOR BOARD DEBATE: ${scenario}

${narrativeThread ? `PREVIOUS DISCUSSION:\n${narrativeThread}\n` : ""}${directiveNote}

${isDirectiveTarget ? `\n⚡ YOU HAVE RECEIVED A DIRECT DIRECTIVE: "${userDirective.directive}". You MUST incorporate this constraint into your response and acknowledge it.` : ""}

Provide your position as ${agent.role} (${agent.name}). Challenge the previous speakers where your KPIs conflict with their proposals. Be specific with numbers and data. Remember: max 60 words, end claims with [Source: Ledger] or [Source: Analysis].`,
        },
      ];

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: agent.model,
            messages,
            max_tokens: 150,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const status = response.status;
        const text = await response.text();
        console.error(`Agent ${agent.role} (${agent.model}) error:`, status, text);

        if (status === 429) {
          return {
            role: agent.role,
            model: agent.model,
            content: `[RATE LIMITED] Agent temporarily unavailable. Retry shortly.`,
            error: true,
          };
        }
        if (status === 402) {
          return {
            role: agent.role,
            model: agent.model,
            content: `[CREDITS EXHAUSTED] Add funds at Settings > Workspace > Usage.`,
            error: true,
          };
        }
        return {
          role: agent.role,
          model: agent.model,
          content: `[ERROR] Agent failed to respond (${status}).`,
          error: true,
        };
      }

      const data = await response.json();
      const content =
        data.choices?.[0]?.message?.content || "[No response generated]";

      return {
        role: agent.role,
        model: agent.model,
        content: content.trim(),
        error: false,
      };
    });

    const results = await Promise.all(agentPromises);

    return new Response(JSON.stringify({ responses: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chamber error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
