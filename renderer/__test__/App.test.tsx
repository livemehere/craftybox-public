import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';

import App from '@/App';

import { renderWithProvider } from './utils';

describe('App', () => {
  describe('Routing', async () => {
    it('Home Page Render', async () => {
      renderWithProvider(<App routerType="memory" initialEntries={['/']} />);
      expect(await screen.findByTestId('home-page')).toBeInTheDocument();
    });
  });
});
