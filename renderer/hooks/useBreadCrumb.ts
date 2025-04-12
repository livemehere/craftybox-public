import { useMemo } from 'react';
import { useMatches } from 'react-router';

export default function useBreadCrumb() {
  const matches = useMatches();
  return useMemo(() => matches.filter((m) => isValidRouteId(m.id)), [matches]);
}

function isValidRouteId(v: string): boolean {
  return !/^\d(-\d)*$/.test(v);
}
