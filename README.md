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

An experiment originally designed for [choo](https://github.com/choojs/choo).

```
npm install @honkjs/forms
```

# Basics

```ts
// the context is where you store meta information about your model like validation errors.
// we're also going to add a reference to the actual model so it's available later.
const context = { errors: [], model: myModel };

function onFormChange(ctx) {
  // do things when the form changes
  // note: only the context is available
}

// the form helper takes a model, context, and an onchange event handler
const form = createForm(myModel, context, onFormChange);

form.set((m) => (m.Name = 'fargles'));
const fname = form.helper.input('Name', validations))

// and here's an example of a form being used to bind to a model
export function editorForm(form) {
  return html`
    <form>
      <input
        type="text"
        value=${form.model.Name || ''}
        onchange=${form.input('Name')}
        placeholder="Name" required=true />
    </form>`;
}

// create a form with the same context and change event as the parent form
const itemForm = form.branch(myModel.items[0]);
```
