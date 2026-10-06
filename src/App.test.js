import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CPU scheduling simulator', () => {
  render(<App />);
  const heading = screen.getByText(/CPU Scheduling Simulator/i);
  expect(heading).toBeInTheDocument();
});
