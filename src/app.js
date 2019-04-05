const { App: MoneydGUI } = require('moneyd-gui')
const BtpPlugin = require('ilp-plugin-btp')
const fetch = require('node-fetch')
const fs = require('fs')
const createConnector = require('./lib/connector')
const generatePluginOpts = require('./lib/plugin')
const { 
  dumpConfig,
  getXRPCredentials, 
  getBaseConfig,
  updateConfig } = require('./lib/configure')
const logger = require('riverpig')('ecb:app')
const reduct = require('reduct')
const startSPSPServer = require('./lib/spsp')

async function addAccount (args) {
  const { filePath, plugin, name } = args
  let config
  if (fs.existsSync(filePath)) {
    config = JSON.parse(fs.readFileSync(filePath).toString())
  } else {
    throw Error('must run configure first')
  }
  const pluginOpts = await generatePluginOpts(plugin, {}, true, config)

  // Add plugin via admin API
  // TODO: admin API hanging on plugin connect
  // after adding plugin, should await here
  const res = fetch('http://localhost:7769/addAccount', {
    method: 'post',
    body:    JSON.stringify({ id: name, options: pluginOpts }),
    headers: { 'Content-Type': 'application/json' },
  })

  // Update and dump config
  config.connector.accounts[name] = pluginOpts
  dumpConfig(config, filePath)
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
  const connector = createConnector(config) 
  await connector.listen()

  // On first start, create a local miniAccounts
  // and an XRP server
  if (!config.connector) {
    const localPartialOpts = { 
      options: {
        wsOpts: {
          port: 7768
        }
      }
    }
    const localOpts = await generatePluginOpts('ilp-plugin-mini-accounts', localPartialOpts, false, config)
    await connector.addPlugin('local', localOpts)
    const xrpServerPartialOpts = {
      options: {
        port: 8000,
        address: config.xrp.address,
        secret: config.xrp.secret,
        xrpServer: config.xrp.xrpServer
      }
    }
    const xrpServerOpts = await generatePluginOpts('ilp-plugin-xrp-asym-server', xrpServerPartialOpts, false, config)
    await connector.addPlugin('xrpServer', xrpServerOpts)

    // Add the plugins to the config
    config.connector = { 
      accounts: {
        local: localOpts,
        xrpServer: xrpServerOpts
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
