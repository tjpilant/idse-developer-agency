# Source: https://puckeditor.com/docs/extending-puck/field-transforms

Extending Puck — Field Transforms

# Field Transforms

Puck lets you modify props before rendering in the editor via the `FieldTransforms` API.

Use this API to implement custom rendering behavior for specific field types, which can be used to implement features such as inline text editing.

Field transforms only apply to components rendered in `<Puck>` and will not be applied to `<Render>`.

## Implementing a transform

Specify a transforms object for the fields you want to modify before rendering:

Copy

```
const fieldTransforms = {
  text: ({ value }) => <div>Value: {value}</div>, // Wrap all text field props in divs
};

const Example = () => <Puck fieldTransforms={fieldTransforms} />;
```

