const { App: MoneydGUI } = require('moneyd-gui')
const BtpPlugin = require('ilp-plugin-btp')
const fs = require('fs')
const getConnector = require('./lib/connector')
const getPluginOpts = require('./lib/plugin')
const { getXRPCredentials, getBaseILPConfig } = require('./lib/configure')
const logger = require('riverpig')('ecb:app')
const reduct = require('reduct')
const startSPSPServer = require('./lib/spsp')

async function configure (testnet) {
  // TODO check if a config exists

  const baseILPConfig = await getBaseILPConfig(testnet) 
  const xrpCredentials = await getXRPCredentials(testnet)
  const baseConfig = JSON.stringify({ baseILPConfig, xrpCredentials }, null, 2)
  fs.writeFileSync('config.json', baseConfig, 'utf-8')
  logger.info('Base ILP config written to file')
}

async function start (config) {
  // Start connector
  const connector = getConnector(config.connector) 
  await connector.listen()

  // Add plugins to connector
  Object.keys(config.plugins).map(name => {
    let {
      plugin,
      options
    } = config.plugins[name]
    let fullPluginOpts = getPluginOpts(plugin, { options })
    connector.addPlugin(name, fullPluginOpts)
  })

  // SPSP server
  // Connect to `local` plugin on connector
  await startSPSPServer({
    plugin: new BtpPlugin({
      server: config.spsp.connectorServer 
    }),
    port: config.spsp.port 
  }) 

  // MoneyD GUI
  // Listens on 7770 by default
  const gui = reduct()(MoneydGUI)
  gui.listen()
}

module.exports = {
  configure,
  start  
}
