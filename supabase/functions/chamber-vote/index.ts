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
}

const AGENTS: AgentConfig[] = [
  { role: "CEO", name: "O. Zipse", model: "claude-sonnet-4-20250514", provider: "anthropic" },
  { role: "CTO", name: "F. Weber", model: "google/gemini-3-flash-preview", provider: "google" },
  { role: "CFO", name: "W. Mertl", model: "claude-opus-4-20250514", provider: "anthropic" },
  { role: "COO", name: "M. Nedeljković", model: "google/gemini-3-flash-preview", provider: "google" },
  { role: "CHRO", name: "I. Horstmeier", model: "claude-haiku-4-5-20251001", provider: "anthropic" },
  { role: "CSO", name: "J. Goller", model: "google/gemini-3-flash-preview", provider: "google" },
];

const VOTE_PROMPT = (role: string, scenario: string, debate: string) =>
  `You are a BMW Board member (${role}). Based on this scenario and debate, cast your final vote.

SCENARIO: ${scenario}

DEBATE SUMMARY:
${debate}

Respond ONLY in this exact format (no other text):
POSITION: FOR or AGAINST or CONDITIONAL
STANCE: [One clear sentence explaining your position, max 25 words]`;

async function callAnthropic(model: string, prompt: string, apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 100, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.content?.[0]?.text?.trim() || null;
}

async function callGemini(model: string, prompt: string, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 100 }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

function parseVote(raw: string | null): { position: string; stance: string } {
  if (!raw) return { position: "CONDITIONAL", stance: "Unable to determine position." };
  const posMatch = raw.match(/POSITION:\s*(FOR|AGAINST|CONDITIONAL)/i);
  const stanceMatch = raw.match(/STANCE:\s*(.+)/i);
  return {
    position: posMatch ? posMatch[1].toUpperCase() : "CONDITIONAL",
    stance: stanceMatch ? stanceMatch[1].trim() : raw.slice(0, 120),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenario, messages } = await req.json();
    if (!scenario) {
      return new Response(JSON.stringify({ error: "Scenario required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    const CLAUDE_KEY = Deno.env.get("Claude_AI");
    if (!LOVABLE_KEY || !CLAUDE_KEY) {
      return new Response(JSON.stringify({ error: "API keys missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const debate = (messages || []).map((m: { role: string; content: string }) => `[${m.role}]: ${m.content}`).join("\n");

    const results = await Promise.all(AGENTS.map(async (agent) => {
      const prompt = VOTE_PROMPT(agent.role, scenario, debate);
      const raw = agent.provider === "anthropic"
        ? await callAnthropic(agent.model, prompt, CLAUDE_KEY)
        : await callGemini(agent.model, prompt, LOVABLE_KEY);
      const parsed = parseVote(raw);
      return { role: agent.role, ...parsed };
    }));

    // Determine verdict
    const forCount = results.filter(r => r.position === "FOR").length;
    const againstCount = results.filter(r => r.position === "AGAINST").length;
    const verdict = forCount > againstCount ? "MOTION APPROVED" : forCount === againstCount ? "DEADLOCKED" : "MOTION REJECTED";

    return new Response(JSON.stringify({ votes: results, verdict }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Vote error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
