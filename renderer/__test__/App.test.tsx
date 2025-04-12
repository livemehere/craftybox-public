import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import App from '@/App';

import { renderWithProvider } from './utils';

describe('App', () => {
  describe('Routing', async () => {
    it('home without locale', async () => {
      renderWithProvider(<App routerType="memory" initialEntries={['/']} />);
      expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    });
  });
});
