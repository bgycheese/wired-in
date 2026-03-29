// Chamber Debate v4 - Fixed Haiku model ID to claude-haiku-4-5-20251001
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
  provider: "anthropic" | "google";
  systemPrompt: string;
}

const AGENTS: AgentConfig[] = [
  {
    role: "CEO",
    name: "Oliver Zipse",
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
    systemPrompt: `You are Oliver Zipse, Chairman. Your output must be a "Strategic Directive." 
    - FORMAT: (1) Current Assessment (2) Executive Order. 
    - FOCUS: Global brand stability and shareholder value. 
    - MANDATE: Max 60 words. Use [Ledger] for history.`,
  },
  {
    role: "CTO",
    name: "Frank Weber",
    model: "google/gemini-3-flash-preview",
    provider: "google",
    systemPrompt: `You are Frank Weber, Head of Development. Your output is a "Technical Briefing." 
    - FORMAT: (1) Capability Analysis (2) R&D Action. 
    - STYLE: Focus on 800V, Superbrains, and Software-defined features. 
    - FOCUS: Innovation lead over Tesla/Xiaomi. 
    - MANDATE: Max 70 words. Use [Ledger] for technical context.`,
  },
  {
    role: "CFO",
    name: "Walter Mertl",
    model: "claude-opus-4-20250514",
    provider: "anthropic",
    systemPrompt: `You are Walter Mertl, Head of Finance. Your output is a "Financial Audit." 
    - FORMAT: (1) Margin Impact (2) Capital Allocation. 
    - STYLE: Protect the 8-10% EBIT margin. Look for people sourcing (in case of hires) externally and argue why.
    - FOCUS: ROI, Free Cash Flow, and Tariff mitigation. 
    - MANDATE: Max 50 words. Be blunt.`,
  },
  {
    role: "COO",
    name: "Milan Nedeljković",
    model: "google/gemini-3-flash-preview",
    provider: "google",
    systemPrompt: `You are Milan Nedeljković, Head of Production. Your output is an "Operational Report." 
    - FORMAT: (1) Logistics/Supply Status (2) Plant Directive. 
    - STYLE: Focus on 'iFactory' and energy prices, focus on hiring/promoting internal employees and leaders when it comes to hiring. 
    - FOCUS: Bypassing tariffs via local assembly and securing Gen6 cells. 
    - MANDATE: Max 70 words.`,
  },
  {
    role: "CHRO",
    name: "Ilka Horstmeier",
    model: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    systemPrompt: `You are Ilka Horstmeier, Head of People. Your output is a "Workforce Impact Assessment." 
    - FORMAT: (1) Labor Risk (2) Talent Strategy. 
    - STYLE: Human-centric. 
    - FOCUS: Skills transition to EV and avoiding German labor strikes. How to recruit people: promote internally or hire externally. In case of recruiting board members: look for board members from fellow conglomerates (like Amazon, Mclaren, Porsche, OpenAI etc) that were recently laid off, that performed in similar scenarios and can take up the position.
    - MANDATE: Max 50 words.`,
  },
  {
    role: "CSO",
    name: "Jochen Goller",
    model: "google/gemini-3-flash-preview",
    provider: "google",
    systemPrompt: `You are Jochen Goller, Head of Sales. Your output is a "Market Intelligence Report." 
    - FORMAT: (1) Region Analysis (2) Sales Strategy. 
    - STYLE: Market-aggressive. Focus on China and the US. Keep track of world-state affairs at all time in case of relevance to market.
    - FOCUS: Inventory turns, competition from Chinese OEMs, and premium pricing. 
    - MANDATE: Max 60 words.`,
  },
];

const LEDGER = `[BMW GROUP MASTER LEDGER: 2016-2026]
- 2016: "Strategy NUMBER ONE > NEXT" launched. Shift to A.C.E.S (Automated, Connected, Electrified, Shared).
- 2018: "Upper Luxury" offensive (X7, 8 Series). Reason: Capture high-margin segments to fund EV R&D. Result: +1.2% margin lift.
- 2022: China BBA Buyout: BMW increased stake in Chinese JV to 75% for €3.7B. Reason: Full control of Shenyang hub (830k capacity).
- 2023: Promoted Walter Mertl to CFO (Internal). Reason: Continuity in cost-discipline after Nicolas Peter's retirement.
- 2024: Promoted Jochen Goller to Board (Sales). He is a "China Veteran" moved to Munich to handle the Asian volatility.
- 2025: "Neue Klasse" Launch (iX3). Reason: Leapfrog Tesla/Nio. Spec: 800V, 800km range, 400kW charging.
- 2025: Hired Dr. Nicolai Martin (External/Internal hybrid promotion) for Purchasing. Reason: Secure Gen6 battery supply chain.
- 2026 (Q1): Tariff Crisis. EU imposes 20-30% on China-made EVs. US tariffs hit 100%.
- 2026 (Q1): Competition: Xiaomi SU7 Ultra and Nio ET9 attacking the 7 Series segment in China.
- STRATEGIC DOCTRINE: "Technology Neutrality." BMW will NOT set an end-date for ICE (Gas) engines to remain resilient against fluctuating EV demand.
- PRICING: High-end models (7, 8, XM) subsidize the lower-margin EV ramp-up.
- POLITICAL UNSTABILITY: "Local for Local" strategy. Building engines in the markets where they are sold to bypass trade wars.`;

