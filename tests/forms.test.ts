import 'jest';
import { createForm } from '../src';

test('initializes form', () => {
  const state = {
    test: 'test',
  };

  const ctx = {};

  const onchange = jest.fn((ctx) => {});

  const form = createForm(state, ctx, onchange);

  expect(onchange).toBeCalled();
});
