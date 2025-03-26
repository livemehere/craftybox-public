import CanvasView from '@/features/canvasEditor/CanvasView';
import CanvasToolBar from '@/features/canvasEditor/components/CanvasToolBar';

export default function CanvasEditor() {
  return (
    <div className='relative h-full w-full overflow-hidden'>
      <CanvasView />
      <CanvasToolBar />
    </div>
  );
}
