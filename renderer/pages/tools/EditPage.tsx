import { Assets, Container, Graphics, Point, Sprite } from 'pixi.js';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import PixiProvider from '@/lib/pixi-design-editor/components/PixiProvider';
import PixiCanvas from '@/lib/pixi-design-editor/components/PixiCanvas';
import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';
import ZoomController from '@/lib/pixi-design-editor/components/Controller/ZoomController';
import PanController from '@/lib/pixi-design-editor/components/Controller/PanController';
import Grid from '@/lib/pixi-design-editor/components/ui/Grid';
import TreeView from '@/lib/pixi-design-editor/components/TreeView/TreeView';
import { exportContainerAtom, modeAtom } from '@/lib/pixi-design-editor/stores';
import DetailController from '@/lib/pixi-design-editor/components/Controller/DetailController';
import PixiExecutor from '@/lib/pixi-design-editor/components/PixiExecutor';
import HandToolsController from '@/lib/pixi-design-editor/components/Controller/HandToolsController';

const EditPage = () => {
  const open = useAtomValue(lnbOpenAtom);
  const setEditingContainer = useSetAtom(exportContainerAtom);

  const [mode, setMode] = useAtom(modeAtom);
  const prevMode = useRef(mode);

  const imgUrl = useMemo(() => {
    const targetUrl = localStorage.getItem(
      SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY
    );
    // localStorage.removeItem(SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY);
    return targetUrl || null;
  }, []);

  // movable while space bar is pressed
  useHotkeys('space', () => {
    if (mode === 'move') return;
    prevMode.current = mode;
    setMode('move');
    console.log('prevmode is ', prevMode.current);
  });
  useHotkeys(
    'space',
    () => {
      setMode(prevMode.current);
      console.log('restore mode to ', prevMode.current);
    },
    {
      keyup: true,
      keydown: false,
    }
  );

  useHotkeys('v', () => setMode('select'));
  useHotkeys('h', () => setMode('move'));
  /* drawing */
  useHotkeys('r', () => setMode('rect'));

  return (
    <PixiProvider resizeDeps={[open]}>
      <div className={'relative h-full w-full'}>
        <QuickImgEditor />
        <ZoomController />
        <PanController enable={mode === 'move'} />
        <Grid />
        <TreeView />
        <PixiCanvas />
        <HandToolsController />
        <DetailController />
        <PixiExecutor
          cb={(app) => {
            let editingContainer: Container | null = null;
            (async () => {
              if (!imgUrl) return;
              const container = new Container();
              container.label = 'Export';
              const texture = await Assets.load(imgUrl);
              const sprite = new Sprite(texture);

              // add.
              container.addChild(sprite);
              app.stage.addChild(container);

              // set img center
              sprite.position.set(-texture.width / 2, -texture.height / 2);

              // set viewport center
              app.stage.position.set(
                app.screen.width / 2,
                app.screen.height / 2
              );

              setEditingContainer(container);
              editingContainer = container;
            })();
            return () => {
              editingContainer?.destroy();
            };
          }}
          deps={[]}
        />
      </div>
    </PixiProvider>
  );
};

export default EditPage;

function QuickImgEditor() {
  const editingContainer = useAtomValue(exportContainerAtom);
  const [mode, setMode] = useAtom(modeAtom);

  // drawing control
  usePixiEffect(
    (app) => {
      if (mode === 'move' || mode === 'select') return;
      if (!editingContainer) return;

      let isDrawing = false;
      let graphics: Graphics;

      console.log('start mode', mode);
      const handleDown = (e: PointerEvent) => {
        isDrawing = true;
        graphics = new Graphics();

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        graphics.position.set(localPos.x, localPos.y);
        editingContainer.addChild(graphics);
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
          case 'rect':
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
    [mode, editingContainer]
  );

  return null;
}
