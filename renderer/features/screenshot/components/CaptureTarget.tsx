import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { MdOutlineMonitor } from 'react-icons/md';
import { useMemo, useState } from 'react';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';
import { TbFaceIdError } from 'react-icons/tb';
import { useNavigate } from 'react-router';
import { addToast } from '@heroui/toast';
import { Slider } from '@heroui/react';
import { Card, CardFooter } from '@heroui/card';
import { Spinner } from '@heroui/spinner';

import { Icon } from '@/components/icons/Icon';
import { getAspectRatio } from '@/utils/size';
import { ScreenShotPageQsState } from '@/pages/tools/ScreenShotPage';
import { SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY } from '@/features/edit/schema';

interface CaptureTargetProps {
  id: string;
  type: ScreenShotPageQsState['tab'];
  name: string;
  originWidth: number;
  dataUrl: string;
  appIcon?: string;
  originScaleFactor: number;
}

export default function CaptureTarget({
  id,
  type,
  name,
  originWidth,
  dataUrl,
  appIcon,
}: CaptureTargetProps) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [pending, setPending] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const [aspectRatio, setAspectRatio] = useState({
    width: 0,
    height: 0,
  });
  const [scaleFactor, setScaleFactor] = useState(1);
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
      addToast({
        title: 'Copied to clipboard',
        description: 'Screenshot has been copied to clipboard.',
        color: 'success',
      });
    } catch (e) {
      if (e instanceof Error) {
        addToast({
          title: 'Error',
          description: e.message,
          color: 'danger',
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
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${name}.png`;
      a.click();
      a.remove();
    } catch (e) {
      if (e instanceof Error) {
        addToast({
          title: 'Error',
          description: e.message,
          color: 'danger',
        });
      }
    } finally {
      setPending(false);
    }
  };

  const goEdit = async () => {
    const dataUrl = await getDataUrl();
    localStorage.setItem(SCREEN_SHOT_EDIT_TARGET_DATA_URL_LS_KEY, dataUrl);
    navigate('/tools/edit');
  };

  const btnClassName =
    'hover:bg-app-gray flex h-8 w-8 cursor-pointer items-center justify-center rounded-full';

  return (
    <Card
      isFooterBlurred
      className="relative h-[200px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/70">
          {pending ? (
            <Spinner />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <button className={btnClassName} onClick={copyToClipboard}>
                  <TbCopy />
                </button>
                <button className={btnClassName} onClick={download}>
                  <FiDownload />
                </button>
                <button className={btnClassName} onClick={goEdit}>
                  <Icon
                    name={'edit'}
                    className="h-4.5 w-4.5 [&_path]:stroke-white"
                  />
                </button>
              </div>
              <Slider
                className="mt-5 max-w-md"
                aria-label={'Scale Factor'}
                defaultValue={scaleFactor}
                showTooltip={true}
                minValue={0.1}
                maxValue={2}
                step={0.1}
                onChange={(v) => {
                  setScaleFactor(v as number);
                }}
              />
              <div className="text-app-secondary">
                {scaledWidth}
                <span className="opacity-50"> x </span>
                {scaledHeight} ({scaleFactor})
              </div>
            </div>
          )}
        </div>
      )}
      {thumbnailError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <TbFaceIdError className="mb-[50px] h-[48px] w-[48px] opacity-50" />
        </div>
      )}
      <img
        className="z-0 h-full w-full -translate-y-6 scale-125 object-contain"
        src={dataUrl}
        alt={`screenshot-${id}`}
        onLoad={(e) => {
          const img = e.currentTarget;
          const { naturalWidth, naturalHeight } = img;
          const { width, height } = getAspectRatio(naturalWidth, naturalHeight);
          setAspectRatio({ width, height });
          setThumbnailError(false);
        }}
        onError={() => {
          setThumbnailError(true);
        }}
      />
      <CardFooter className="absolute bottom-0 z-10 border-t-1 border-zinc-100/50 bg-black/20">
        <div className="bg-app-gray mr-2.5 h-10 w-10 shrink-0 rounded-full">
          {appIcon ? (
            <img
              src={appIcon}
              alt="app-icon"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <MdOutlineMonitor className="h-full w-full p-2" />
          )}
        </div>
        <div className="flex-1 truncate">
          <p className="truncate">
            {name} ({id})
          </p>
          <p className="text-tiny text-app-tertiary">
            {width}
            <span className="opacity-50"> x </span>
            {height}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
