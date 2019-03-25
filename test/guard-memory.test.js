const path = require('path')
const log = require('util').debuglog('egg-ssr-pages')
const test = require('ava')
const request = require('supertest')
const fs = require('fs-extra')

const {
  createServer,
  fixture
} = require('./fixtures/create')

process.env.EGG_SSR_PAGES_TYPE = 'memory'

let normal
let tmpFixture

test.before(async () => {
  const root = path.join(__dirname, '..', '..', 'egg-ssr-pages-test')
  tmpFixture = (...args) => path.join(root, 'normal', ...args)

  const dest = tmpFixture()

  await fs.remove(dest)
  await fs.ensureDir(dest)
  await fs.copy(fixture('normal'), dest)
  try {
    await fs.remove(tmpFixture('dist'))
  } catch (err) {
    /* eslint-disable no-console */
    console.warn('remove fails', err)
  }

  const {
    app
  } = await createServer(dest)

  normal = app
})

test.serial('memory: 404 page', async t => {
  await request(normal.callback())
  .get('/foo/bar')
  .expect(404)

  t.pass()
})

test.serial('memory: default setting', async t => {
  const {
    text
  } = await request(normal.callback())
  .get('/home/en')
  .expect(200)
  .expect('x-ssr-guard', 'no')

  log('response: %s', text)

  t.true(text.includes(JSON.stringify({lang: 'en'})))
})

test.serial('not found, but guard', async t => {
  await fs.remove(tmpFixture('pages', 'index.js'))

  const {
    text
  } = await request(normal.callback())
  .get('/home/en')
  .expect(200)
  .expect('x-ssr-guard', 'yes')

  t.true(text.includes(JSON.stringify({lang: 'en'})))
})

test.serial('no found, no guard', async t => {
  await request(normal.callback())
  .get('/home/cn')
  .expect(404)

  t.pass()
})