const BtpPlugin = require('ilp-plugin-btp')
const { App: MoneydGUI } = require('moneyd-gui')
const reduct = require('reduct')
const getConnector  = require('./lib/connector')
const getPluginOpts  = require('./lib/plugin')
const startSPSPServer = require('./lib/spsp')

async function run (config) {
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
  run
}
