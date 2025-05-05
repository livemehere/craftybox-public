import {
  Assets,
  Container,
  ContainerChild,
  Graphics,
  Point,
  Sprite,
} from 'pixi.js';
import { useAtomValue } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import { LuMousePointer2 } from 'react-icons/lu';
import { PiHandGrabbing } from 'react-icons/pi';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';
import { BiRectangle } from 'react-icons/bi';
import { useHotkeys } from 'react-hotkeys-hook';
import { useForceUpdate } from '@fewings/react/hooks';

import PixiProvider from '@/lib/pixi/components/PixiProvider';
import PixiCanvas from '@/lib/pixi/components/PixiCanvas';
import { usePixiEffect } from '@/lib/pixi/hooks/usePixiEffect';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';
import { cn } from '@/utils/cn';
import ZoomController from '@/lib/pixi/components/Controller/ZoomController';
import PanController from '@/lib/pixi/components/Controller/PanController';
import { usePixi } from '@/lib/pixi/PixiContext';
import { useToast } from '@/lib/toast/ToastContext';
import Grid from '@/lib/pixi/components/ui/Grid';

const CONTAINER_LABEL = 'edit-container';

const EditPage = () => {
  const open = useAtomValue(lnbOpenAtom);
  const imgUrl = useMemo(() => {
    const targetUrl = localStorage.getItem(
      SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY
    );
    // localStorage.removeItem(SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY);
    return targetUrl || null;
  }, []);

  return (
    <PixiProvider resizeDeps={[open]}>
      <div className={'relative h-full w-full'}>
        <QuickImgEditor imgUrl={imgUrl} />
        <ZoomController />
        <Grid />
        <ObjectTree />
        <PixiCanvas />
        <EditSideBar />
      </div>
    </PixiProvider>
  );
};

export default EditPage;

type EditMode = 'select' | 'move' | 'rect';
function QuickImgEditor({ imgUrl }: { imgUrl: string | null }) {
  const containerRef = useRef<Container | null>(null);
  const imgSpriteRef = useRef<Sprite | null>(null);
  const [mode, setMode] = useState<EditMode>('select');
  const prevMode = useRef(mode);

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

  // drawing control
  usePixiEffect(
    (app) => {
      if (mode === 'move' || mode === 'select') return;

      let isDrawing = false;
      let graphics: Graphics;

      console.log('start mode', mode);
      const handleDown = (e: PointerEvent) => {
        const container = containerRef.current;
        if (!container) return;

        isDrawing = true;
        graphics = new Graphics();

        const bounds = app.canvas.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const localPos = app.stage.toLocal(new Point(x, y));
        graphics.position.set(localPos.x, localPos.y);
        container.addChild(graphics);
        console.log('added', graphics.x, graphics.y);
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
              color: 'red',
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
    [mode]
  );

  usePixiEffect((app) => {
    (async () => {
      if (!imgUrl) return;
      const container = new Container();
      container.label = CONTAINER_LABEL;
      const texture = await Assets.load(imgUrl);
      const sprite = new Sprite(texture);
      imgSpriteRef.current = sprite;

      // add.
      container.addChild(sprite);
      app.stage.addChild(container);

      // set img center
      sprite.position.set(-texture.width / 2, -texture.height / 2);

      // set viewport center
      app.stage.position.set(app.screen.width / 2, app.screen.height / 2);

      containerRef.current = container;
    })();
    return () => {
      containerRef.current?.destroy();
    };
  });

  const btnClassName =
    'hover:bg-app-soft-gray p-8 [&[data-active=true]]:bg-app-primary cursor-pointer rounded';

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
      mode: 'rect',
    },
  ];

  return (
    <div
      className={cn(
        'absolute bottom-80 left-1/2 z-10 -translate-x-1/2',
        'bg-app-gray rounded p-8',
        'flex items-center gap-8'
      )}
    >
      <PanController enable={mode === 'move'} />
      {buttons.map(({ icon, mode: _mode }, index) => (
        <button
          key={index}
          className={cn(btnClassName)}
          data-active={_mode === mode}
          onClick={() => setMode(_mode)}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function EditSideBar() {
  const { app } = usePixi();
  const { pushMessage } = useToast();

  const getDataUrl = async () => {
    if (!app) throw new Error('app is not ready');
    const container = app.stage.getChildByLabel(CONTAINER_LABEL);
    if (!container) throw new Error('container is not found');
    return app.renderer.extract.base64(container);
  };

  const handleCopy = async () => {
    const dataUrl = await getDataUrl();
    const blob = await fetch(dataUrl).then((res) => res.blob());
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    pushMessage('Copied to clipboard', {
      type: 'success',
    });
  };

  const handleDownload = async () => {
    const dataUrl = await getDataUrl();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'screenshot.png';
    link.click();
    link.remove();
  };

  const btnClassName =
    'bg-app-soft-gray rounded px-12 py-6 hover:bg-[#414244] cursor-pointer';

  return (
    <aside
      className={
        'bg-app-gray absolute top-20 right-20 flex w-230 flex-col rounded-lg'
      }
    >
      <section className={'flex items-center justify-end gap-8 p-12'}>
        <div className={'mx-4 h-20 w-2 bg-white/20'}></div>

        <button className={btnClassName} onClick={handleCopy}>
          <TbCopy className={'text-white/80'} />
        </button>
        <button className={btnClassName} onClick={handleDownload}>
          <FiDownload className={'text-white/80'} />
        </button>
      </section>

      {/*<hr className={'border-[0.5px] border-white/10'} />*/}
    </aside>
  );
}

function ObjectTree() {
  const { app } = usePixi();
  const update = useForceUpdate();
  usePixiEffect((app) => {
    const handler = () => {
      update();
    };
    app.stage.on('childAdded', handler);
    app.stage.on('childRemoved', handler);
    return () => {
      app.stage.off('childAdded', handler);
      app.stage.off('childRemoved', handler);
    };
  }, []);

  return (
    <div
      className={
        'bg-app-gray absolute top-8 bottom-8 left-8 w-280 rounded-lg py-12'
      }
    >
      <section className={'px-16 py-8'}>Layer</section>
      {app?.stage.children.map((child) => (
        <PixiObjectTree container={child} key={child.uid} />
      ))}
    </div>
  );
}

function PixiObjectTree({
  container,
  depth = 0,
}: {
  container: Container<ContainerChild>;
  depth?: number;
}) {
  return (
    <div className={'hover:bg-app-soft-gray'}>
      <div
        style={{ paddingLeft: depth * 10 }}
        className={
          'typo-body2 hover:border-app-primary flex h-32 items-center border-y-1 border-transparent'
        }
      >
        <div className={'pl-16'}>{container.label}</div>
      </div>
      <div style={{ paddingLeft: depth * 10 }}>
        {container.children.map((child) => {
          return (
            <PixiObjectTree
              container={child}
              depth={depth + 1}
              key={child.uid}
            />
          );
        })}
      </div>
    </div>
  );
}
