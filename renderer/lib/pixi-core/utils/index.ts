import { Container } from 'pixi.js';
import { OutlineFilter } from 'pixi-filters';

export function makeHighLight(target: Container) {
  const outlineFilter = new OutlineFilter({
    thickness: 1,
    color: 0xff0000,
  });

  target.filters = (
    Array.isArray(target.filters)
      ? [...target.filters, outlineFilter]
      : [target.filters, outlineFilter]
  ).filter(Boolean);

  return () => {
    target.filters = Array.prototype.filter.call(
      target.filters,
      (f) => f !== outlineFilter
    );
  };
}
