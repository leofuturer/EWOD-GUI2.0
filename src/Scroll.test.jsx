import React from 'react';
import {
  cleanup, fireEvent, render, screen,
} from '@testing-library/react';
import Scroll from './Scroll';
import { ActuationProvider } from './Contexts/ActuationProvider';

beforeEach(() => render(
  <ActuationProvider>
    <Scroll />
  </ActuationProvider>,
));

afterEach(cleanup);

it('Add sequence when click the button', () => {
  let seq = screen.getAllByTestId('seq-button');
  expect(seq).toHaveLength(1);
  const add = screen.getByTestId('add-button');
  fireEvent.click(add);
  seq = screen.getAllByTestId('seq-button');
  expect(seq).toHaveLength(2);
});

it('Delete all', () => {
  expect(screen.getAllByTestId('seq-button')).toHaveLength(1);
  const add = screen.getByTestId('add-button');
  for (let i = 0; i < 5; i += 1) {
    fireEvent.click(add);
  }
  expect(screen.getAllByTestId('seq-button')).toHaveLength(6);
  fireEvent.click(screen.getByTestId('delete-start'));
  const del = screen.getByTestId('delete-button');
  fireEvent.click(del);
  expect(screen.getAllByTestId('seq-button')).toHaveLength(1);
});
