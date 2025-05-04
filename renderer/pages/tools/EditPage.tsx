import { Assets, Container, Graphics, Point, Sprite } from 'pixi.js';
import { useAtomValue } from 'jotai';
import { useMemo, useRef, useState } from 'react';
import { LuMousePointer2 } from 'react-icons/lu';
import { PiHandGrabbing } from 'react-icons/pi';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';
import { BiRectangle } from 'react-icons/bi';

import PixiProvider from '@/lib/pixi/components/PixiProvider';
import PixiCanvas from '@/lib/pixi/components/PixiCanvas';
import { usePixiApp } from '@/lib/pixi/hooks/usePixiApp';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';
import { cn } from '@/utils/cn';
import ZoomController from '@/lib/pixi/components/Controller/ZoomController';
import PanController from '@/lib/pixi/components/Controller/PanController';
import { usePixi } from '@/lib/pixi/PixiContext';
import { useToast } from '@/lib/toast/ToastContext';

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
  const [mode, setMode] = useState<EditMode>('rect');

  // drawing control
  usePixiApp(
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

  usePixiApp((app) => {
    const g = new Graphics();
    g.alpha = 0.2;
    app.stage.addChild(g);

    // center point (0,0)
    const centerPoint = new Graphics();
    centerPoint.pivot.set(2.5, 2.5);
    centerPoint.rect(0, 0, 5, 5).fill('red');
    app.stage.addChild(centerPoint);

    const centerLine = new Graphics();
    centerLine.alpha = 0.5;
    app.stage.addChild(centerLine);

    const update = () => {
      g.clear();
      centerLine.clear();

      const gridSize = Math.pow(
        2,
        Math.round(Math.log2(100 / app.stage.scale.x))
      );
      const viewWidth = app.screen.width / app.stage.scale.x;
      const viewHeight = app.screen.height / app.stage.scale.y;

      const offsetX = -app.stage.position.x / app.stage.scale.x;
      const offsetY = -app.stage.position.y / app.stage.scale.y;

      const startX = Math.floor(offsetX / gridSize) * gridSize;
      const startY = Math.floor(offsetY / gridSize) * gridSize;
      const endX = offsetX + viewWidth;
      const endY = offsetY + viewHeight;

      for (let x = startX; x <= endX; x += gridSize) {
        g.moveTo(x, offsetY);
        g.lineTo(x, endY);
      }

      for (let y = startY; y <= endY; y += gridSize) {
        g.moveTo(offsetX, y);
        g.lineTo(endX, y);
      }

      g.stroke({
        pixelLine: true,
        width: 1,
        color: '#fff',
      });

      // center line
      centerLine.moveTo(0, offsetY);
      centerLine.lineTo(0, endY);
      centerLine.moveTo(offsetX, 0);
      centerLine.lineTo(endX, 0);

      centerLine.stroke({
        pixelLine: true,
        width: 1,
        color: '#fff',
      });

      centerPoint.scale.set(1 / app.stage.scale.x);
    };

    const ticker = app.ticker.add(update);

    return () => {
      ticker.destroy();
      g.destroy();
    };
  });

  usePixiApp((app) => {
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
