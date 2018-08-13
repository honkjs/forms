import 'jest';
import { createForm, FormField } from '../src';

test('initializes form', () => {
  const state = {
    test: 'test',
  };

  const form = createForm(state);

  expect(form.value).toBe(state);
  expect(form.isTouched).toBe(false);
  expect(form.errors).toEqual([]);
  expect(form.isErrored).toBe(false);
});

test('gets field value', () => {
  const state = {
    data: 'test',
  };

  const form = createForm(state);
  const field = form.getField('data');

  expect(field.value).toBe('test');
  expect(field.isTouched).toBe(false);
  expect(field.errors).toEqual([]);
  expect(field.isErrored).toBe(false);
});

test('sets field value', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn(function(form, field) {
    expect(form.value).toBe(state);
    expect(field.value).toBe('different');
  });

  const form = createForm(state);
  form.onChange(onchange);

  const field = form.getField('data');
  field.value = 'different';

  // field is updated
  expect(field.value).toBe('different');
  expect(field.isTouched).toBe(true);

  // parent is updated
  expect(form.value).toBe(state);
  expect(form.isTouched).toBe(true);

  // actual state is updated
  expect(state.data).toBe('different');

  // our event fired
  expect(onchange).toBeCalled();
});

test('sets field errors', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn();
  const onerror = jest.fn(function(form, field) {
    expect(form.value).toBe(state);
    expect(field.errors).toEqual(['ERROR']);
  });

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.setErrors(['ERROR']);

  // field is updated
  expect(field.isErrored).toBe(true);
  expect(field.errors).toEqual(['ERROR']);

  // parent is updated
  expect(form.isErrored).toBe(true);

  expect(onchange).not.toBeCalled();
  expect(onerror).toBeCalled();
});

test('gets and sets isTouched', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn(function(form, field) {
    expect(form.value).toBe(state);
    expect(field.isTouched).toBe(true);
  });
  const onerror = jest.fn();

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.isTouched = true;

  // field is updated
  expect(field.isTouched).toBe(true);

  // parent is updated
  expect(form.isTouched).toBe(true);

  field.isTouched = false;

  // field is updated
  expect(field.isTouched).toBe(false);

  // parent is _not_ updated
  expect(form.isTouched).toBe(true);

  // on change will only fire for touched
  // not untouched since that doesn't mod the value
  // or the parent.
  expect(onchange).toHaveBeenCalledTimes(1);
  expect(onerror).not.toBeCalled();
});

test('gets and sets isErrored', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn();
  const onerror = jest.fn(function(form, field) {
    expect(form.value).toBe(state);
    expect(field.isErrored).toBe(true);
  });

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.isErrored = true;

  // field is updated
  expect(field.isErrored).toBe(true);

  // parent is updated
  expect(form.isErrored).toBe(true);

  field.isErrored = false;

  // field is updated
  expect(field.isErrored).toBe(false);

  // parent is _not_ updated
  expect(form.isErrored).toBe(true);

  // on change will only fire for touched
  // not untouched since that doesn't mod the value
  // or the parent.
  expect(onchange).not.toBeCalled();
  expect(onerror).toHaveBeenCalledTimes(1);
});

test('sets isErrored clears errors', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn();
  const onerror = jest.fn(function(form, field) {
    expect(form.value).toBe(state);
    expect(field.isErrored).toBe(true);
  });

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.setErrors(['ERROR']);

  // field is updated
  expect(field.isErrored).toBe(true);

  // parent is updated
  expect(form.isErrored).toBe(true);

  field.isErrored = false;

  // field is updated
  expect(field.isErrored).toBe(false);
  expect(field.errors).toEqual([]);

  // parent is _not_ updated
  expect(form.isErrored).toBe(true);

  // on change will only fire for touched
  // not untouched since that doesn't mod the value
  // or the parent.
  expect(onchange).not.toBeCalled();
  expect(onerror).toHaveBeenCalledTimes(1);
});

test('sets error clears errors', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn();
  const onerror = jest.fn(function(form, field) {
    expect(form.value).toBe(state);
    expect(field.isErrored).toBe(true);
  });

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.setErrors(['ERROR']);

  // field is updated
  expect(field.isErrored).toBe(true);

  // parent is updated
  expect(form.isErrored).toBe(true);

  field.setErrors([]);

  // field is updated
  expect(field.isErrored).toBe(false);
  expect(field.errors).toEqual([]);

  // parent is _not_ updated
  expect(form.isErrored).toBe(true);

  // on change will only fire for touched
  // not untouched since that doesn't mod the value
  // or the parent.
  expect(onchange).not.toBeCalled();
  expect(onerror).toHaveBeenCalledTimes(1);
});

