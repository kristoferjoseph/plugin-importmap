const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { build } = require('esbuild')

const set = {
  http () {
    return {
      method: 'get',
      path: '/_importmap/*',
      src: path.join(__dirname, 'http', 'get-_importmap')
    }
  }
}

const sandbox = {
  async start ({ arc, inventory }) {
    await verify(arc)
    await bundle(arc, inventory.inv)
  }
}

const deploy = {
  async start({ arc, cloudformation, dryRun, inventory, stage }) {
    await verify(arc)
    await bundle(arc, inventory.inv)
    return cloudformation // no need to modify cfn because set.http above did that
  }
}

/**
 * verify the @importmap is valid
 */
async function verify(arc, inventory) {
  if (Array.isArray(arc.importmap) === false)
    throw Error('missing or invalid @importmap pragma')
  for (let tuple of arc.importmap) {
    if (Array.isArray(tuple)) {
      // check the key is a valid identifier string and the value is a string that resolves to a file
      let key = tuple[0]
      if (typeof key != 'string')
        throw Error('invalid @importmap key ' + key)
      let val = tuple[1]
      if (typeof key != 'string')
        throw Error('invalid @importmap value for ' + key)
    }
    else {
      throw Error('invalid @importmap')
    }
  }
}

/**
 * run esbuild to generate the @importmap code
 */
async function bundle(arc, inventory) {
  for (let name of inventory.lambdaSrcDirs) {
    let lambda = inventory.lambdasBySrcDir[name]
    if (lambda.method && lambda.method.toLowerCase() === 'get') {

      // create @architect/importmap
      let pathToImportMap = path.join(lambda.src, 'node_modules', '@architect', 'importmap')
      fs.mkdirSync(pathToImportMap, { recursive: true })

      for (let [name, pathToFile] of arc.importmap) {
        let entry = path.join(inventory._project.cwd, pathToFile)

        // create @architect/importmap/entry for node usage
        await build({
          entryPoints: [entry],
          bundle: true,
          platform: 'node',
          format: 'esm',
          outfile: path.join(pathToImportMap, `${ name }.mjs`),
        })

        // create @architect/importmap/browser/entry for browser usage
        await build({
          entryPoints: [entry],
          bundle: true,
          format: 'esm',
          outfile: path.join(pathToImportMap, 'browser', `${ name }.mjs`),
        })
      }

      // create @architect/importmap/index.mjs for node manifest
      let pathToIndex = path.join(pathToImportMap, 'index.mjs')
      let js = ''
      for (let [name] of arc.importmap)
        js += `export * as ${name} from "./${name}.mjs";\n`
      fs.writeFileSync(pathToIndex, js)

      // create @architect/browser/index.mjs for browser manifest
      let mjs = 'export default {\n'
      for (let [name] of arc.importmap) {
        let pathToBrowserFile = path.join(pathToImportMap, 'browser', `${ name }.mjs`)
        let raw = fs.readFileSync(pathToBrowserFile).toString()
        let hash = crypto.createHash('md5').update(raw).digest('hex').substr(0, 7)
        mjs += `  "${name}": "/_importmap/${name}-${hash}.mjs",\n`
      }
      mjs += '}'
      let pathToBrowserIndex = path.join(pathToImportMap, 'browser', `index.mjs`)
      fs.writeFileSync(pathToBrowserIndex, mjs)
    }
  }
}

module.exports = { set, sandbox, deploy }