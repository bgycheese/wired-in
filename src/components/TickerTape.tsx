import { MOCK_NEWS } from '@/lib/agents';

const TickerTape = () => {
  const doubled = [...MOCK_NEWS, ...MOCK_NEWS];

  return (
    <div className="h-8 bg-surface-1 border-b border-border overflow-hidden relative">
      <div className="absolute inset-0 flex items-center">
        <div className="animate-ticker flex whitespace-nowrap">
          {doubled.map((item, i) => (
            <span key={i} className="font-mono text-sm px-6">
              <span className={
                item.includes('▲') ? 'text-terminal-green' :
                item.includes('▼') ? 'text-terminal-red' :
                'text-muted-foreground'
              }>
                {item}
              </span>
              <span className="text-border mx-4">│</span>
            </span>
          ))}
        </div>
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface-1 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-1 to-transparent z-10" />
    </div>
  );
};

export default TickerTape;
