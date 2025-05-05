import { Application } from 'pixi.js';
import { useCallbackRef } from '@fewings/react/hooks';

import { usePixiEffect } from '@/lib/pixi-design-editor/hooks/usePixiEffect';

const PixiExecutor = ({
  cb,
  deps,
}: {
  cb: (app: Application) => (() => void) | void;
  deps: any[];
}) => {
  const _cb = useCallbackRef(cb);
  usePixiEffect(_cb, deps);
  return null;
};

export default PixiExecutor;
