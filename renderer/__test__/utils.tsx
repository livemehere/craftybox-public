import { render } from '@testing-library/react';

import Providers from '@/Providers';

export function renderWithProvider(children: React.ReactNode) {
  return render(<Providers>{children}</Providers>);
}
