import { Meta, StoryObj } from '@storybook/react';

import { OverlayProvider } from './OverlayProvider';
import { useOverlay } from './useOverlay';

export default {
  title: 'lib/overlay',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'overlay implementation',
      },
    },
  },
  tags: ['autodocs'],
} as Meta<typeof OverlayProvider>;

type Story = StoryObj<typeof OverlayProvider>;

const OverlayExample = () => {
  const { open } = useOverlay();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Overlay Example</h2>
      <button
        onClick={async () => {
          const result = await open(
            ({ resolve, reject }) => (
              <div
                style={{
                  background: 'white',
                  width: 500,
                  height: 300,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%)',
                }}
              >
                <h1>Modal</h1>
                <p>Name: John Doe</p>
                <p>Age: 30</p>
                <div
                  style={{ display: 'flex', gap: '10px', marginTop: '20px' }}
                >
                  <button onClick={() => resolve('Success!')}>Confirm</button>
                  <button onClick={() => reject('Cancel')}>Close</button>
                </div>
              </div>
            ),
            { closeOnClickOutside: true }
          );
          console.log('Result:', result);
        }}
      >
        Open Modal
      </button>
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <OverlayProvider>
      <OverlayExample />
    </OverlayProvider>
  ),
};
