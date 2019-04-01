const Connector = require('ilp-connector')
const { error } = require('./util')

function getConnector (opts) {
  const {
    env,
    name,
    spread,
    store,
    storePath,
    backend,
    adminApi,
    adminApiPort,
    accounts,
    ...extraConnectorOpts
  } = opts

  return Connector.createApp({
    env: env || error('ilp network env required'),
    ilpAddress: _getIlpAddress(opts),
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

function _getIlpAddress (opts) {
  if (!opts.name) throw Error('ilp address name required')
  return opts.env + '.' + opts.name
}

module.exports = getConnector 
