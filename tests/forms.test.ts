import 'jest';
import { createForm, bindInput } from '../src';

test('initializes form', () => {
  const state = {
    test: 'test',
  };

  const ctx = {};

  const onchange = jest.fn((ctx) => {});

  const form = createForm(state, ctx, onchange);
  form.set((m) => (m.test = 'ahoy'));

  expect(onchange).toBeCalled();
  expect(form.model.test).toBe('ahoy');
});

test('binds input', () => {
  const state = {
    test: 'test',
  };

  const ctx = {};

  const onchange = jest.fn((ctx) => {});

  const form = createForm(state, ctx, onchange);

  const handler = bindInput(form, 'test');

  // dummy event
  const ev = {
    target: {
      type: 'text',
      value: 'changed',
    },
  } as any;

  handler(ev as Event);

  expect(onchange).toBeCalled();
  expect(form.model.test).toBe('changed');
});

test('validates input', () => {
  const state = {
    test: 'test',
  };

  const ctx = {
    errors: [],
  };

  const onchange = jest.fn((ctx) => {});

  const form = createForm(state, ctx, onchange);

  const onvalidate = jest.fn((val, field, form) => {
    expect(val).toBe('changed');
    expect(field).toBe('test');
    expect(form.model.test).toBe('test'); //not changed yet
    form.context.errors.push('ERROR');
  });

  const handler = bindInput(form, 'test', [onvalidate]);

  const ev = {
    target: {
      type: 'text',
      value: 'changed',
    },
  } as any;

  handler(ev as Event);

  expect(onchange).toBeCalled();
  expect(onvalidate).toBeCalled();
  expect(form.model.test).toBe('changed');
  expect(form.context.errors[0]).toBe('ERROR');
});

test('converts numeric input', () => {
  const state = {
    num: 0,
  };

  const ctx = {};

  const onchange = jest.fn((ctx) => {});

  const form = createForm(state, ctx, onchange);

  const handler = bindInput(form, 'num');

  const ev = {
    target: {
      type: 'number',
      value: '0100',
    },
  } as any;

  handler(ev as Event);

  expect(onchange).toBeCalled();
  expect(form.model.num).toBe(100);
});

test('bindInput uses custom converter', () => {
  const state = {
    num: 0,
  };

  const ctx = {};

  const onchange = jest.fn((ctx) => {});

  const form = createForm(state, ctx, onchange);

  const handler = bindInput(form, 'num', [], (e: any) => {
    return e.target.value.charCodeAt(0);
  });

  const ev = {
    target: {
      value: 'A',
    },
  } as any;

  handler(ev as Event);

  expect(onchange).toBeCalled();
  expect(form.model.num).toBe(65);
});
