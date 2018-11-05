/**
 * A form helper context.  Access to the context data, model, setter.
 */
export interface IFormContext<TContext, TModel> {
  /**
   * Reference to the model representing this form
   */
  model: TModel;

  /**
   * General context passed to validators, onchange events, etc.
   * Can contain errors or whatever is necessary.
   */
  context: TContext;

  set: (mutate: (model: TModel) => void) => void;

  onchange: (form: IFormContext<TContext, TModel>) => void;
}

/**
 * Creates a form context for the specific model.
 *
 * @param model The data model to work with.
 * @param context The context passed to validation, onchange functions.
 * @param onchange The function to call whenever a form is changed by a form helper.
 */
export function createForm<TModel, TContext>(
  model: TModel,
  context: TContext,
  onchange: (form: IFormContext<TContext, TModel>) => void
): IFormContext<TContext, TModel> {
  const form: IFormContext<TContext, TModel> = {
    model,
    context,
    onchange,
    set: (mutate) => {
      mutate(model);
      onchange(form);
    },
  };

  return form;
}

export interface IFormFieldValidator<TContext, TModel, K extends keyof TModel> {
  (value: TModel[K], field: K, form: IFormContext<TContext, TModel>): void;
}

export function bindInput<TContext, TModel, K extends keyof TModel>(
  form: IFormContext<TContext, TModel>,
  field: K,
  validators?: IFormFieldValidator<TContext, TModel, K>[],
  converter: (e: Event) => TModel[K] = inputConverter
) {
  return (e: Event) => {
    const val = converter(e);
    validate(form, field, val, validators);
    form.set((m) => (m[field] = val));
  };
}

function validate<TContext, TModel, K extends keyof TModel>(
  form: IFormContext<TContext, TModel>,
  field: K,
  value: TModel[K],
  validators?: IFormFieldValidator<TContext, TModel, K>[]
) {
  if (validators) {
    for (let i = 0; i < validators.length; i++) {
      validators[i](value, field, form);
    }
  }
}

/**
 * Converts an input event value into the appropriate type
 * based on the target "type" field.
 */
function inputConverter(e: any) {
  if (e.target.type === 'number') {
    return parseInt(e.target.value);
  } else {
    return e.target.value;
  }
}
