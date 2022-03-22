import map from '@architect/importmap/browser/index.mjs'
import fs from 'fs'
import path from 'path'
import url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export async function handler (req) {
  let reverse = {}
  for (let key in map)
    reverse[map[key]] = key

  if (Object.keys(reverse).includes(req.rawPath) === false) {
    return {
      statusCode: 404,
      body: {errors:['not_found: ' + req.rawPath]}
    }
  }

  let base = path.join(__dirname, 'node_modules', '@architect', 'importmap', 'browser')
  let pathToFile = path.join(base, reverse[req.rawPath] + '.mjs')

  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/javascript; charset=utf8'
    },
    body: fs.readFileSync(pathToFile).toString()
  }
}
