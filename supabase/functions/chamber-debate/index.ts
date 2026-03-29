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
    name: "O. Zipse",
    model: "claude-sonnet-4-20250514",
    provider: "anthropic",
    systemPrompt: `You are Oliver Zipse, CEO of BMW Group. Your north star is "Technology Neutrality." You protect long-term brand value. You reference the i3 launch (2013), iX3 pivot, and Neue Klasse. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words. Be direct and corporate.`,
  },
  {
    role: "CTO",
    name: "F. Weber",
    model: "google/gemini-2.5-pro",
    provider: "google",
    systemPrompt: `You are Frank Weber, CTO of BMW Group. You champion Neue Klasse architecture, Gen6 batteries, and software-defined vehicles. You push for engineering focus. Cite technical specs. Challenge the CEO when technology neutrality dilutes engineering excellence. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words.`,
  },
  {
    role: "CFO",
    name: "W. Mertl",
    model: "claude-opus-4-20250514",
    provider: "anthropic",
    systemPrompt: `You are Walter Mertl, CFO of BMW Group. Your sacred metrics: EBIT margin 8-10%, CapEx ratio, free cash flow, and shareholder ROI. Flag margin erosion, quantify risk in euros. Cite Tesla's margin compression and BMW's financial history. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words.`,
  },
  {
    role: "COO",
    name: "M. Nedeljković",
    model: "google/gemini-3.1-pro-preview",
    provider: "google",
    systemPrompt: `You are Milan Nedeljković, COO of BMW Group. You manage iFactory, production flexibility, and supply chain across 31 plants. Think in lead times, retooling costs, and logistics. Cite plant data for Munich, Dingolfing, Spartanburg. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words.`,
  },
  {
    role: "CHRO",
    name: "I. Horstmeier",
    model: "claude-haiku-4-5-20251001",
    provider: "anthropic",
    systemPrompt: `You are Ilka Horstmeier, CHRO of BMW Group. You protect the workforce and "BMW Way" culture. Manage EV skill-gap transition for 120,000+ employees and IG Metall agreements. Flag when decisions exceed workforce adaptation capacity. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words.`,
  },
  {
    role: "CSO",
    name: "J. Goller",
    model: "google/gemini-3-flash-preview",
    provider: "google",
    systemPrompt: `You are Jochen Goller, CSO of BMW Group. You own global sales with focus on China volatility, premium pricing power, and inventory. Track BEV penetration by region and competitive pricing from Li Auto/NIO/Mercedes. Every claim must end with [Source: Ledger] or [Source: Analysis]. Max 60 words.`,
  },
];

const LEDGER = `BMW STRATEGIC LEDGER (10-Year):
2013: i3 Launch — €2.5B invested. 165K units vs 300K target. [-€800M vs plan]
2018: iX3 — pivot to flexible CLAR. Saved €1.8B.
2020: iX3 outsold i3 2:1. China 58%. Margin: 7.2%.
2021: Neue Klasse — €10B investment. Gen6 cells: +30% range, +30% charging speed.
2022: EBIT 10.6%. Best German OEM.
2023: BEV 15% of deliveries. China BEV penetration: 33%.
2024: Samsung SDI solid-state confirmed. iFactory Munich retooling €1.2B. IG Metall cap: 800/yr.
2025: Tesla margin 8.1%. VW cuts shifts. Mercedes delays EQ. Li Auto #1 premium EV China.
METRICS: EBIT 9.8% | 6,200 R&D engineers (60/40 EV/ICE) | 120,800 workforce | 31 plants | China 33% revenue | 7 BEV models`;

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
      max_tokens: 200,
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
      max_tokens: 200,
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
      return new Response(JSON.stringify({ error: "Scenario required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_KEY = Deno.env.get("Claude_AI");
    if (!LOVABLE_KEY) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!CLAUDE_KEY) return new Response(JSON.stringify({ error: "Claude_AI secret missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const thread = (previousMessages || []).map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`).join("\n");
    const directive = userDirective ? `\nDIRECTIVE: ${userDirective.directive} (Target: ${userDirective.targetRole})` : "";

    const results = await Promise.all(AGENTS.map(async (agent) => {
      const isTarget = userDirective?.targetRole === agent.role;
      const prompt = `SCENARIO: ${scenario}\n${thread ? `DISCUSSION:\n${thread}\n` : ""}${directive}${isTarget ? `\n⚡ DIRECT DIRECTIVE TO YOU: "${userDirective.directive}". Incorporate this.` : ""}\nRespond as ${agent.role}. Challenge others. Max 60 words. Cite sources.`;

      const result = agent.provider === "anthropic"
        ? await callAnthropic(agent, prompt, CLAUDE_KEY)
        : await callGemini(agent, prompt, LOVABLE_KEY);

      return { role: agent.role, model: agent.model, provider: agent.provider, content: result.content, error: result.error };
    }));

    return new Response(JSON.stringify({ responses: results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Chamber error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
