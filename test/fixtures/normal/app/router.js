/* eslint-disable import/no-unresolved */
const ssr = require('egg-ssr-pages')

const normal = () => ssr({
  '/home/:lang': 'index'
}, {

})

const memory = () => ssr({
  '/home/:lang': 'index',
  '/not-exists': {
    entry: 'not-exists'
  }
}, {
  guard: ssr.memoryGuardian({
    max: 1
  })
})

const invalid_builtin_renderer = () => ssr({}, {
  renderer: 'blah'
})

const no_renderer_precheck = () => ssr({
  '/home/:lang': 'index'
}, {
  renderer: {
    render () {
      return 'no-precheck'
    }
  }
})

const error_fallback = () => ssr({
  '/home/:lang': 'index'
}, {
  renderer: {
    render () {
      throw new Error('error')
    }
  },
  guard: {
    key () {
      return 'foo'
    },
    fallback (ctx, key, html, error) {
      if (
        error.message === 'error'
        && key === 'foo'
        && html === undefined
      ) {
        return 'fallback'
      }

      throw new Error('test fails')
    }
  }
})

let counter = 0

const memory_fallback = () => ssr({
  '/home/:lang': 'index'
}, {
  renderer: {
    render () {
      if (counter === 0) {
        counter ++
        return 'foo'
      }

      throw new Error('bar')
    }
  },

  guard: ssr.memoryGuardian({
    max: 1
  })
})

const invalid_renderer_precheck = () => ssr({}, {
  renderer: {
    // invalid
    precheck: true,
    render () {}
  }
})

const invalid_renderer_render = () => ssr({}, {
  renderer: {
    // invalid
    render: true
  }
})

const invalid_guard_fallback = () => ssr({}, {
  guard: {
    key () {
      return 'foo'
    },
    fallback: true
  }
})

const invalid_renderer = () => ssr({}, {
  renderer: null
})

const invalid_guard = () => ssr({}, {
  guard: 'haha'
})

const TYPES = {
  normal,
  memory,
  invalid_builtin_renderer,
  no_renderer_precheck,
  error_fallback,
  memory_fallback,
  invalid_renderer_precheck,
  invalid_renderer_render,
  invalid_guard_fallback,
  invalid_renderer,
  invalid_guard
}

const type = process.env.EGG_SSR_PAGES_TYPE || 'normal'

module.exports = TYPES[type]()
