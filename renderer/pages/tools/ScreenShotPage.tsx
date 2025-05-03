import { useQsState } from '@fewings/react-qs';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineMonitor } from 'react-icons/md';
import { useState } from 'react';
import { TbCopy } from 'react-icons/tb';
import { FiDownload } from 'react-icons/fi';

import Tabs from '@/components/Tabs';

type Tabs = 'screen' | 'window';
type QsState = {
  tab: Tabs;
};

const ScreenShotPage = () => {
  const [qs, setQs] = useQsState<QsState>({
    tab: 'screen',
  });

  return (
    <div className={'h-full px-30 py-20'}>
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
  width: number;
  height: number;
  dataUrl: string;
  appIcon?: string;
  scaleFactor: number;
}

function CaptureTarget({
  id,
  type,
  name,
  width,
  height,
  dataUrl,
  appIcon,
  scaleFactor,
}: CaptureTargetProps) {
  const [hover, setHover] = useState(false);
  const finalScaleFactor = scaleFactor || 1;

  const originWidth = width * finalScaleFactor;
  const originHeight = height * finalScaleFactor;

  const finalWidth = originWidth || 1280;
  const finalHeight = originHeight || 720;

  const getDataUrl = async () => {
    const { dataUrl } = await rendererIpc.invoke('snapshot:capture', {
      type,
      id,
      width: finalWidth,
      height: finalHeight,
    });

    return dataUrl;
  };

  const copyToClipboard = async () => {
    const dataUrl = await getDataUrl();
    const blob = await fetch(dataUrl).then((res) => res.blob());
    navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
  };

  const download = async () => {
    const dataUrl = await getDataUrl();
    const blob = await fetch(dataUrl).then((res) => res.blob());
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.png`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  const btnClassName =
    'hover:bg-app-gray flex h-32 w-32 cursor-pointer items-center justify-center rounded-full';

  return (
    <div
      key={id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative h-180 w-full rounded-lg bg-neutral-950">
        <img
          src={dataUrl}
          alt={name}
          className="h-full w-full object-contain"
        />
        {hover && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <button className={btnClassName} onClick={copyToClipboard}>
              <TbCopy />
            </button>
            <button className={btnClassName} onClick={download}>
              <FiDownload />
            </button>
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
          <p className="typo-body2 text-app-tertiary mt-2">
            {width}
            <span className="opacity-50"> x </span>
            {height}
          </p>
        </div>
      </div>
    </div>
  );
}

function ItemList({ type }: { type: Tabs }) {
  const { data } = useQuery({
    queryKey: ['snapshot:list', type],
    queryFn: () => rendererIpc.invoke('snapshot:list', { type }),
    refetchInterval: 1000,
  });

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-x-12 gap-y-30">
      {data?.map((item) => (
        <CaptureTarget key={item.id} {...item} type={type} />
      ))}
    </div>
  );
}
