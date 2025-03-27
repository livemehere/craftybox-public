import { LuMousePointer2 } from 'react-icons/lu';
import { PiRectangleLight } from 'react-icons/pi';
import { PiCircleLight } from 'react-icons/pi';
import { PiArrowRightLight } from 'react-icons/pi';
import { PiLinkLight } from 'react-icons/pi';
import { useAtom } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';

import { selectedCanvasToolAtom } from '../store/selectedCanvasToolAtom';

import { cn } from '@/utils/cn';

/**
 * Available canvas tools configuration
 */
const tools = {
  pointer: {
    id: 'pointer',
    icon: LuMousePointer2
  },
  rectangle: {
    id: 'rectangle',
    icon: PiRectangleLight
  },
  ellipse: {
    id: 'ellipse',
    icon: PiCircleLight
  },
  arrow: {
    id: 'arrow',
    icon: PiArrowRightLight
  },
  line: {
    id: 'line',
    icon: PiLinkLight
  }
} as const;

export type TCanvasTool = keyof typeof tools;

export default function CanvasToolBar() {
  const [selectedTool, setSelectedTool] = useAtom(selectedCanvasToolAtom);

  useHotkeys('v', () => setSelectedTool('pointer'));
  useHotkeys('r', () => setSelectedTool('rectangle'));
  useHotkeys('e', () => setSelectedTool('ellipse'));
  useHotkeys('a', () => setSelectedTool('arrow'));
  useHotkeys('l', () => setSelectedTool('line'));

  return (
    <div className='absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2'>
      <div className='flex items-center justify-center gap-2 rounded bg-neutral-700 p-2'>
        {Object.entries(tools).map(([key, tool]) => (
          <button
            key={key}
            className={cn('flex items-center justify-center rounded p-2', selectedTool === key && 'bg-blue-500')}
            onClick={() => setSelectedTool(tool.id)}
          >
            <tool.icon />
          </button>
        ))}
      </div>
    </div>
  );
}
