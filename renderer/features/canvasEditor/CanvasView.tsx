import { useCallback, useEffect, useRef } from 'react';
import Konva from 'konva';
import { useSetAtom } from 'jotai';

import { stageAtom } from './store/stageAtom';

/**
 * FIXME: resize 줄어들 때 캔버스 레이어가 줄어들지 않음
 */

export default function CanvasView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const setStage = useSetAtom(stageAtom);

  const init = useCallback(
    (el: HTMLDivElement) => {
      const rect = el.getBoundingClientRect();
      const stage = new Konva.Stage({
        container: el,
        width: rect.width,
        height: rect.height
      });

      const layer = new Konva.Layer();
      layer.addName('root-layer');
      stage.add(layer);

      setStage(stage);
      return stage;
    },
    [setStage]
  );

  const resize = useCallback((el: HTMLDivElement, stage: Konva.Stage) => {
    const rect = el.getBoundingClientRect();
    stage.width(rect.width);
    stage.height(rect.height);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const stage = init(el);
    resize(el, stage);
    const handleResize = () => resize(el, stage);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [init, resize]);

  return <div ref={containerRef} className='h-full w-full border border-white'></div>;
}
