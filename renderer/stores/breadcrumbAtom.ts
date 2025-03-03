import { atom, useSetAtom } from 'jotai';
import { useEffect } from 'react';

export interface IBreadcrumbItem {
  path: string;
  name: string;
}

export const breadcrumbAtom = atom<IBreadcrumbItem[]>([]);
breadcrumbAtom.debugLabel = 'breadcrumb';

export const useRegisterBreadcrumb = (items: IBreadcrumbItem[]) => {
  const setBreadcrumb = useSetAtom(breadcrumbAtom);
  useEffect(() => {
    setBreadcrumb(items);

    return () => {
      setBreadcrumb([]);
    };
  }, [items]);
};
