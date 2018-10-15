const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), 'env/.env') })

const secret = process.env.GITHUB_SECRET
const repo = process.env.REPO

const http = require('http')
const crypto = require('crypto')
const child_process = require('child_process')

let exec
http.createServer(function(req, res) {
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
        exec = child_process.exec('cd ' + repo + ' && git pull && npm i && npm start')
      }
    })
    res.end()
  })
  .listen(8080)
