export interface IFieldEvent<T> {
  <K extends keyof T>(field: FormField<T>, child?: FormField<T[K]>): void;
}

export interface IFormFieldAccessors<T> {
  getState: () => T;
  setState: (val: T) => void;
  onChange: IFieldEvent<T>;
  onError: IFieldEvent<T>;
}

export class FormField<T> {
  private errorMessages: string[] = [];
  private children: any = {};
  private hasErrors = false;
  private isModified = false;
  initialValue: T;

  constructor(private access: IFormFieldAccessors<T>) {
    this.initialValue = access.getState();
  }

  private getFieldValue<K extends keyof T>(key: K): T[K] {
    return this.access.getState()[key];
  }

  private setFieldValue<K extends keyof T>(key: K, value: T[K]): void {
    this.isModified = true;
    const state = this.access.getState();
    state[key] = value;
  }

  set value(value: T) {
    this.isModified = true;
    this.access.setState(value);
  }

  get value() {
    return this.access.getState();
  }

  get errors() {
    return this.errorMessages;
  }

  set errors(errors: string[]) {
    if (errors && errors.length > 0) {
      this.hasErrors = true;
      this.errorMessages = errors;
      this.access.onError(this);
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
      this.access.onError(this);
    } else {
      this.errorMessages = [];
    }
  }

  set isTouched(touched: boolean) {
    this.isModified = touched;
    if (touched) {
      this.access.onChange(this);
    }
  }

  get isTouched() {
    return this.isModified;
  }

  getField<K extends keyof T>(key: K): FormField<T[K]> {
    if (this.children[key]) {
      return this.children[key];
    }

    const access: IFormFieldAccessors<T[K]> = {
      getState: () => this.getFieldValue(key),
      setState: (val) => {
        this.setFieldValue(key, val);
        this.access.onChange(this, field);
      },
      onError: (field, child) => {
        this.hasErrors = true;
        this.access.onError(this, field);
      },
      onChange: (field, child) => {
        this.isModified = true;
        this.access.onChange(this, field);
      },
    };

    const field = new FormField<T[K]>(access);
    this.children[key] = field;
    return field;
  }

  reset() {
    // note: if this is an object, won't do much
    this.access.setState(this.initialValue);

    // but these should fix it.
    for (let k of Object.keys(this.children)) {
      this.children[k].reset();
    }

    // this will fire onchange a bunch
    // so still need to clear these after.
    this.hasErrors = false;
    this.isModified = false;
    this.errorMessages = [];
  }
}

function emptyEvent() {}

/**
 * Creates a form from the specified state data.
 *
 * @export
 * @template T The type of state
 * @param {T} state The initial state (will be mutated)
 * @param {IFieldEvent<T>} [onChanged] The data was changed event.
 * @param {IFieldEvent<T>} [onErrored] A field had an error.
 * @returns {FormField<T>} The formfield to access this form data.
 */
export function createForm<T>(
  state: T,
  onChange: IFieldEvent<T> = emptyEvent,
  onError: IFieldEvent<T> = emptyEvent
): FormField<T> {
  let value = state;

  // forms events are slightly different than their fields
  // so we build out the accessors differently.
  const access: IFormFieldAccessors<T> = {
    getState: () => value,
    setState: (val) => (value = val),
    onChange,
    onError,
  };

  return new FormField(access);
}
