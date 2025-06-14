import { Alert } from '@heroui/react';

export default function HomePage() {
  return (
    <div
      className={'flex h-full items-center justify-center text-sm'}
      data-testid="home-page"
    >
      <h1>CraftyBox</h1>

      <Alert title={'hello'} />
    </div>
  );
}
