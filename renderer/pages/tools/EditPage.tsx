import { Graphics } from 'pixi.js';
import { useAtomValue } from 'jotai';

import PixiProvider from '@/lib/pixi/components/PixiProvider';
import PixiCanvas from '@/lib/pixi/components/PixiCanvas';
import { usePixiTicker } from '@/lib/pixi/hooks/usePixiTicker';
import { usePixiApp } from '@/lib/pixi/hooks/usePixiApp';
import { lnbOpenAtom } from '@/features/LNB/stores/lnbOpenAtom';

const EditPage = () => {
  return (
    <PixiProvider>
      <div className={'h-full w-full'}>
        <Runner />
        <PixiCanvas />
      </div>
    </PixiProvider>
  );
};

export default EditPage;

function Runner() {
  const open = useAtomValue(lnbOpenAtom);
  usePixiApp(
    (app) => {
      app.resize();
      console.log('resize app');
    },
    [open]
  );

  usePixiApp((app) => {
    const g = new Graphics();
    g.rect(0, 0, 100, 100).fill('red');

    app.stage.addChild(g);
    g.position.set(100, 100);
    g.label = 'target';
    console.log('create rect');
    return () => {
      g.destroy();
    };
  });

  usePixiTicker((app) => {
    const g = app.stage.getChildByName('target');
    if (g) {
      g.pivot.set(g.width / 2, g.height / 2);
      g.rotation += 0.01;
    }
  });

  return null;
}
