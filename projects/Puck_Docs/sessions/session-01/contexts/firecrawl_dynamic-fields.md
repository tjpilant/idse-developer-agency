# Source: https://puckeditor.com/docs/integrating-puck/dynamic-fields

Integrating Puck — Dynamic Fields

# Dynamic Fields

Dynamic field resolution allows you to change the field configuration for a component based on the current component props.

## Dynamic component fields

The `resolveFields` function allows you to make synchronous and asynchronous changes to the field configuration.

Copy

```
const config = {
  components: {
    MyComponent: {
      resolveFields: (data) => {
        const fields = {
          drink: {
            type: "radio",
            options: [\
              { label: "Water", value: "water" },\
              { label: "Orange juice", value: "orange-juice" },\
            ],
          },
        };

        if (data.props.drink === "water") {
          return {
            ...fields,
            waterType: {
              // ... Define field
            },
          };
        }

        return fields;
      },
      // ...
    },
  },
};
```

