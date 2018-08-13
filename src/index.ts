import { Publisher, IUnsubscribe } from '@honkjs/publisher';

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

  private validateEvent = new Publisher<FieldEvent<T>>();
  private changeEvent = new Publisher<FieldEvent<T>>();
  private errorEvent = new Publisher<FieldEvent<T>>();

  constructor(private access: IFormFieldAccessors<T>) {
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
    this.isModified = true;
    this.access.setState(value);
    this.changeEvent.publish(this);
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

  getField<K extends keyof T>(key: K): FormField<T[K]> {
    if (this.children[key]) {
      return this.children[key];
    }

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

  reset() {
    // reset this field
    // if this is an object, this won't do much.
    this.access.setState(this.initialValue);

    // then child fields
    for (let k of Object.keys(this.children)) {
      this.children[k].reset();
    }

    this.hasErrors = false;
    this.isModified = false;
    this.errorMessages = [];

    // should reset trigger an onchange?
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
