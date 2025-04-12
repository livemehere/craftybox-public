import '@testing-library/jest-dom/vitest';
import { beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  const ipcMock = {
    invoke: vi.fn(() => Promise.resolve('')),
    send: vi.fn(() => {}),
    on: vi.fn(() => () => {}),
  };
  window.app = ipcMock as any;
});

beforeEach(() => {
  cleanup();
});
