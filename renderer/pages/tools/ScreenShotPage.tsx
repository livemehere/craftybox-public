import { useQsState } from '@fewings/react-qs';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineMonitor } from 'react-icons/md';
import { useMemo, useState } from 'react';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';
import { TbFaceIdError } from 'react-icons/tb';

import Tabs from '@/components/Tabs';
import { useToast } from '@/lib/toast/ToastContext';
import { Icon } from '@/components/icons/Icon';
import { getAspectRatio } from '@/utils/size';

type Tabs = 'screen' | 'window';
type QsState = {
  tab: Tabs;
};

const ScreenShotPage = () => {
  const [qs, setQs] = useQsState<QsState>({
    tab: 'screen',
  });

  return (
    <div className={'px-30 py-20'}>
      <section className="flex items-center justify-center gap-4">
        <Tabs
          tabs={[
            { key: 'screen', label: 'SCREEN' },
            { key: 'window', label: 'WINDOW' },
          ]}
          activeTab={qs.tab}
          setActiveTab={(key) => {
            setQs((prev) => ({ ...prev, tab: key as Tabs }));
          }}
        />
      </section>
      <section className="mt-20">
        <ItemList type={qs.tab} />
      </section>
    </div>
  );
};

export default ScreenShotPage;

interface CaptureTargetProps {
  id: string;
  type: Tabs;
  name: string;
  originWidth: number;
  dataUrl: string;
  appIcon?: string;
  originScaleFactor: number;
}

function CaptureTarget({
  id,
  type,
  name,
  originWidth,
  dataUrl,
  appIcon,
  originScaleFactor,
}: CaptureTargetProps) {
  const { pushMessage } = useToast();
  const [hover, setHover] = useState(false);
  const [pending, setPending] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const [aspectRatio, setAspectRatio] = useState({
    width: 0,
    height: 0,
  });
  const [scaleFactor, setScaleFactor] = useState(originScaleFactor ?? 1);
  const anchorWidth = originWidth || 1280;

  const anchor = aspectRatio.width > aspectRatio.height ? 'width' : 'height';
  const size = useMemo(() => {
    if (anchor === 'width') {
      return {
        width: anchorWidth,
        height: Math.ceil(
          (aspectRatio.height / aspectRatio.width) * anchorWidth
        ),
      };
    } else {
      const anchorHeight = Math.ceil(
        (aspectRatio.width / aspectRatio.height) * anchorWidth
      );
      return {
        height: anchorHeight,
        width: Math.ceil(
          (aspectRatio.width / aspectRatio.height) * anchorHeight
        ),
      };
    }
  }, [anchor, aspectRatio.width, aspectRatio.height]);

  const sizeWithScale = useMemo(() => {
    return {
      width: Math.ceil(size.width * scaleFactor),
      height: Math.ceil(size.height * scaleFactor),
    };
  }, [size, scaleFactor]);

  const { width, height } = size;
  const { width: scaledWidth, height: scaledHeight } = sizeWithScale;

  const getDataUrl = async () => {
    const { dataUrl } = await rendererIpc.invoke('snapshot:capture', {
      type,
      id,
      width: scaledWidth,
      height: scaledHeight,
    });

    return dataUrl;
  };

  // FIXME: improve time
  const copyToClipboard = async () => {
    try {
      setPending(true);
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
    } catch (e) {
      if (e instanceof Error) {
        pushMessage(e.message, {
          type: 'error',
        });
      }
    } finally {
      setPending(false);
    }
  };
  const download = async () => {
    try {
      setPending(true);
      const dataUrl = await getDataUrl();
      const blob = await fetch(dataUrl).then((res) => res.blob());
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.png`;
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      if (e instanceof Error) {
        pushMessage(e.message, {
          type: 'error',
        });
      }
    } finally {
      setPending(false);
    }
  };

  const btnClassName =
    'hover:bg-app-gray flex h-32 w-32 cursor-pointer items-center justify-center rounded-full';

  return (
    <div
      key={id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative h-180! w-full overflow-hidden rounded-lg bg-neutral-950">
        <img
          src={dataUrl}
          alt={''}
          className={'h-full w-full border-none object-contain'}
          onLoad={(e) => {
            const img = e.currentTarget;
            const { naturalWidth, naturalHeight } = img;
            const { width, height } = getAspectRatio(
              naturalWidth,
              naturalHeight
            );
            setAspectRatio({ width, height });
            setThumbnailError(false);
          }}
          onError={() => {
            setThumbnailError(true);
          }}
        />
        {thumbnailError && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
            <TbFaceIdError className="h-48 w-48 opacity-50" />
          </div>
        )}
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            {pending ? (
              <Icon name={'loading'} fill={'white'} width={50} height={50} />
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-8">
                  <button className={btnClassName} onClick={copyToClipboard}>
                    <TbCopy />
                  </button>
                  <button className={btnClassName} onClick={download}>
                    <FiDownload />
                  </button>
                </div>
                <input
                  className="mt-10"
                  type="range"
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={scaleFactor}
                  onChange={(e) => {
                    setScaleFactor(parseFloat(e.target.value));
                  }}
                />
                <div className="typo-body2 text-app-secondary mt-20">
                  {scaledWidth}
                  <span className="opacity-50"> x </span>
                  {scaledHeight} ({scaleFactor})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-8 flex">
        <div className="bg-app-gray mr-10 h-40 w-40 shrink-0 rounded-full">
          {appIcon ? (
            <img
              src={appIcon}
              alt="app-icon"
              className="h-full w-full object-contain p-8"
            />
          ) : (
            <MdOutlineMonitor className="h-full w-full p-8" />
          )}
        </div>
        <div className="overflow-hidden">
          <p className="typo-body1 text-app-secondary truncate font-bold">
            {name}
          </p>
          <p className="typo-body2 text-app-tertiary mt-4">{id}</p>
          <div className="mt-4 flex items-center gap-8">
            <Icon
              name="constraint"
              className="h-16 w-16 translate-y-1 opacity-70"
            />
            {thumbnailError ? 'error' : ''}
            <p className="typo-body2 text-app-tertiary mt-2">
              {width}
              <span className="opacity-50"> x </span>
              {height}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemList({ type }: { type: Tabs }) {
  const { data } = useQuery({
    queryKey: ['snapshot:list', type],
    queryFn: () => rendererIpc.invoke('snapshot:list', { type }),
    refetchInterval: 500,
    select: (data) => {
      return data.sort((a, b) => {
        if (a.name === b.name) {
          return 0;
        }
        if (a.name > b.name) {
          return 1;
        }
        return -1;
      });
    },
  });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-12 gap-y-30">
      {data?.map((item) => (
        <CaptureTarget
          key={item.id}
          type={type}
          id={item.id}
          name={item.name}
          dataUrl={item.dataUrl}
          appIcon={item.appIcon}
          originWidth={item.width}
          originScaleFactor={item.scaleFactor}
        />
      ))}
    </div>
  );
}
