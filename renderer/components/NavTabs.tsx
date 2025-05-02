import { cn } from '@/utils/cn';

export default function NavTabs({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className={'border-app-soft-gray flex items-center border-b'}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={cn(
            'typo-body2 rounded-b-2 hover:bg-app-gray cursor-pointer rounded-t border-b-2 border-transparent px-12 py-8 uppercase',
            {
              'border-white': activeKey === tab.key,
            }
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
