import { cn } from '@/utils/cn';

interface Props {
  tabs: { key: string; label: string }[];
  activeTab: string;
  setActiveTab: (key: string) => void;
}

export default function Tabs({ tabs, activeTab, setActiveTab }: Props) {
  return (
    <div className="bg-app-gray flex items-center justify-center gap-2 rounded p-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={cn(
            'hover:bg-app-black cursor-pointer rounded px-18 py-4 text-xs',
            {
              'bg-app-black': activeTab === tab.key,
            }
          )}
          onClick={() => setActiveTab(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
