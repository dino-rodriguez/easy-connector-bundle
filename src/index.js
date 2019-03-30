const logger = require('riverpig')('ilp-node:index')
const { App: MoneydGUI } = require('moneyd-gui')
const reduct = require('reduct')
const { runConnector } = require('./lib/connector')
const { runServer } = require('./lib/spsp')

async function run () {
  const env = 'test'
  const opts = {
    env,
    name: 'connector',
    adminApiPort: 7769,
    http: {
      incomingPort: 2000,
      outgoingPort: 2001
    },
    miniAccounts: {
      port: 7768 
    },
    xrp: {
      port: 2002,
      address: 'rbnfJCKJ8AUgg96WE9bAjCmvm2k5DbVv2',
      secret: 'ssui88vyCJ1EgwGPGyJGft1agagQw',
      xrpServer: 'wss://s.altnet.rippletest.net:51233'
    }
  }

  // Connector
  await runConnector(opts)

  // SPSP server
  await runServer(opts.miniAccounts.port, 8000)

  // MoneyD GUI
  // Listens on 7770 by default
  const gui = reduct()(MoneydGUI)
  await gui.listen()
}

run().catch(e => {
  logger.error(e)
  process.exit(1)
})
