import { Publisher } from '@honkjs/publisher';

/**
 * A form field event.
 */
export type FieldEvent<T> = <K extends keyof T>(field: FormField<T>, child?: FormField<T[K]>) => void;

/**
 * Getting and setting the value of a field
 */
export interface IFormFieldAccessors<T> {
  getState: () => T;
  setState: (val: T) => void;
}

/**
 * Describes a field of a form.
 */
export class FormField<T> {
  private errorMessages: string[] = [];
  private children: any = {};
  private hasErrors = false;
  private isModified = false;
  private initialValue: T;

  protected validateEvent = new Publisher<FieldEvent<T>>();
  protected changeEvent = new Publisher<FieldEvent<T>>();
  protected errorEvent = new Publisher<FieldEvent<T>>();

  constructor(protected access: IFormFieldAccessors<T>) {
    this.initialValue = access.getState();
  }

  private getFieldValue<K extends keyof T>(key: K): T[K] {
    return this.access.getState()[key];
  }

  private setFieldValue<K extends keyof T>(key: K, value: T[K]): void {
    const state = this.access.getState();
    state[key] = value;
  }

  set value(value: T) {
    this.access.setState(value);
    this.isTouched = true;
  }

  get value() {
    return this.access.getState();
  }

  get errors(): ReadonlyArray<string> {
    return this.errorMessages;
  }

  addError(err: string) {
    this.setErrors([...this.errors, err]);
    this.errorEvent.publish(this);
  }

  setErrors(errors: Array<string>) {
    if (errors && errors.length > 0) {
      this.hasErrors = true;
      this.errorMessages = errors;
      this.errorEvent.publish(this);
    } else {
      this.hasErrors = false;
      this.errorMessages = [];
    }
  }

  get isErrored() {
    return this.hasErrors;
  }

  set isErrored(errored: boolean) {
    this.hasErrors = errored;
    if (errored) {
      this.errorEvent.publish(this);
    } else {
      this.errorMessages = [];
    }
  }

  set isTouched(touched: boolean) {
    this.isModified = touched;
    if (this.isModified) {
      this.changeEvent.publish(this);
    }
  }

  get isTouched() {
    return this.isModified;
  }

  onValidate(handler: (field: FormField<T>) => boolean) {
    return this.validateEvent.subscribe(handler);
  }

  onError(handler: (field: FormField<T>) => boolean) {
    return this.errorEvent.subscribe(handler);
  }

  onChange(handler: (field: FormField<T>) => boolean) {
    return this.changeEvent.subscribe(handler);
  }

  validate() {
    // validate any children first
    for (let k of Object.keys(this.children)) {
      this.children[k].validate();
    }

    // then self
    this.validateEvent.publish(this);

    return !this.isErrored;
  }

  getFieldCollection<K extends keyof T>(key: K): FormFieldCollectionType<T[K]>;

  getFieldCollection<K extends keyof T>(key: K) {
    const child = this.children[key];
    if (child && child instanceof FormFieldCollection) {
      return child;
    }

    const access: IFormFieldAccessors<T[K]> = {
      getState: () => this.getFieldValue(key),
      setState: (val) => this.setFieldValue(key, val),
    };

    if (access.getState() instanceof Array) {
      const collection = new FormFieldCollection(access as any);
      this.children[key] = collection;
      return collection;
    }
  }

  private createField<K extends keyof T>(key: K): FormField<T[K]> {
    const access: IFormFieldAccessors<T[K]> = {
      getState: () => this.getFieldValue(key),
      setState: (val) => this.setFieldValue(key, val),
    };

    const field = new FormField<T[K]>(access);
    field.errorEvent.subscribe((f) => {
      this.hasErrors = true;
      this.errorEvent.publish(this, f);
    });
    field.changeEvent.subscribe((f) => {
      this.isModified = true;
      this.changeEvent.publish(this, f);
    });

    this.children[key] = field;
    return field;
  }

  getField<K extends keyof T>(key: K): FormField<T[K]> {
    if (this.children[key]) {
      return this.children[key];
    }

    const field = this.createField(key);
    this.children[key] = field;
    return field;
  }

  reset(suppressOnChange: boolean = false) {
    // reset this field
    // if this is an object, this won't do much.
    this.access.setState(this.initialValue);

    // then child fields
    for (let k of Object.keys(this.children)) {
      this.children[k].reset(true);
    }

    this.hasErrors = false;
    this.isModified = false;
    this.errorMessages = [];

    // reset triggers if you ask nicely
    if (!suppressOnChange) {
      this.changeEvent.publish(this);
    }
  }
}

export type FormFieldCollectionType<T> = T extends (infer U)[] ? FormFieldCollection<U> : undefined;

export class FormFieldCollection<TItem> extends FormField<TItem[]> {
  private collection: ReadonlyArray<FormField<TItem>> = [];

  constructor(access: IFormFieldAccessors<TItem[]>) {
    super(access);
    this.buildCollection(access.getState());
  }

  private buildCollection(items: TItem[]) {
    this.collection = items.map(() => this.createFormFieldItem());
  }

  private createFormFieldItem() {
    // creates a proxy to the matching index of the parent array
    // wonky: yes, works: maybe
    const getState = (): TItem => {
      const index = this.indexOf(field);
      return this.access.getState()[index];
    };
    const setState = (state: TItem) => {
      // immutable update
      const index = this.indexOf(field);
      const values = this.value.map((item, i) => {
        if (i != index) {
          return item;
        } else {
          return state;
        }
      });
      this.access.setState(values);
      this.isTouched = true;
    };

    const field = new FormField({ getState, setState });
    return field;
  }

  get fields(): ReadonlyArray<FormField<TItem>> {
    return this.collection;
  }

  set fields(fields: ReadonlyArray<FormField<TItem>>) {
    this.collection = fields;
    this.access.setState(fields.map((f) => f.value));
    this.isTouched = true;
  }

  indexOf(item: FormField<TItem>) {
    return this.collection.indexOf(item);
  }

  get value() {
    return this.access.getState();
  }

  set value(values: TItem[]) {
    this.buildCollection(values);
    this.access.setState(values);
    this.isTouched = true;
  }

  remove(index: number) {
    this.collection = this.collection.slice().splice(index, 1);
    const values = this.collection.map((item) => item.value);
    this.access.setState(values);
    this.isTouched = true;
  }

  insert(item: TItem, index?: number) {
    let items = this.value.slice();
    const fields = this.collection.slice();
    const field = this.createFormFieldItem();

    if (!index || index < 0) {
      items.push(item);
      fields.push(field);
      this.collection = fields;
    } else {
      items = items.splice(index, 0, item);
      this.collection = fields.splice(index, 0, field);
    }

    // now set the parent
    this.access.setState(items);
    this.isTouched = true;
  }
}

/**
 * Creates a form from the specified state data.
 *
 * @export
 * @template T The type of state
 * @param {T} state The initial state (will be mutated)
 * @param {FieldEvent<T>} [onChanged] The data was changed event.
 * @param {FieldEvent<T>} [onErrored] A field had an error.
 * @returns {FormField<T>} The formfield to access this form data.
 */
export function createForm<T>(state: T): FormField<T> {
  let value = state;

  // forms events are slightly different than their fields
  // so we build out the accessors differently.
  const access: IFormFieldAccessors<T> = {
    getState: () => value,
    setState: (val) => (value = val),
  };

  return new FormField(access);
}

// export { FormField, FormFieldCollection, createForm };

const test = {} as FormFieldCollection<any>;
test.value = [];
