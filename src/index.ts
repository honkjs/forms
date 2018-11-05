/**
 * A form helper context.  Access to input helpers, context, and the model.
 */
export interface IFormContext<TContext, TModel> extends IFormHelper<TContext, TModel> {
  /**
   * Reference to the model representing this form
   */
  model: TModel;

  /**
   * General context passed to validators, onchange events, etc.
   * Can contain the model, errors, whatever necessary.
   */
  context: TContext;

  set: (mutate: (model: TModel) => void) => void;

  /**
   * Creates a form with the same context and onchange handler, but different model.
   * Useful to work with collections or sub-models.
   * Equivalent to:  createForm(newModel, oldForm.context, oldFormOnChange)
   */
  branch: <TBranchModel>(model: TBranchModel) => IFormContext<TContext, TBranchModel>;
}

/**
 * Form event binding helpers.
 *
 * @export
 * @interface IFormHelper
 * @template TContext
 * @template TModel
 */
export interface IFormHelper<TContext, TModel> {
  /**
   * Creates an input onchange binding for a model field.
   *
   * @template K
   * @param {K} field The field to bind to.
   * @param {((value: TModel[K], context: TContext) => void)[]} [validators] An optional array of validation functions.
   * @param {(e: Event) => TModel[K]} [converter] An optional convertor to parse the Event into the model value.  By default will use the 'type' field to parse correctly.
   * @returns {(e: Event) => void} Returns a function that can be bound to an input field.
   */
  input: <K extends keyof TModel>(
    field: K,
    validators?: ((value: TModel[K], context: TContext) => void)[],
    converter?: (e: Event) => TModel[K]
  ) => (e: Event) => void;
}

function validate<TContext, TTarget, K extends keyof TTarget>(
  context: TContext,
  target: TTarget,
  field: K,
  value: TTarget[K],
  validators?: ((value: TTarget[K], context: TContext) => void)[]
) {
  if (validators) {
    for (let i = 0; i < validators.length; i++) {
      validators[i](value, context);
    }
  }
  target[field] = value;
}

/**
 * Converts an input event value into the appropriate type
 * based on the target "type" field.
 */
function inputConverter(e: any) {
  if (!e.target.type || e.target.type === 'text') {
    return e.target.value;
  }

  if (e.target.type === 'number') {
    return parseInt(e.target.value);
  }
}

function createFormHelper<TContext, TModel>(
  model: TModel,
  context: TContext,
  onchange: (context: TContext) => void
): IFormHelper<TContext, TModel> {
  return {
    input: (field, validations, converter = inputConverter) => (e) => {
      validate(context, model, field, converter(e), validations);
      onchange(context);
    },
  };
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
  onchange: (context: TContext) => void
): IFormContext<TContext, TModel> {
  const helper = createFormHelper<TContext, TModel>(model, context, onchange);

  return {
    model,
    context,
    set: (mutate) => {
      mutate(model);
      onchange(context);
    },
    branch: (m) => createForm(m, context, onchange),
    ...helper,
  };
}
