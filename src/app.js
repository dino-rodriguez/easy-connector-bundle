const { App: MoneydGUI } = require('moneyd-gui')
const BtpPlugin = require('ilp-plugin-btp')
const fs = require('fs')
const getConnector = require('./lib/connector')
const getPluginOpts = require('./lib/plugin')
const { 
  dumpConfig,
  getXRPCredentials, 
  getBaseConfig,
  updateConfig } = require('./lib/configure')
const logger = require('riverpig')('ecb:app')
const reduct = require('reduct')
const startSPSPServer = require('./lib/spsp')

async function addAccount (args) {
  const { testnet, filePath, plugin, name } = args
}

async function configure (testnet, path) {
  if (fs.existsSync(path)) {
    throw Error('config already exists')
  }

  // Get a minimal config via cli from user
  const base = await getBaseConfig(testnet) 
  const xrp = await getXRPCredentials(testnet)
  
  dumpConfig({ base, xrp }, path)
}

async function start (path) {
  // Load config 
  let config
  if (fs.existsSync(path)) {
    config = JSON.parse(fs.readFileSync(path).toString())
  } else {
    throw Error('must run configure first')
  }

  // Start connector
  const connector = getConnector(config) 
  await connector.listen()

  // On first start, create a local miniAccounts
  // and an XRP server
  if (!config.connector) {
    const localOpts = getPluginOpts('ilp-plugin-mini-accounts', {
      options: {
        wsOpts: {
          port: 7768
        }
      }
    })
    const xrpClientServerOpts = getPluginOpts('ilp-plugin-xrp-asym-server', {
      options: {
        port: 8000,
        address: config.xrp.address,
        secret: config.xrp.secret,
        xrpServer: config.xrp.xrpServer
      }
    })
    await connector.addPlugin('local', localOpts)
    await connector.addPlugin('xrpClientServer', xrpClientServerOpts)

    // Add the plugins to the config
    config.connector = { 
      accounts: {
        local: localOpts,
        xrpClientServer: xrpClientServerOpts
      }
    }

    // Dump the updated connector config back to the file
    updateConfig(config, connector)
    dumpConfig(config, path)
  }

  // SPSP server
  // Connect to `local` plugin on connector
  await startSPSPServer({
    plugin: new BtpPlugin({
      server: 'btp+ws://:abc@localhost:7768' 
    }),
    port: 9000 
  }) 

  // MoneyD GUI
  // Listens on 7770 by default
  const gui = reduct()(MoneydGUI)
  gui.listen()
}

module.exports = {
  addAccount,
  configure,
  start  
}
