# Source: https://puckeditor.com/docs/extending-puck/custom-fields

Extending Puck — Custom Fields

# Custom Fields

Puck can be extended with completely custom fields for different use-cases.

## Creating a custom field

Creating a custom field is possible using the `custom` field type:

Copy

```
const config = {
  components: {
    Example: {
      fields: {
        title: {
          type: "custom",
          render: ({ name, onChange, value }) => (
            <input
              defaultValue={value}
              name={name}
              onChange={(e) => onChange(e.currentTarget.value)}
              style={{ border: "1px solid black", padding: 4 }}
            />
          ),
        },
      },
      render: ({ title }) => {
        return <p>{title}</p>;
      },
    },
  },
};
```

