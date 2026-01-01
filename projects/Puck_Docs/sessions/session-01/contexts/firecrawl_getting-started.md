# Source: https://puckeditor.com/docs/getting-started

[**🐟 Puck AI 0.4:** Follow UI stream →](https://puckeditor.com/blog/puck-ai-04)

[Puck](https://puckeditor.com/ "Puck")

[Join AI waiting list](https://cloud.puckeditor.com/sign-up) [Login](https://cloud.puckeditor.com/login)

`CTRL K`

- [10.3k](https://github.com/puckeditor/puck)

[Login](https://cloud.puckeditor.com/login) [Join AI waiting list](https://cloud.puckeditor.com/sign-up)

`CTRL K`

Toggle menu

Menu

Puck AI closed beta

[Read docs](https://puckeditor.com/docs/ai/overview)

# Getting Started

## Installation [Permalink for this section](https://puckeditor.com/docs/getting-started\#installation)

Install the package

npmpnpmyarnbun

Copy

```
npm i @measured/puck --save
```

Copy

```
pnpm add @measured/puck
```

Copy

```
yarn add @measured/puck
```

Copy

```
bun add @measured/puck
```

Or generate a Puck application using a [recipe](https://github.com/measuredco/puck#recipes)

Copy

```
npx create-puck-app my-app
```

## Render the editor [Permalink for this section](https://puckeditor.com/docs/getting-started\#render-the-editor)

Copy

```
import { Puck } from "@measured/puck";
import "@measured/puck/puck.css";

// Create Puck component config
const config = {
  components: {
    HeadingBlock: {
      fields: {
        children: {
          type: "text",
        },
      },
      render: ({ children }) => {
        return <h1>{children}</h1>;
      },
    },
  },
};

// Describe the initial data
const initialData = {};

// Save the data to your database
const save = (data) => {};

// Render Puck editor
export function Editor() {
  return <Puck config={config} data={initialData} onPublish={save} />;
}
```

## Render the page [Permalink for this section](https://puckeditor.com/docs/getting-started\#render-the-page)

Copy

```
import { Render } from "@measured/puck";

export function Page() {
  return <Render config={config} data={data} />;
}
```

[Previous\\
\\
Introduction](https://puckeditor.com/docs) [Next\\
\\
Component Configuration](https://puckeditor.com/docs/integrating-puck/component-configuration)

Resources

- [Docs](https://puckeditor.com/docs)
- [Live Demo](https://demo.puckeditor.com/edit)
- [Blog](https://puckeditor.com/blog)
- [Releases](https://github.com/puckeditor/puck/releases)

Products

- [Coming soon](https://puckeditor.com/docs/getting-started#)

Services

- [Coming soon](https://puckeditor.com/docs/getting-started#)

Social

- [GitHub](https://github.com/puckeditor/puck)
- [Discord](https://discord.gg/D9e4E3MQVZ)
- [Twitter](https://x.com/puckeditor)
- [Bluesky](https://bsky.app/profile/puckeditor.com)
