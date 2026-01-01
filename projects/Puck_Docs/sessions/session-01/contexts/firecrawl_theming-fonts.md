# Source: https://puckeditor.com/docs/extending-puck/theming/fonts

Extending Puck — Theming: Fonts

# Fonts

Puck uses the Inter typeface family by default, loaded via a CDN. You can change the font or host Inter locally by using the `no-external.css` bundle.

## Load your own font file

Use the `no-external.css` instead of the primary bundle:

Copy

```
/* @import "@measured/puck/puck.css"; */
@import "@measured/puck/no-external.css";
```

