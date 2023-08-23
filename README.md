# Trilium ETAPI (TEPI)

A Node.js wrapper around the ETAPI for [Trilium Notes](https://github.com/zadam/trilium). The library will continue to match the *stable* release of Trilium and release updates as needed.

## Installation

```sh
npm install trilium-etapi
```

## Usage

```js
// tepi = Trilium Etapi Programming Interface
import tepi from "trilium-etapi";

tepi.server("https://my.trilium.com:8080/etapi").token(process.env.TRILIUM_TOKEN);
tepi.getNoteById("root").then(console.log).catch(console.error);
```

## Documentation

Documentation is available on [GitHub Pages](https://rauenzi.github.io/trilium-etapi) built with [TypeDoc](https://typedoc.org)!

## Links

Check out my other Trilium-based projects:
- [Trilium Markdown Preview](https://github.com/rauenzi/Trilium-MarkdownPreview/)
- [Trilium Breadcrumbs](https://github.com/rauenzi/Trilium-Breadcrumbs)
- [Trilium Types](https://github.com/rauenzi/trilium-types)

Want more? Be sure to check out the [Awesome Trilium](https://github.com/Nriver/awesome-trilium) list!