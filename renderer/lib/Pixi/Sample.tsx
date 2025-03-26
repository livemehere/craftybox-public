import { useEffect, useRef } from 'react';
import Konva from 'konva';

export default function Sample() {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const stage = new Konva.Stage({
      container: containerRef.current,
      width: 800,
      height: 500
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const circle = new Konva.Circle({
      x: 300,
      y: 300,
      radius: 50,
      fill: 'white',
      draggable: true
    });
    layer.add(circle);
  }, []);

  return (
    <div>
      <div ref={containerRef} className='border border-white'></div>
    </div>
  );
}
