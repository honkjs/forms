<div>
  <!-- npm -->
  <a href="https://www.npmjs.com/package/@honkjs/forms">
    <img src="https://img.shields.io/npm/v/@honkjs/forms.svg?style=flat-square" alt="npm version" />
  </a>
  <!--  dependencies -->
  <a href="https://david-dm.org/honkjs/forms">
    <img src="https://david-dm.org/honkjs/forms.svg?style=flat-square" alt="dependency status" />
  </a>
  <!-- dev dependencies  -->
  <a href="https://david-dm.org/honkjs/forms&type=dev">
    <img src="https://david-dm.org/honkjs/forms/dev-status.svg?style=flat-square" alt="dev dependency status" />
  </a>
  <!-- coverage -->
  <a href="https://codecov.io/github/honkjs/forms">
    <img src="https://img.shields.io/codecov/c/github/honkjs/forms/master.svg?style=flat-square" alt="test coverage" />
  </a>
  <!-- build -->
  <a href="https://travis-ci.org/honkjs/forms">
    <img src="https://img.shields.io/travis/honkjs/forms/master.svg?style=flat-square" alt="build status" />
  </a>
</div>

# honkjs/forms

A helper for keeping track of a forms model state changes.

An experiment originally designed for use with [choo](https://github.com/choojs/choo).

```
npm install @honkjs/forms
```

# Basics

```ts
import { createForm, bindInput } from '@honks/forms';

// the model is any basic object
const myModel = {
  name: 'Kel',
  items: [{ id: 0, description: 'cool item' }, { id: 1, description: 'another cool item' }],
};

// the context is where you store meta information about your model like validation errors.
const context = { errors: [] };

function onFormChange(form) {
  // do things when the form changes
}

// the form helper takes a model, context, and an onchange event handler
const form = createForm(myModel, context, onFormChange);

// All the real magic is in the bind helpers
// bindInput attaches the onchange event to the form based on the field name
// with typescript, the 'name' is only valid if the field exists on the model
export function editorForm(form) {
  return html`
    <form>
      <input
        type="text"
        value=${form.model.Name || ''}
        onchange=${bindInput(form, 'name')}
        placeholder="Name" required=true />
    </form>`;
}
```

# Validation

The bind helpers take an optional array of 'validators'.

```ts
function myValidator(value, fieldName, form) {
  if (!value) {
    // there's no requirement in how these work
    // track errors and form info anyway you need to
    form.context.errors.push('Name is required!');

    // by default, the model value will be changed
    // after all validators are ran.
    // throw an error if that's undesired.
  }
}

bindInput(form, 'name', [myValidator]
```

# Converters

Similar to validators, you can create a custom input converter. (By default it makes a best 'guest' based on the input field type)

```ts
function myConverter(event) {
  // do any magic necessary to pull your value from the input event
  return event.target.value;
}

bindInput(form, 'name', [], myConverter);
```
