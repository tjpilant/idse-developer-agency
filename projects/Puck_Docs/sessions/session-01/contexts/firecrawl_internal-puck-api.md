# Source: https://puckeditor.com/docs/extending-puck/internal-puck-api

Extending Puck — Internal Puck API

# Internal Puck API

Puck exposes its internal API as `PuckApi` for extending Puck with custom functionality within custom fields, compositional interfaces or UI overrides.

## Accessing the internal API

You can access `PuckApi` via two hooks:

- `usePuck` - returns `PuckApi` as part of your component render lifecycle
- `useGetPuck` - returns a function to access the latest `PuckApi` at call time

