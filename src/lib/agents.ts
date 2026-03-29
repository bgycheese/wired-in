export type AgentRole = 'CEO' | 'CTO' | 'CFO' | 'COO' | 'CHRO' | 'CSO';

export interface Agent {
  role: AgentRole;
  name: string;
  focus: string;
  kpi: string;
  color: string;
  model: string;
  provider: 'Anthropic' | 'Google';
}

export const AGENTS: Record<AgentRole, Agent> = {
  CEO: {
    role: 'CEO',
    name: 'O. Zipse',
    focus: 'Strategy & Vision',
    kpi: 'Brand Value / Technology Neutrality',
    color: 'text-gold',
    model: 'claude-sonnet-4',
    provider: 'Anthropic',
  },
  CTO: {
    role: 'CTO',
    name: 'F. Weber',
    focus: 'R&D / Technology',
    kpi: 'Neue Klasse Architecture / Software Stack',
    color: 'text-bmw-blue',
    model: 'gemini-2.5-pro',
    provider: 'Google',
  },
  CFO: {
    role: 'CFO',
    name: 'W. Mertl',
    focus: 'Capital & Risk',
    kpi: 'EBIT 8-10% / CapEx Efficiency',
    color: 'text-terminal-green',
    model: 'claude-opus-4',
    provider: 'Anthropic',
  },
  COO: {
    role: 'COO',
    name: 'M. Nedeljković',
    focus: 'Production & Supply',
    kpi: 'iFactory Flex / Energy Costs',
    color: 'text-terminal-amber',
    model: 'gemini-3.1-pro',
    provider: 'Google',
  },
  CHRO: {
    role: 'CHRO',
    name: 'I. Horstmeier',
    focus: 'Culture & People',
    kpi: 'EV Skill Gap / BMW Way',
    color: 'text-purple-400',
    model: 'claude-haiku-4.5',
    provider: 'Anthropic',
  },
  CSO: {
    role: 'CSO',
    name: 'J. Goller',
    focus: 'Sales & Markets',
    kpi: 'China Volatility / Premium Pricing',
    color: 'text-cyan-400',
    model: 'gemini-3-flash',
    provider: 'Google',
  },
};

export const AGENT_ORDER: AgentRole[] = ['CEO', 'CTO', 'CFO', 'COO', 'CHRO', 'CSO'];

export interface ChamberMessage {
  id: string;
  role: AgentRole;
  content: string;
  source: 'Ledger' | 'Live: News' | 'Analysis';
  timestamp: Date;
  dissent?: boolean;
  model?: string;
}

export interface AgentVote {
  role: AgentRole;
  stance: string;
  confidence: number;
  position: 'FOR' | 'AGAINST' | 'CONDITIONAL';
}

export interface ConsensusData {
  role: AgentRole;
  alignment: Record<AgentRole, number>; // -1 to 1
}

// Mock debate data
export const MOCK_SCENARIO = "Should BMW accelerate full EV transition by 2028, abandoning ICE development 2 years ahead of EU mandate?";

export const MOCK_MESSAGES: ChamberMessage[] = [
  {
    id: '1',
    role: 'CEO',
    content: 'Technology neutrality remains our strategic moat. Premature ICE exit forfeits €14.2B in combustion revenue while competitors hedge. The i3 taught us: first-mover penalty is real.',
    source: 'Ledger',
    timestamp: new Date(),
  },
  {
    id: '2',
    role: 'CTO',
    content: 'Neue Klasse platform is 18 months from production readiness. Solid-state cells from Samsung SDI show 380Wh/kg at lab scale. Parallel ICE R&D splits our 6,200-engineer workforce.',
    source: 'Ledger',
    timestamp: new Date(),
    dissent: true,
  },
  {
    id: '3',
    role: 'CFO',
    content: 'EBIT margin risk is severe. Full pivot drops us to 6.2% through 2027—below our 8% floor. Tesla\'s margin compression to 8.1% proves scale alone doesn\'t protect profitability.',
    source: 'Live: News',
    timestamp: new Date(),
    dissent: true,
  },
  {
    id: '4',
    role: 'COO',
    content: 'Munich and Dingolfing lines need €2.8B retooling. iFactory modular cells can run dual powertrain—but not if we hard-commit. Lead time: 22 months minimum.',
    source: 'Ledger',
    timestamp: new Date(),
  },
  {
    id: '5',
    role: 'CHRO',
    content: 'We face 12,400 retraining positions. IG Metall agreement caps involuntary transitions at 800/year. Accelerating creates a labor relations crisis we cannot afford.',
    source: 'Ledger',
    timestamp: new Date(),
    dissent: true,
  },
  {
    id: '6',
    role: 'CSO',
    content: 'China BEV penetration hit 38% Q3. Our iX3 outsells i4 3:1 there. But Li Auto and NIO are compressing our premium pricing power by 11% YoY. Delay is equally dangerous.',
    source: 'Live: News',
    timestamp: new Date(),
  },
];

