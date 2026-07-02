<p align="center">
    <a href="https://croct.com">
        <img src="https://cdn.croct.io/brand/logo/repo-icon-green.svg" alt="Croct" height="80"/>
    </a>
    <br />
    <strong>Time Library</strong>
    <br />
    Additional date-time classes that complement the standard library.
</p>
<p align="center">
    <img alt="Build" src="https://github.com/croct-tech/time-js/actions/workflows/validate-branch.yaml/badge.svg" />
    <br />
    <br />
    <a href="https://github.com/croct-tech/value-object-js/releases">📦Releases</a>
        ·
        <a href="https://github.com/croct-tech/value-object-js/issues/new?labels=bug&template=bug-report.md">🐞Report Bug</a>
        ·
        <a href="https://github.com/croct-tech/value-object-js/issues/new?labels=enhancement&template=feature-request.md">✨Request Feature</a>
</p>

## Installation

Use the package manager [NPM](https://www.npmjs.com) to install the package:

```sh
npm install @croct/time
```

The package ships dual entry points for ESM and CommonJS consumers. ESM imports resolve to the `.js` bundle and CommonJS `require` calls resolve to the `.cjs` bundle, with matching TypeScript declarations for both formats.

## Contributing

Contributions to the package are always welcome!

- Report any bugs or issues on the [issue tracker](https://github.com/croct-tech/time-js/issues).
- For major changes, please [open an issue](https://github.com/croct-tech/time-js/issues) first to discuss what you would like to change.
- Please make sure to update tests as appropriate.

## Testing

Before running the test suites, the development dependencies must be installed:

```sh
npm install
```

Then, to run all tests:

```sh
npm run test
```

Run the following command to check the code against the style guide:

```sh
npm run lint
```

## Building

Before building the project, install the dependencies:

```sh
npm install
```

Then build the package:

```sh
npm run build
```

The build uses `tsup` to emit ESM `.js` bundles, CommonJS `.cjs` bundles, source maps, and TypeScript declarations in the `build/` directory.

To verify the published package layout locally:

```sh
npm run test:package
```

## Local development

To use a local development version on other projects, build the package and link it from the package root:

```sh
npm run build
npm link
```

Then on any other project that uses the library:

```sh
npm link @croct/time
```

## License

Copyright © 2015-2021 Croct Limited, All Rights Reserved.

All information contained herein is, and remains the property of Croct Limited. The intellectual, design and technical concepts contained herein are proprietary to Croct Limited s and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law. Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Croct Limited.
