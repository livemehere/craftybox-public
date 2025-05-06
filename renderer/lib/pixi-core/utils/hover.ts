import { Container, FederatedPointerEvent } from 'pixi.js';

export function onHover(
  target: Container,
  onEnter: (e: FederatedPointerEvent) => void,
  onLeave: (e: FederatedPointerEvent) => void
) {
  const prevInteractive = target.interactive;
  target.interactive = prevInteractive || true;
  target.on('mouseenter', onEnter);
  target.on('mouseleave', onLeave);
  return () => {
    target.off('mouseenter', onEnter);
    target.off('mouseleave', onLeave);
    target.interactive = prevInteractive;
  };
}
