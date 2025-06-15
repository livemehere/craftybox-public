import { useEffect, useState } from 'react';
import { useForceUpdate } from '@fewings/react/hooks';
import { Container, Graphics } from 'pixi.js';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';
import { addToast } from '@heroui/toast';

import { cn } from '@/utils/cn';
import { usePixi } from '@/lib/pixi-core/PixiContext';
import { PIXI_CUSTOM_EVENTS } from '@/lib/pixi-core/pixi-custom-constants';

interface Props {
  target: Container | null;
  rootContainer: Container | null;
}

const MutatePanel = ({ rootContainer, target }: Props) => {
  const { app } = usePixi();
  const [savedInfoBeforeMutation, setSavedInfoBeforeMutation] = useState({
    width: 0,
    height: 0,
  });
  const [updateSeq, setUpdateSeq] = useState(0);
  const update = useForceUpdate();

  useEffect(() => {
    if (!target) return;

    /** If it is a Graphics object, caching is necessary because the size may change when the stroke changes */
    if (target instanceof Graphics) {
      setSavedInfoBeforeMutation({
        width: target.width,
        height: target.height,
      });
    }

    const handler = () => {
      setUpdateSeq((prev) => prev + 1);
    };
    target.on(PIXI_CUSTOM_EVENTS.CONTAINER_UPDATE, handler);

    return () => {
      target.off(PIXI_CUSTOM_EVENTS.CONTAINER_UPDATE, handler);
    };
  }, [target]);

  const handleCopy = async (container: Container) => {
    const dataUrl = await app!.renderer.extract.base64(container);
    const blob = await fetch(dataUrl).then((res) => res.blob());
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    addToast({
      title: 'Copied to clipboard',
      description: 'Screenshot has been copied to clipboard.',
      color: 'success',
    });
  };

  const handleDownload = async (container: Container) => {
    const dataUrl = await app!.renderer.extract.base64(container);
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

        <button
          className={btnClassName}
          onClick={() => handleCopy(rootContainer!)}
        >
          <TbCopy className={'text-white/80'} />
        </button>
        <button
          className={btnClassName}
          onClick={() => handleDownload(rootContainer!)}
        >
          <FiDownload className={'text-white/80'} />
        </button>
      </section>

      <hr className={hrClassName} />

      {target && (
        <section className={'typo-body2'} key={`${target.uid}-${updateSeq}`}>
          <h3 className={'p-16'}>{target.label}</h3>
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
                defaultValue={target.x.toFixed(2)}
                onChange={(e) => {
                  target.x = Number(e.target.value);
                }}
              />
            </label>

            <label className={inputClassName}>
              <span className={'text-white/50'}>Y</span>
              <input
                className={'w-full'}
                type="number"
                defaultValue={target.y.toFixed(2)}
                onChange={(e) => {
                  target.y = Number(e.target.value);
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
                defaultValue={target.width.toFixed(2)}
                onChange={(e) => {
                  target.width = Number(e.target.value);
                }}
              />
            </label>

            <label className={inputClassName}>
              <span className={'text-white/50'}>H</span>
              <input
                className={'w-full'}
                type="number"
                defaultValue={target.height.toFixed(2)}
                onChange={(e) => {
                  target.height = Number(e.target.value);
                }}
              />
            </label>
          </div>

          {target instanceof Graphics && (
            <>
              <hr className={hrClassName} />
              <h3 className={'p-16'}>Stroke</h3>
              <div className={'flex flex-col items-center gap-8 px-16 pb-16'}>
                <label className={cn(inputClassName, 'px-4 py-2')}>
                  <input
                    className={'w-24'}
                    type="color"
                    defaultValue={`#${target.strokeStyle.color.toString(16)}`}
                    onChange={(e) => {
                      const color = e.target.value;
                      const { width } = target.strokeStyle;
                      target
                        .clear()
                        .rect(
                          0,
                          0,
                          savedInfoBeforeMutation.width,
                          savedInfoBeforeMutation.height
                        )
                        .stroke({
                          width,
                          color,
                        });
                      update();
                    }}
                  />
                  <span>{`#${target.strokeStyle.color.toString(16)}`}</span>
                </label>
                <label className={inputClassName}>
                  <span className={'text-white/50'}>W</span>
                  <input
                    className={'w-full'}
                    type="number"
                    defaultValue={target.strokeStyle.width}
                    onChange={(e) => {
                      const width = Number(e.target.value);
                      const color = target.strokeStyle.color;
                      target
                        .clear()
                        .rect(
                          0,
                          0,
                          savedInfoBeforeMutation.width,
                          savedInfoBeforeMutation.height
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

              {/** FILL */}
              {/* FIXME: Handle cases where transparency is applied */}
              <hr className={hrClassName} />
              <h3 className={'p-16'}>Fill</h3>
              <div className={'flex flex-col items-center gap-8 px-16 pb-16'}>
                <label className={cn(inputClassName, 'px-4 py-2')}>
                  <input
                    className={'w-24'}
                    type="color"
                    defaultValue={`#${target.fillStyle.color.toString(16)}`}
                    onChange={(e) => {
                      console.log(target.fillStyle);
                      const color = e.target.value;
                      const { width } = target.strokeStyle;
                      target
                        .clear()
                        .rect(
                          0,
                          0,
                          savedInfoBeforeMutation.width,
                          savedInfoBeforeMutation.height
                        )
                        .stroke({
                          width,
                          color,
                        })
                        .fill({
                          color,
                        });
                      update();
                    }}
                  />
                  <span>{`#${target.strokeStyle.color.toString(16)}`}</span>
                </label>
              </div>
            </>
          )}
        </section>
      )}
    </aside>
  );
};

export default MutatePanel;
