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

```
npm install @honkjs/forms
```

# Basics

createForm

getting and setting field values

getting and setting errors

getting and setting touch state

reset

# nested forms

# lists/arrays

add/remove
reorder

```ts
// id selectors are ... problematic?
const form = createForm({
  data: 'test',
  items: [
    { id: 355, data: 'item355' },
    { id: 101, data: 'item101' }
  ]
});

// does not _require_ an id selector.
// by default it will use the item data ref.
const itemFields = form.getFields('items', (i) => i.id);

// adds a new field value
const f = itemFields.add(data: T);

// gets a collection for mapping, etc.
itemFields.values.map();

// will use ref/id comparison to update existing fields, add new ones, etc.
itemFields.values = [];

// select by id, index?
itemFields.getById(index);
itemFields.getByIndex(index);

// useful for reordering
itemFields.indexOf(f);

itemFields.reorder(f, index);

// have to have the field.
// needs to unhook events
itemFields.remove(f);
```

# using with choo/html example
