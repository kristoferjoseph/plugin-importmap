# Architect importmap plugin 

## Install
`npm i plugin-importmap`

## Usage
Add `importmap` to the `@plugins` pragma in your `app.arc` file.
```
@plugins
importmap
```

Add an `@importmap` pragma to your `app.arc` file and declare the name and filepath of the files you want to make available to the browser.
```
@importmap
hello src/shared/hello.mjs
```
This will expose the `hello.mjs` file inside your handler at:
`import { hello } from '@architect/importmap/hello.mjs'`

The files will be bundled, fingerprinted and exposed in a map for sending to the browser here:
`import map from '@architect/importmap/browser/index.mjs'`

In the format:
```
export default {
  "hello": "/_importmap/hello-c63b938.mjs",
}
```
where the path is to the bundled and fingerprinted file.

Import the hello file in the browser
`<script src="/_importmap/hello-c63b938.mjs" type="module"></script>`