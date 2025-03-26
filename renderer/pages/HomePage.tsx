import WithBreadcrumb from '@/components/WithBreadcrumb';

export default function HomePage() {
  return (
    <WithBreadcrumb items={[{ name: '홈', path: '/' }]}>
      <div className={'page-wrapper flex items-center justify-center text-sm'}>
        <h1>CraftyBox</h1>
      </div>
    </WithBreadcrumb>
  );
}
