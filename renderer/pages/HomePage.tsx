import WithBreadcrumb from '@/components/WithBreadcrumb';
import Sample from '@/lib/Pixi/sample';

export default function HomePage() {
  return (
    <WithBreadcrumb items={[{ name: '홈', path: '/' }]}>
      <div className={'page-wrapper flex items-center justify-center text-sm'}>
        <Sample />
      </div>
    </WithBreadcrumb>
  );
}
