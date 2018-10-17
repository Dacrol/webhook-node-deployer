const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), 'env/.env') })

const secret = process.env.GITHUB_SECRET
const repo = process.env.REPO

const http = require('http')
const crypto = require('crypto')
const child_process = require('child_process')

let exec = pullAndStart(repo)
http
  .createServer(function(req, res) {
    req.on('data', function(chunk) {
      let signature =
        'sha1=' +
        crypto
          .createHmac('sha1', secret)
          .update(chunk.toString())
          .digest('hex')

      if (req.headers['x-hub-signature'] == signature) {
        if (exec) {
          exec.kill()
        }
        exec = pullAndStart(repo)
      }
    })
    res.end()
  })
  .listen(8080)

function pullAndStart(repo) {
  return child_process.exec('cd ' + repo + ' && git checkout -- . && git pull && npm i && npm start')
}
