import React from 'react';
import { render } from '@testing-library/react-native';
import IndexScreen from '../app/index';

// Mock the store and hooks to prevent actual calls during testing
jest.mock('../src/store/useFinanceStore', () => ({
  useFinanceStore: () => ({
    transactions: [],
    addTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
  }),
}));

describe('Index Screen', () => {
  it('renders correctly', () => {
    // This assumes your Index Screen is robust enough to render without failing when transactions are empty.
    const { toJSON } = render(<IndexScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