async function callAnthropic(agent: AgentConfig, userContent: string, apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: agent.model,
      max_tokens: 400,
      system: `${agent.systemPrompt}\n\n${LEDGER}`,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`Anthropic ${agent.role} (${agent.model}) error ${res.status}:`, t);
    return { content: `[ERROR] Claude agent failed (${res.status}). ${t.slice(0, 100)}`, error: true };
  }
  const data = await res.json();
  return { content: (data.content?.[0]?.text || "[No response]").trim(), error: false };
}

async function callGemini(agent: AgentConfig, userContent: string, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: agent.model,
      messages: [
        { role: "system", content: `${agent.systemPrompt}\n\n${LEDGER}` },
        { role: "user", content: userContent },
      ],
      max_tokens: 400,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error(`Gemini ${agent.role} (${agent.model}) error ${res.status}:`, t);
    return { content: `[ERROR] Gemini agent failed (${res.status}).`, error: true };
  }
  const data = await res.json();
  return { content: (data.choices?.[0]?.message?.content || "[No response]").trim(), error: false };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenario, previousMessages, userDirective } = await req.json();
    if (!scenario) {
      return new Response(JSON.stringify({ error: "Scenario required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_KEY = Deno.env.get("Claude_AI");
    if (!LOVABLE_KEY)
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (!CLAUDE_KEY)
      return new Response(JSON.stringify({ error: "Claude_AI secret missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const thread = (previousMessages || [])
      .map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`)
      .join("\n");
    const directive = userDirective
      ? `\nDIRECTIVE: ${userDirective.directive} (Target: ${userDirective.targetRole})`
      : "";

    // Sequential execution: each agent sees all prior agent responses
    const conversationHistory: { role: string; content: string }[] = [
      { role: "user", content: `SCENARIO: ${scenario}${thread ? `\nDISCUSSION:\n${thread}` : ""}${directive}` },
    ];

    const results = [];
    for (const agent of AGENTS) {
      const isTarget = userDirective?.targetRole === agent.role;
      const agentSystemPrompt = `${agent.systemPrompt}\n\n${LEDGER}`;

      // Build messages for this agent including full conversation history
      const messages = [
        { role: "system" as const, content: agentSystemPrompt },
        ...conversationHistory,
        ...(isTarget
          ? [{ role: "user" as const, content: `⚡ DIRECT DIRECTIVE TO YOU: "${userDirective!.directive}". Incorporate this.` }]
          : []),
        { role: "user" as const, content: `Respond as ${agent.role}. Challenge others if you disagree. Max 60 words. Cite sources.` },
      ];

      let result;
      if (agent.provider === "anthropic") {
        const nonSystem = messages.filter((m) => m.role !== "system");
        const anthropicMessages = nonSystem.map((m) => ({
          role: m.role === "user" ? "user" as const : "assistant" as const,
          content: m.content,
        }));
        const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": CLAUDE_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: agent.model,
            max_tokens: 400,
            system: agentSystemPrompt,
            messages: anthropicMessages,
          }),
        });
        if (!anthropicRes.ok) {
          const t = await anthropicRes.text();
          console.error(`Anthropic ${agent.role} error:`, t);
          result = { content: `[ERROR] Claude agent failed (${anthropicRes.status}).`, error: true };
        } else {
          const data = await anthropicRes.json();
          result = { content: (data.content?.[0]?.text || "[No response]").trim(), error: false };
        }
      } else {
        // Gemini via Lovable gateway (OpenAI-compatible)
        const geminiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: agent.model,
            messages,
            max_tokens: 400,
          }),
        });
        if (!geminiRes.ok) {
          const t = await geminiRes.text();
          console.error(`Gemini ${agent.role} error:`, t);
          result = { content: `[ERROR] Gemini agent failed (${geminiRes.status}).`, error: true };
        } else {
          const data = await geminiRes.json();
          result = { content: (data.choices?.[0]?.message?.content || "[No response]").trim(), error: false };
        }
      }

      // Append this agent's response to conversation history for next agents
      conversationHistory.push({
        role: "assistant",
        content: `[${agent.role} - ${agent.name}]: ${result.content}`,
      });

      results.push({
        role: agent.role,
        model: agent.model,
        provider: agent.provider,
        content: result.content,
        error: result.error,
      });
    }

    return new Response(JSON.stringify({ responses: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Chamber error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
