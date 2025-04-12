import { createContext } from '@fewings/react/contextSelector';

import { OverlayContextProps } from './schema';

export const OverlayContext = createContext<OverlayContextProps>({
  items: [],
  setItems: () => {},
  idRef: { current: 0 },
});