export const MOCK_NEWS = [
  'DAX:BMW 96.42 ▲ +1.2%',
  'EU confirms 2035 ICE ban review clause — Reuters',
  'CATL unveils 500Wh/kg condensed battery — Bloomberg',
  'VW cuts Wolfsburg shifts amid EV demand slowdown — FT',
  'BMW i5 wins Euro NCAP 5-star — ADAC',
  'China NEV sales +32% YoY October — CPCA',
  'Mercedes delays EQ platform to 2028 — Handelsblatt',
  'Solid-state battery costs drop 18% — McKinsey',
  'BMW Group Q3 EBIT margin 9.8% — IR Release',
  'US EV tax credits face 2025 revision — WSJ',
];

export const MOCK_CONSENSUS: ConsensusData[] = AGENT_ORDER.map(role => ({
  role,
  alignment: {
    CEO: role === 'CEO' ? 1 : role === 'CSO' ? 0.3 : role === 'CTO' ? -0.4 : role === 'CFO' ? 0.6 : role === 'COO' ? 0.5 : -0.2,
    CTO: role === 'CTO' ? 1 : role === 'CEO' ? -0.4 : role === 'COO' ? 0.3 : role === 'CFO' ? -0.6 : role === 'CHRO' ? -0.3 : 0.2,
    CFO: role === 'CFO' ? 1 : role === 'CEO' ? 0.6 : role === 'CTO' ? -0.6 : role === 'COO' ? 0.4 : role === 'CHRO' ? 0.5 : -0.1,
    COO: role === 'COO' ? 1 : role === 'CEO' ? 0.5 : role === 'CTO' ? 0.3 : role === 'CFO' ? 0.4 : role === 'CHRO' ? 0.6 : 0.1,
    CHRO: role === 'CHRO' ? 1 : role === 'CEO' ? -0.2 : role === 'CTO' ? -0.3 : role === 'CFO' ? 0.5 : role === 'COO' ? 0.6 : 0.0,
    CSO: role === 'CSO' ? 1 : role === 'CEO' ? 0.3 : role === 'CTO' ? 0.2 : role === 'CFO' ? -0.1 : role === 'COO' ? 0.1 : 0.0,
  },
}));

export const MOCK_VOTES: AgentVote[] = [
  { role: 'CEO', stance: 'Maintain technology neutrality—accelerate Neue Klasse but preserve ICE optionality through 2030.', confidence: 82, position: 'AGAINST' },
  { role: 'CTO', stance: 'Full commitment enables engineering focus—split resources produce mediocre outcomes on both tracks.', confidence: 71, position: 'FOR' },
  { role: 'CFO', stance: 'Unacceptable margin erosion without €4B cost offset plan—conditional on CapEx phasing restructure.', confidence: 88, position: 'CONDITIONAL' },
  { role: 'COO', stance: 'iFactory flexibility is our insurance—hard pivot eliminates the optionality we invested €1.2B to build.', confidence: 76, position: 'AGAINST' },
  { role: 'CHRO', stance: 'Workforce transition velocity exceeds IG Metall parameters—12-month delay for labor framework alignment.', confidence: 91, position: 'AGAINST' },
  { role: 'CSO', stance: 'China market dynamics demand faster EV cadence—but global portfolio must hedge regional volatility.', confidence: 64, position: 'CONDITIONAL' },
];
