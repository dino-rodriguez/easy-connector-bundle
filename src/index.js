const logger = require('riverpig')('ilp-node:index')
const { runConnector } = require('./lib/connector')
const { runGui } = require('./lib/gui')
const { runServer } = require('./lib/spsp')
const { pay } = require('./lib/pay')
const { spawn } = require('child_process')
const RedisServer = require('redis-server')

async function run () {
  const env = 'test'
  const opts = {
    env,
    name: 'connector',
    adminApiPort: 7769,
    redisPort: 6379,
    http: {
      incomingPort: 2000,
      outgoingPort: 2001
    },
    miniAccounts: {
      port: 3000 
    },
    xrp: {
      port: 2002,
      address: 'rbnfJCKJ8AUgg96WE9bAjCmvm2k5DbVv2',
      secret: 'ssui88vyCJ1EgwGPGyJGft1agagQw',
      xrpServer: 'wss://s.altnet.rippletest.net:51233'
    }
  }

  // Connector store
  const store = new RedisServer(opts.redisPort)
  await store.open()
  logger.info(`Redis server ready on port ${opts.redisPort}`)

  // Connector
  await runConnector(opts)

  // SPSP server
  await runServer(opts.miniAccounts.port, 8000)

  // GUI
  const gui = runGui(7770, opts.adminApiPort)

  process.on('SIGINT', () => {
    gui.kill()
    process.exit(0)
  })
}

run().catch(e => {
  logger.error(e)
  process.exit(1)
})
