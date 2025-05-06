import { Container, Filter } from 'pixi.js';
import { OutlineFilter } from 'pixi-filters';

export function makeHighLight(target: Container) {
  let prevFilters: Filter[] = [];
  prevFilters = (
    Array.isArray(target.filters) ? [...target.filters] : [target.filters]
  ).filter(Boolean);
  target.filters = [
    ...prevFilters,
    new OutlineFilter({
      thickness: 1,
      color: 0xff0000,
    }),
  ];
  return () => {
    target.filters = prevFilters;
  };
}
