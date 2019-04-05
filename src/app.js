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
  if (fs.existsSync('config.json')) {
    throw Error('config already exists')
  }
  const baseILPConfig = await getBaseILPConfig(testnet) 
  const xrpCredentials = await getXRPCredentials(testnet)
  const baseConfig = JSON.stringify({ base, xrp }, null, 2)

  fs.writeFileSync('config.json', baseConfig, 'utf-8')
  logger.info('config written config.json')
}

async function start () {
  if (fs.existsSync('config.json')) {
    const config = JSON.parse(fs.readFileSync('config.json').toString())
  } else {
    throw Error('must run configure first')
  }

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
