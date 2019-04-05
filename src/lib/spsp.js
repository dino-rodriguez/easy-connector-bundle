const BtpPlugin = require('ilp-plugin-btp')
const { Server } = require('ilp-protocol-stream')
const Koa = require('koa')
const crypto = require('crypto')
const logger = require('riverpig')('ecb:spsp')

async function startSPSPServer (opts) {
  if (!opts.plugin) throw Error('plugin required to connect to connector')
  if (!opts.port) throw Error('port required')

  await opts.plugin.connect()
  logger.info(`Connecting to connector..`)

  const streamServer = new Server({
    plugin: opts.plugin,
    serverSecret: crypto.randomBytes(32)
  })

  streamServer.on('connection', connection => {
    connection.on('stream', stream => {
      stream.setReceiveMax(10000000000000)
      stream.on('money', amount => {
        logger.debug('Receieved packet for amount ' + amount)
      })
    })
  })

  await streamServer.listen()
  logger.info('STREAM receiver listening..')

  let details = null
  async function handleSPSP (ctx, next) {
    if (ctx.get('Accept').indexOf('application/spsp4+json') !== -1) {
      details = streamServer.generateAddressAndSecret()

      ctx.body = {
        destination_account: details.destinationAccount,
        shared_secret: details.sharedSecret.toString('base64')
      }
      ctx.set('Content-Type', 'application/spsp4+json')
      ctx.set('Access-Control-Allow-Origin', '*')
    } else {
      ctx.res.statusCode = 200
    }
  }

  const httpServer = new Koa()
  httpServer
    .use(handleSPSP)
    .listen(opts.port)
  logger.info(`SPSP server listening on port ${opts.port}..`)
}

module.exports = startSPSPServer 
