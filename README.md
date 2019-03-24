[![Build Status](https://travis-ci.org/kaelzhang/egg-ssr-pages.svg?branch=master)](https://travis-ci.org/kaelzhang/egg-ssr-pages)
[![Coverage](https://codecov.io/gh/kaelzhang/egg-ssr-pages/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/egg-ssr-pages)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/egg-ssr-pages?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/egg-ssr-pages)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/egg-ssr-pages.svg)](http://badge.fury.io/js/egg-ssr-pages)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/egg-ssr-pages.svg)](https://www.npmjs.org/package/egg-ssr-pages)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/egg-ssr-pages.svg)](https://david-dm.org/kaelzhang/egg-ssr-pages)
-->

# egg-ssr-pages

Create [roe](https://github.com/kaelzhang/roe)/[egg](https://npmjs.org/package/egg) route definitions to host server-side rendered pages by using [next](https://npmjs.org/package/next)
or others.

By using `next`(the default renderer) as the renderer, your roe/egg application should has a `next` property on the instance.

## Install

```sh
$ npm i egg-ssr-pages
```

## Usage

app/router.js

```js
const nextPages = require('egg-ssr-pages')

module.exports = nextPages({
  pages: {
    // Then if we can access the index.js by
    //   visiting the page http://localhost:8888/en-US
    '/:lang': 'index.js'
  },
  cache: {
    maxAge: 0
  },
  guard: 'memory',

  // By default, it renders pages by using next
  // render: 'next'
})
```

## nextPage(options)

- **options** `Object`
  - **pages** `{[path: string]: PageDef | string}`
  - `...SSRConfig` the default ssr configurations

Returns a roe/egg router function which accepts `app` as the only one parameter.

### `SSRConfig` and `PageDef`

```ts
// So that we can override the default ssr configurations
interface PageDef extends OptionalSSRConfig {
  entry: string
}
```

```ts
type PreflightChecker = (app): Object | undefined throws Error

interface SSRenderer {
  precheck: PreflightChecker
  async render (ctx, pagePath): string throws Error
}

interface OptionalSSRConfig {
  // Disable CDN cache by setting to `false`,
  // Defaults to `false`
  cache?: CachePolicy | false
  // Set the `guard` to `false` to disable server-side guardians.
  // - GuardPolicy: your custom policy
  // - string: the name of built-in policies, for now it only supports `'memory'`
  // - `false`(the default value): turn off the guardians
  guard?: GuardPolicy | string | false
}

interface SSRConfig extends OptionalSSRConfig {
  // Method to render the page
  // - SSRenderer: your custom renderer
  // - string: the name of built-in renderers: 'next'
  // Defaults to `'next'`
  renderer: SSRenderer | string
}
```

```ts
interface CachePolicy {
  // max-age of cache-control in milliseconeds
  maxAge: number
}
```

```ts
interface GuardPolicy {
  // Preflight checking to see
  //   if the `app` (roe/egg instance) meets certain requirements.
  //   if not, an error could be thrown inside this function.
  // If the function returns an object,
  //   then the object will be used to extend the koa context object,
  //   so that we can access them from all methods below.
  precheck? (app): Object | undefined throws Error

  // Generates the cache key
  key (ctx): string

  // If this function is rejected or returns `false`
  // then it will goes into `fallback`
  async validateSSRResult? (ctx, key, html, time): boolean throws Error

  // If `render` method has been invoked and validated successfully,
  //    `onSuccess` will be called and skip all the following.
  // Most usually, all logic inside `onSuccess` should be catched,
  //   or if there is an error or rejection,
  //   it will goes to `fallback`
  async onSuccess? (ctx, key, html): void

  // If `fallback` succeeded to return a string,
  //   the string will be used instead of the return value of `render`
  async fallback (ctx, key, error): string throws Error
```

- **ctx** `KoaContext` the koa context, if `precheck` returns an object, then it will be the extended koa context which has the return value as its own properties
- **key** `string` the key generated by `GuardPolicy::key`
- **html** `string` the html content which rendered by `SSRConfig::render`
- **time** `number` the milliseconds how much the renderer takes to render the page

### Override default `SSRConfig` for a certain pagePath

```js
module.exports = nextPages({
  pages: {
    '/:lang': 'index.js',

    // We can override a certain property `SSRConfig` by
    //   defining a new value in each `PageDef`
    '/about': {
      entry: 'about.js',
      cache: {
        // http://localhost:8888/about
        // -> max-age: 1h
        maxAge: 60 * 60 * 1000
      }
    }
  },
  cache: {
    maxAge: 0
  },
  guard: 'memory'
})
```

## License

MIT
