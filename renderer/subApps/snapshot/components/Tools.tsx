import { RiRectangleLine } from 'react-icons/ri';
import { GoArrowUpRight } from 'react-icons/go';
import { AiOutlineMinus } from 'react-icons/ai';
import { FaRegCircle } from 'react-icons/fa';
import { AiOutlineDash } from 'react-icons/ai';
import { MdOutlineFormatColorText } from 'react-icons/md';
import { LuMousePointer2 } from 'react-icons/lu';
import { MdOutlineRefresh } from 'react-icons/md';
import { TbCircleNumber0 } from 'react-icons/tb';
import { TiPinOutline } from 'react-icons/ti';
import { useHotkeys } from 'react-hotkeys-hook';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import ColorPicker, { TColorPickerRef } from '@/components/Form/ColorPicker';

const items = [
  {
    IconComp: LuMousePointer2,
    key: 'select',
  },
  {
    IconComp: RiRectangleLine,
    key: 'rect',
  },
  {
    IconComp: GoArrowUpRight,
    key: 'arrow',
  },
  {
    IconComp: MdOutlineFormatColorText,
    key: 'text',
  },
  {
    IconComp: AiOutlineMinus,
    key: 'line',
  },
  {
    IconComp: FaRegCircle,
    key: 'ellipse',
  },
  {
    IconComp: TbCircleNumber0,
    key: 'label',
  },
] as const;

const toggleOptions = [
  {
    IconComp: AiOutlineDash,
    key: 'dash',
  },
] as const;

export type TToggleKey = (typeof toggleOptions)[number]['key'];
export type TToolKey = (typeof items)[number]['key'];

type Props = {
  activeKey: TToolKey | null;
  setActiveKey: (key: TToolKey) => void;

  activeToggleKeys: TToggleKey[];
  setActiveToggleKeys: (keys: TToggleKey[]) => void;

  color: string;
  setColor: (color: string) => void;

  strokeWidth: number;
  setStrokeWidth: Dispatch<SetStateAction<number>>;

  resetChildren: () => void;

  createPin: () => void;
};

const Tools = ({
  activeKey,
  setActiveKey,
  activeToggleKeys,
  setActiveToggleKeys,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  resetChildren,
  createPin,
}: Props) => {
  const colorPickerRef = useRef<TColorPickerRef>({} as TColorPickerRef);
  const [strokeInput, setStrokeInput] = useState<HTMLInputElement | null>(null);
  const toggleKey = (key: TToggleKey) => {
    setActiveToggleKeys(
      activeToggleKeys.includes(key)
        ? activeToggleKeys.filter((k) => k !== key)
        : [...activeToggleKeys, key]
    );
  };

  useHotkeys('1', () => toggleKey('dash'));

  useHotkeys('q', () => setActiveKey('select'));
  useHotkeys('w', () => setActiveKey('rect'));
  useHotkeys('e', () => setActiveKey('arrow'));
  useHotkeys('r', () => setActiveKey('text'));
  useHotkeys('t', () => setActiveKey('line'));
  useHotkeys('y', () => setActiveKey('ellipse'));
  useHotkeys('u', () => setActiveKey('label'));

  useHotkeys('a', () => colorPickerRef.current.focus());
  useHotkeys('s', () => strokeInput?.focus());
  useHotkeys('d', resetChildren);

  useEffect(() => {
    if (!strokeInput) return;

    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== strokeInput) return;
      const isUp = e.deltaY < 0;
      const diff = isUp ? 1 : -1;
      setStrokeWidth((prev) => Math.max(1, prev + diff));
    };

    window.addEventListener('wheel', onWheel);
    return () => {
      window.removeEventListener('wheel', onWheel);
    };
  }, [strokeInput]);

  return (
    <div
      className={
        'mt-2 flex flex-col justify-center gap-1.5 rounded bg-neutral-800 p-1.5 text-white select-none'
      }
    >
      <section className={'flex items-center gap-1.5'}>
        {toggleOptions.map((item) => (
          <button
            className={'icon-tab-button'}
            data-active={activeToggleKeys.includes(item.key)}
            key={item.key}
            onClick={() => toggleKey(item.key)}
          >
            <item.IconComp />
          </button>
        ))}
      </section>
      <div className={'mb-2 h-[1px] w-full bg-white/20'} />
      <section className={'flex items-center gap-1.5'}>
        {items.map((item) => (
          <button
            key={item.key}
            className={'icon-tab-button'}
            data-active={item.key === activeKey}
            onClick={() => setActiveKey(item.key)}
          >
            <item.IconComp />
          </button>
        ))}
      </section>
      <section className={'flex items-center gap-1.5'}>
        <button className={'icon-tab-button'}>
          <ColorPicker value={color} onChange={setColor} ref={colorPickerRef}>
            <div
              className={'h-6 w-6 rounded-full'}
              style={{ backgroundColor: color }}
            ></div>
          </ColorPicker>
        </button>
        <button className={'icon-tab-button h-[32px] w-[72px] px-2'}>
          <input
            ref={setStrokeInput}
            type="number"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className={
              'h-full w-full rounded-md bg-none text-center text-white'
            }
            onKeyDown={(e) => {
              if (
                e.key !== 'Backspace' &&
                isNaN(Number(e.key)) &&
                !e.key.includes('Arrow')
              ) {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
          />
        </button>
        <button className={'icon-tab-button'} onClick={resetChildren}>
          <MdOutlineRefresh />
        </button>
        <button className={'icon-tab-button'} onClick={createPin}>
          <TiPinOutline />
        </button>
      </section>
    </div>
  );
};

export default Tools;
