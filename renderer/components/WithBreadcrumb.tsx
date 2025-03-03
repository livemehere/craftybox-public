import { IBreadcrumbItem, useRegisterBreadcrumb } from '@/stores/breadcrumbAtom';

type Props = {
  children: React.ReactNode;
  items: IBreadcrumbItem[];
};

const WithBreadcrumb = ({ items, children }: Props) => {
  useRegisterBreadcrumb(items);
  return children;
};

export default WithBreadcrumb;
