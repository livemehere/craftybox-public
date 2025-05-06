import { useAtom, useSetAtom } from 'jotai';
import { Container, Graphics, Point } from 'pixi.js';
import { LuMousePointer2 } from 'react-icons/lu';
import { PiHandGrabbing } from 'react-icons/pi';
import { BiRectangle } from 'react-icons/bi';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRef } from 'react';

import {
  modeAtom,
  selectedContainerAtom,
  EditMode,
  hoverContainerAtom,
} from '@/features/edit/design/stores';
import { usePixiEffect } from '@/lib/pixi-core/hooks/usePixiEffect';
import { cn } from '@/utils/cn';
import { setDraggable } from '@/lib/pixi-core/utils/drag';
import { onHover } from '@/lib/pixi-core/utils/hover';

const buttons: { icon: React.ReactNode; mode: EditMode }[] = [
  {
    icon: <LuMousePointer2 className={'h-20 w-20'} />,
    mode: 'select',
  },
  {
    icon: <PiHandGrabbing className={'h-20 w-20 -translate-y-1'} />,
    mode: 'move',
  },
  {
    icon: <BiRectangle className={'h-20 w-20'} />,
    mode: 'draw-rect',
  },
];

interface Props {
  rootContainer: Container | null;
}

const InteractionController = ({ rootContainer }: Props) => {
  const [selectedContainer, setSelectedContainer] = useAtom(
    selectedContainerAtom
  );
  const setHoverContainer = useSetAtom(hoverContainerAtom);

  const [mode, setMode] = useAtom(modeAtom);
  const prevModeBeforeMove = useRef<EditMode | undefined>(undefined);

  /** toggle move mode while pressing space */
  useHotkeys('space', () => {
    if (mode === 'move') return;
    prevModeBeforeMove.current = mode;
    setMode('move');
  });
  useHotkeys(
    'space',
    () => {
      if (prevModeBeforeMove.current) {
        setMode(prevModeBeforeMove.current);
        prevModeBeforeMove.current = undefined;
      }
    },
    {
      keyup: true,
      keydown: false,
    }
  );
  useHotkeys('v', () => setMode('select'));
  useHotkeys('h', () => setMode('move'));
  /** drawing */
  useHotkeys('r', () => setMode('draw-rect'));

  /** drag and drop */
  usePixiEffect(
    (app) => {
      if (!selectedContainer || mode !== 'select') return;
      const clear = setDraggable(app, selectedContainer);
      return () => {
        clear();
      };
    },
    [selectedContainer, mode]
  );

  /** create shapes */
  usePixiEffect(
    (app) => {
      if (!mode.startsWith('draw-')) return;
      if (!rootContainer) return;

      let isDrawing = false;
      let graphics: Graphics;

      console.log('start mode', mode);
      const handleDown = (e: PointerEvent) => {
        isDrawing = true;
        graphics = new Graphics();

        onHover(
          graphics,
          (e) => {
            setHoverContainer(e.currentTarget);
          },
          () => {
            setHoverContainer(null);
          }
        );

        graphics.on('mousedown', (e) => {
          setSelectedContainer(e.currentTarget);
        });

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        graphics.position.set(localPos.x, localPos.y);
        rootContainer.addChild(graphics);
        console.log('added graphics', graphics.x, graphics.y);
      };

      const handleMove = (e: PointerEvent) => {
        if (!isDrawing) return;

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        const dx = localPos.x - graphics.x;
        const dy = localPos.y - graphics.y;

        switch (mode) {
          case 'draw-rect':
            graphics.clear();
            graphics.rect(0, 0, dx, dy).stroke({
              width: 4,
              color: '#ff0000',
              alignment: 1,
            });

            break;
          default:
            throw new Error('invalid drawing mode: ' + mode);
        }
      };

      const handleUp = () => {
        isDrawing = false;
      };

      app.canvas.addEventListener('pointerdown', handleDown);
      app.canvas.addEventListener('pointermove', handleMove);
      app.canvas.addEventListener('pointerup', handleUp);

      return () => {
        app.canvas.removeEventListener('pointerdown', handleDown);
        app.canvas.removeEventListener('pointermove', handleMove);
        app.canvas.removeEventListener('pointerup', handleUp);
      };
    },
    [mode, rootContainer]
  );

  return (
    <div
      className={cn(
        'absolute bottom-80 left-1/2 z-10 -translate-x-1/2',
        'bg-app-gray rounded p-8',
        'flex items-center gap-8'
      )}
    >
      {buttons.map(({ icon, mode: _mode }, index) => (
        <button
          key={index}
          className={
            'hover:bg-app-soft-gray [&[data-active=true]]:bg-app-primary cursor-pointer rounded p-8'
          }
          data-active={_mode === mode}
          onClick={() => setMode(_mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default InteractionController;
