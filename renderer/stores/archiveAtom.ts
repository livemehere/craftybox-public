import { atom } from 'jotai';
import { uid } from 'uid';

import { atomWithLocalStorage } from '@/stores/utils/atomWithLocalStorage';

export interface IArchive {
  parentId: string;
  id: string;
  label: string;
  value: string;
  createdAt: number;
}

export const ROOT_PARENT_ID = 'root';

export const archivesAtom = atomWithLocalStorage<IArchive[]>('archives', []);
archivesAtom.debugLabel = 'archivesAtom';

export const addArchiveAtom = atom(
  null,
  (get, set, { label, value, parentId = ROOT_PARENT_ID }) => {
    const newArchive: IArchive = {
      parentId,
      id: uid(8),
      label,
      value,
      createdAt: Date.now(),
    };

    set(archivesAtom, (prev) => [...prev, newArchive]);
    return newArchive;
  }
);

export const removeArchiveAtom = atom(null, (get, set, { id }) => {
  const archives = get(archivesAtom);
  const filteredArchives = archives.filter((archive) => archive.id !== id);
  set(archivesAtom, filteredArchives);
});

export const updateArchiveLabelAtom = atom(null, (get, set, { id, label }) => {
  const archives = get(archivesAtom);
  const updatedArchives = archives.map((archive) =>
    archive.id === id ? { ...archive, label } : archive
  );
  set(archivesAtom, updatedArchives);
});
