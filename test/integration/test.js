const { join } = require('path')
const { existsSync } = require('fs')
const test = require('tape')
const { get } = require('tiny-json-http')
const sandbox = require('@architect/sandbox')
const port = 6661
const cwd = join(process.cwd(), 'test', 'mock')
const url = path => `http://localhost:${port}/${path}`

test('Start Sandbox', async t => {
  await sandbox.start({ cwd, port })
  t.pass('Started Sandbox')
  t.end()
})

test('should create importmap', async t => {
  const map = join(cwd, 'src', 'http', 'get-index', 'node_modules', '@architect', 'importmap', 'index.mjs')
  t.ok(existsSync(map), 'importmap exists')
  t.end()
})

test('exports correct', async t => {
  try {
    const result = await get({ url: url('_importmap/hello-c63b938.mjs') })
    const body = result.body
    t.ok(body, body)
    t.end()
  }
  catch (e) {
    t.fail(e)
    t.end()
  }
})

test('Shut down Sandbox', async t => {
  await sandbox.end()
  t.pass('Shut down Sandbox')
  t.end()
})