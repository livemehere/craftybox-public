import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';

describe('sample', () => {
  it('should be true', () => {
    expect(true).toBe(true);
  });

  it('Basic react component test', async () => {
    function Sample() {
      const [count, setCount] = useState(0);
      return (
        <div>
          <p>render app</p>
          <button onClick={() => setCount(count + 1)}>click</button>
          <p data-testid="count">{count}</p>
        </div>
      );
    }

    render(<Sample />);
    const button = screen.getByText('click');
    const count = screen.getByTestId('count');
    expect(count).toHaveTextContent('0');
    await userEvent.click(button);
    expect(count).toHaveTextContent('1');
  });
});
