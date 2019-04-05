const Connector = require('ilp-connector')
const { error } = require('./util')

function createConnector (config) {
  const {
    env,
    name,
    ilpAddress,
    spread,
    store,
    storePath,
    backend,
    adminApi,
    adminApiPort,
    accounts,
    ...extraConnectorOpts
  } = config.connector || config.base

  return Connector.createApp({
    env: env || error('ilp network env required'),
    ilpAddress: ilpAddress || _getIlpAddress(name, env),
    spread: Number(spread) || 0,
    store: store || 'leveldown',
    storePath: storePath || './database',
    backend: backend || 'ecb-plus-xrp',
    adminApi: Boolean(adminApi) || true,
    adminApiPort: Number(adminApiPort) || 7769,
    accounts: accounts || {},
    ...extraConnectorOpts
  })
}

function _getIlpAddress (name, env) {
  if (!name) throw Error('ilp address name required')
  return env + '.' + name
}

module.exports = createConnector 
