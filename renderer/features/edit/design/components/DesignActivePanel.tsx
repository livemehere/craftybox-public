import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { useForceUpdate } from '@fewings/react/hooks';
import { Graphics } from 'pixi.js';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';

import { cn } from '@/utils/cn';
import {
  exportContainerAtom,
  selectedObjAtom,
} from '@/features/edit/design/stores';
import { useToast } from '@/lib/toast/ToastContext';
import { usePixi } from '@/lib/pixi-core/PixiContext';
import { PIXI_CUSTOM_EVENTS } from '@/lib/pixi-core/pixi-custom-events';

const DesignActivePanel = () => {
  const { app } = usePixi();
  const { pushMessage } = useToast();
  const editingContainer = useAtomValue(exportContainerAtom);
  const selectedObj = useAtomValue(selectedObjAtom);
  const [originalObjInfo, setOriginalObjInfo] = useState({
    width: 0,
    height: 0,
  });
  const [updateSeq, setUpdateSeq] = useState(0);
  const update = useForceUpdate();

  // useOnEvent('selected-object-change',()=> update());

  // save original object properties for mutate `Graphics` object in each input
  useEffect(() => {
    if (!selectedObj) return;
    if (selectedObj instanceof Graphics) {
      setOriginalObjInfo({
        width: selectedObj.width,
        height: selectedObj.height,
      });
    }

    const handler = () => {
      setUpdateSeq((prev) => prev + 1);
    };
    selectedObj.on(PIXI_CUSTOM_EVENTS.CONTAINER_UPDATE, handler);
    return () => {
      selectedObj.off(PIXI_CUSTOM_EVENTS.CONTAINER_UPDATE, handler);
    };
  }, [selectedObj]);

  const getDataUrl = async () => {
    if (!app) throw new Error('app is not ready');
    if (!editingContainer) throw new Error('container is not found');
    return app.renderer.extract.base64(editingContainer);
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

  const hrClassName = 'border-[0.5px] border-white/10';

  const inputClassName = cn(
    'flex items-center gap-6',
    'bg-app-soft-gray rounded px-12 py-6 w-full',
    '[&:has(input:focus)]:outline-1 outline-app-primary'
  );

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

      <hr className={hrClassName} />

      {selectedObj && (
        <section
          className={'typo-body2'}
          key={`${selectedObj.uid}-${updateSeq}`}
        >
          <h3 className={'p-16'}>{selectedObj.label}</h3>
          <hr className={hrClassName} />
          <div className={'p-16'}>Position</div>
          <div
            className={'flex items-center justify-between gap-4 px-16 pb-16'}
          >
            <label className={inputClassName}>
              <span className={'text-white/50'}>X</span>
              <input
                className={'w-full'}
                type="number"
                defaultValue={selectedObj.x.toFixed(2)}
                onChange={(e) => {
                  selectedObj.x = Number(e.target.value);
                }}
              />
            </label>

            <label className={inputClassName}>
              <span className={'text-white/50'}>Y</span>
              <input
                className={'w-full'}
                type="number"
                defaultValue={selectedObj.y.toFixed(2)}
                onChange={(e) => {
                  selectedObj.y = Number(e.target.value);
                }}
              />
            </label>
          </div>

          <hr className={hrClassName} />
          <div className={'p-16'}>Layout</div>
          <div
            className={'flex items-center justify-between gap-4 px-16 pb-16'}
          >
            <label className={inputClassName}>
              <span className={'text-white/50'}>W</span>
              <input
                className={'w-full'}
                type="number"
                defaultValue={selectedObj.width.toFixed(2)}
                onChange={(e) => {
                  selectedObj.width = Number(e.target.value);
                }}
              />
            </label>

            <label className={inputClassName}>
              <span className={'text-white/50'}>H</span>
              <input
                className={'w-full'}
                type="number"
                defaultValue={selectedObj.height.toFixed(2)}
                onChange={(e) => {
                  selectedObj.height = Number(e.target.value);
                }}
              />
            </label>
          </div>

          {selectedObj instanceof Graphics && (
            <>
              <hr className={hrClassName} />
              <h3 className={'p-16'}>Stroke</h3>
              <div className={'flex flex-col items-center gap-8 px-16 pb-16'}>
                <label className={cn(inputClassName, 'px-4 py-2')}>
                  <input
                    className={'w-24'}
                    type="color"
                    defaultValue={`#${selectedObj.strokeStyle.color.toString(16)}`}
                    onChange={(e) => {
                      const color = e.target.value;
                      const { width } = selectedObj.strokeStyle;
                      selectedObj
                        .clear()
                        .rect(
                          0,
                          0,
                          originalObjInfo.width,
                          originalObjInfo.height
                        )
                        .stroke({
                          width,
                          color,
                        });
                      update();
                    }}
                  />
                  <span>{`#${selectedObj.strokeStyle.color.toString(16)}`}</span>
                </label>
                <label className={inputClassName}>
                  <span className={'text-white/50'}>W</span>
                  <input
                    className={'w-full'}
                    type="number"
                    defaultValue={selectedObj.strokeStyle.width}
                    onChange={(e) => {
                      const width = Number(e.target.value);
                      const color = selectedObj.strokeStyle.color;
                      selectedObj
                        .clear()
                        .rect(
                          0,
                          0,
                          originalObjInfo.width,
                          originalObjInfo.height
                        )
                        .stroke({
                          width,
                          color,
                          alignment: 1,
                        });
                      update();
                    }}
                  />
                </label>
              </div>
            </>
          )}
        </section>
      )}
    </aside>
  );
};

export default DesignActivePanel;
