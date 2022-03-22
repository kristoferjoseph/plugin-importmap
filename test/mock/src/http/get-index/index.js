import { hello } from '@architect/importmap/hello.mjs'
import map from '@architect/importmap/browser/index.mjs'

export async function handler () {
  let msg = 'hi from whatever'
  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/html; charset=utf8'
    },
    body: `<!doctype html>
<html>
<body>
${ await hello(msg) }
</body>
<script type=module>
import { hello } from '${map.hello}'
console.log(await hello("${ msg }"))
</script>
</html>`
  }
}