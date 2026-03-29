# Wired In

> A live AI-powered debate webapp where C-level executive agents evaluate 
> potential hires — informed by real-time data — and collectively reach a hiring decision.

![Multi-Agent](https://img.shields.io/badge/Multi--Agent-AI-blue)
![Stack](https://img.shields.io/badge/Stack-Lovable%20%2B%20Supabase-green)
![Live Search](https://img.shields.io/badge/Live-Web%20Search-orange)

---

## Overview

Wired In simulates a corporate boardroom deliberation. HR professionals 
submit a hiring scenario — a candidate profile, a role, a department challenge — 
and six AI agents, each embodying a distinct C-level executive, debate the hire 
in sequence. Each agent reads the full conversation history before responding, 
so arguments build on one another naturally. The system pulls live data from the 
web to ground opinions in facts: market salaries, company news, industry trends. 
At the end of the debate, the board reaches a verdict.

---

## The Board

| Agent | Title | Focus |
|-------|-------|-------|
| CEO | Chief Executive Officer | Vision & culture fit |
| CTO | Chief Technology Officer | Technical depth & skills |
| CFO | Chief Financial Officer | Cost, ROI & budget |
| CMO | Chief Marketing Officer | Brand & external impact |
| COO | Chief Operating Officer | Execution & team fit |
| CHRO | Chief HR Officer | People, policy & growth |

---

## How It Works

1. **Submit a scenario** — HR provides a candidate profile, role, and context ( You could also use the default case to test it out)
2. **Live data is pulled** — market salaries, benchmarks, and signals fetched in real time
3. **Agents debate sequentially** — each executive reads the full history before speaking
4. **The board reaches a verdict** — a final recommendation with per-agent reasoning

---

## Key Features

- Sequential agent execution — every agent is context-aware of everything said before it
- Shared persistent conversation history across all six agents per session
- Live web search integration — agents ground opinions in real-time data
- Six distinct executive personas with role-specific reasoning priorities
- Final synthesised verdict with per-agent stance summary

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend & UI | Lovable |
| Database & Auth | Supabase |
| Agent Reasoning | Claude API | Gemini AI |
| Live Data | Web Search |

---

## Who It's For

Built for HR professionals who want a structured, multi-perspective evaluation 
of hiring decisions — surfacing blind spots, stress-testing candidate fit, and 
simulating how different stakeholders would weigh in before a real panel interview.


## Webstie

https://chamber-chiefs.com/
