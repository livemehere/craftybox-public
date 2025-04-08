import { useAtomValue, useSetAtom } from 'jotai';
import { MdOutlineRemoveCircleOutline } from 'react-icons/md';
import { useHotkeys } from 'react-hotkeys-hook';
import { MdOpenInNew } from 'react-icons/md';
import { rendererIpc } from '@electron-buddy/ipc/renderer';
import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';

import {
  addArchiveAtom,
  archivesAtom,
  IArchive,
  removeArchiveAtom,
  updateArchiveLabelAtom,
} from '@/stores/archiveAtom';
import WithBreadcrumb from '@/components/WithBreadcrumb';

const DOMAIN_COLORS: Record<string, string> = {
  'github.com': 'bg-[#2b3137]',
  'google.com': 'bg-[#4285f4]',
  'youtube.com': 'bg-[#f45353]',
  'twitter.com': 'bg-[#1da1f2]',
  'facebook.com': 'bg-[#4267B2]',
  기타: 'bg-neutral-950',
};

const getDomainColor = (domain: string) => {
  const found = Object.keys(DOMAIN_COLORS).find((key) => domain.includes(key));
  if (found) {
    return DOMAIN_COLORS[found];
  }
  return DOMAIN_COLORS['기타'];
};

export default function ArchivePage() {
  const archives = useAtomValue(archivesAtom);
  const addArchive = useSetAtom(addArchiveAtom);
  const removeArchive = useSetAtom(removeArchiveAtom);
  const updateArchiveLabel = useSetAtom(updateArchiveLabelAtom);
  const lastInputRef = useRef<HTMLInputElement>(null);

  const latestArchive: IArchive | undefined = archives[archives.length - 1];

  useEffect(() => {
    if (
      lastInputRef.current &&
      latestArchive &&
      dayjs().diff(dayjs(latestArchive.createdAt), 's') < 1
    ) {
      lastInputRef.current.focus();
      lastInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [archives.length, latestArchive?.createdAt]);

  useHotkeys('mod+v', () => {
    navigator.clipboard.readText().then((text) => {
      if (!text) return;
      addArchive({ label: '', value: text });
    });
  });

  const groupedArchives = archives.reduce(
    (acc, archive) => {
      try {
        const url = new URL(archive.value);
        const domain = url.hostname;
        if (!acc[domain]) {
          acc[domain] = [];
        }
        acc[domain].push(archive);
      } catch {
        if (!acc['기타']) {
          acc['기타'] = [];
        }
        acc['기타'].push(archive);
      }
      return acc;
    },
    {} as Record<string, typeof archives>
  );

  return (
    <WithBreadcrumb
      items={[
        {
          name: '워크스페이스',
          path: '/workspace',
        },
        {
          name: '아카이브',
          path: '/workspace/archive',
        },
      ]}
    >
      <div className="page-wrapper-with-padding">
        <h1 className="mb-2 text-3xl font-bold">Archive</h1>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">아카이브 목록</h2>
          <button
            className="icon-warn-btn"
            onClick={() => {
              if (confirm('모든 아카이브를 삭제하시겠습니까?')) {
                archives.forEach((archive) => {
                  removeArchive({ id: archive.id });
                });
              }
            }}
          >
            전체 삭제
          </button>
        </div>
        <div className="flex flex-col gap-4 p-2">
          {Object.entries(groupedArchives)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([domain, domainArchives]) => (
              <div
                key={domain}
                className={`rounded-lg ${getDomainColor(domain)} p-4`}
              >
                <h3 className="text-md mb-2 font-bold">
                  {domain} {getDomainColor(domain)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {domainArchives.map((archive) => (
                    <li
                      key={archive.id}
                      className="flex cursor-pointer items-center gap-4 rounded-md bg-neutral-900 p-3 text-sm hover:bg-neutral-800"
                      onClick={() => {
                        try {
                          new URL(archive.value);
                          rendererIpc.invoke('url:openExternal', {
                            url: archive.value,
                          });
                        } catch {
                          alert('유효하지 않은 URL입니다.');
                        }
                      }}
                    >
                      <input
                        className="w-1/3 shrink-0"
                        ref={
                          archive.id === latestArchive?.id ? lastInputRef : null
                        }
                        type="text"
                        value={archive.label}
                        onChange={(e) =>
                          updateArchiveLabel({
                            id: archive.id,
                            label: e.target.value,
                          })
                        }
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                      />
                      <MdOpenInNew className="shrink-0" />
                      <span className="w-[500px] truncate text-xs">
                        {archive.value}
                      </span>
                      <button
                        className={'icon-warn-btn ml-auto'}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeArchive({ id: archive.id });
                        }}
                      >
                        <MdOutlineRemoveCircleOutline />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </WithBreadcrumb>
  );
}