test('resets field', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn();
  const onerror = jest.fn();

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.value = 'different';
  field.setErrors(['ERROR']);

  expect(state.data).toBe('different');
  expect(field.value).toBe('different');
  expect(field.isTouched).toBe(true);
  expect(field.isErrored).toBe(true);
  expect(field.errors).toEqual(['ERROR']);

  field.reset();

  expect(state.data).toBe('test');
  expect(field.value).toBe('test');
  expect(field.isTouched).toBe(false);
  expect(field.isErrored).toBe(false);
  expect(field.errors).toEqual([]);

  // won't clear parent states
  expect(form.value).toBe(state);
  expect(form.isTouched).toBe(true);
  expect(form.isErrored).toBe(true);

  expect(onchange).toHaveBeenCalledTimes(1);
});

test('resets form', () => {
  const state = {
    data: 'test',
  };

  const onchange = jest.fn();
  const onerror = jest.fn();

  const form = createForm(state);
  const field = form.getField('data');

  form.onChange(onchange);
  form.onError(onerror);

  field.value = 'different';
  field.setErrors(['ERROR']);

  expect(state.data).toBe('different');
  expect(field.value).toBe('different');
  expect(field.isTouched).toBe(true);
  expect(field.isErrored).toBe(true);
  expect(field.errors).toEqual(['ERROR']);

  form.reset();

  // child fields are cleared
  expect(state.data).toBe('test');
  expect(field.value).toBe('test');
  expect(field.isTouched).toBe(false);
  expect(field.isErrored).toBe(false);
  expect(field.errors).toEqual([]);

  // form is cleared
  expect(form.value).toBe(state);
  expect(form.isTouched).toBe(false);
  expect(form.isErrored).toBe(false);

  expect(onchange).toHaveBeenCalledTimes(1);
});

test('gets same field value', () => {
  const state = {
    data: 'test',
  };

  const form = createForm(state);
  const field = form.getField('data');

  field.value = 'different';
  field.addError('ERROR');

  expect(field.value).toBe('different');
  expect(field.isTouched).toBe(true);
  expect(field.isErrored).toBe(true);

  // make sure it's pulling from cache
  const fieldAgain = form.getField('data');
  expect(fieldAgain).toBe(field); // def the same
  expect(fieldAgain.value).toBe('different');
  expect(fieldAgain.isTouched).toBe(true);
  expect(fieldAgain.isErrored).toBe(true);
  expect(fieldAgain.errors).toEqual(['ERROR']);
});

test('nested fields', () => {
  const state = {
    sub: {
      data: 'test',
    },
  };

  const onchange = jest.fn();

  const form = createForm(state);
  const sub = form.getField('sub');
  const field = sub.getField('data');

  form.onChange(onchange);

  field.value = 'different';

  expect(onchange).toHaveBeenCalledTimes(1);

  // field changed
  expect(field.value).toBe('different');
  expect(field.isTouched).toBe(true);

  // parent changed
  expect(sub.value.data).toBe('different');
  expect(sub.isTouched).toBe(true);

  // top level parent changed
  expect(form.value.sub.data).toBe('different');
  expect(form.isTouched).toBe(true);
});

test('adds and removes validations', () => {
  const state = {
    data: 'test',
  };

  const form = createForm(state);
  const field = form.getField('data');

  const error1Validation = jest.fn((f) => f.addError('ERROR1'));
  const error2Validation = jest.fn((f) => f.addError('ERROR2'));

  const unsub1 = field.onValidate(error1Validation);
  const unsub2 = field.onValidate(error2Validation);

  field.value = 'different';

  expect(field.value).toBe('different');
  expect(field.isTouched).toBe(true);
  expect(field.isErrored).toBe(false);
  expect(field.errors).toEqual([]);

  // validations require manual firing
  expect(field.validate()).toBe(false); // failed validation

  expect(error1Validation).toHaveBeenCalledTimes(1);
  expect(error2Validation).toHaveBeenCalledTimes(1);

  expect(field.errors).toEqual(['ERROR1', 'ERROR2']);
  expect(field.isErrored).toBe(true);

  field.reset();
  expect(field.value).toBe('test');
  expect(field.isTouched).toBe(false);
  expect(field.isErrored).toBe(false);
  expect(field.errors).toEqual([]);

  unsub2();

  // test validate from parent
  expect(form.validate()).toBe(false); // failed validation

  expect(error1Validation).toHaveBeenCalledTimes(2);
  expect(error2Validation).toHaveBeenCalledTimes(1); // unsub'd

  expect(field.isTouched).toBe(false);
  expect(field.isErrored).toBe(true);
  expect(field.errors).toEqual(['ERROR1']);
});
