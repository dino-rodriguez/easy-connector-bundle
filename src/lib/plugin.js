const { error } = require('./util')
const inquirer = require('inquirer')
const { isValidAccountID } = require('ripple-address-codec')
const logger = require('riverpig')('ecb:plugin')

async function generatePluginOpts (plugin, opts={ }, inquire, config) {
  const {
    relation,
    assetCode,
    assetScale,
    maxPacketAmount,
    rateLimit,
    options,
    ...extraPluginOpts
  } = opts

  const corePluginOpts = { 
    relation, 
    assetCode, 
    assetScale,
    maxPacketAmount, 
    rateLimit, 
    options 
  }

  const pluginMap = {
    'ilp-plugin-btp': [null, _getBtp],
    'ilp-plugin-http': [null, _getHttp],
    'ilp-plugin-mini-accounts': [null, _getMiniAccounts],
    'ilp-plugin-xrp-paychan': [_inquireXrpPaychan, _getXrpPaychan],
    'ilp-plugin-xrp-asym-server': [null, _getXrpAsymServer]
  }

  if (inquire && !opts.options) {
    corePluginOpts.options = await pluginMap[plugin][0](config.xrp)
  }

  return pluginMap[plugin][1](corePluginOpts, extraPluginOpts) || error('plugin not found')
}

function _getBtp (opts, extraPluginOpts) {
  const {
    listener,
    server,
    ...extraBtpOpts
  } = opts.options

  return {
    relation: opts.relation || 'peer',
    plugin: 'ilp-plugin-btp',
    ..._getDefaults(opts, extraPluginOpts),
    options: {
      ..._getServerOrClient(listener, server),
      ...extraBtpOpts
    }
  }
}

function _getDefaults (opts, extraPluginOpts) {
  return {
    assetCode: opts.assetCode || 'XRP',
    assetScale: opts.assetScale || 9,
    maxPacketAmount: opts.maxPacketAmount || '1000000',
    rateLimit: opts.rateLimit || { refillCount: 1000000 },
    ...extraPluginOpts
  }
}

function _getHttp (opts, extraPluginOpts) {
  const {
    multi,
    multiDelimiter,
    incoming,
    outgoing,
    ...extraHttpOpts
  } = opts.options

  const {
    port,
    secret: incomingSecret,
    ...extraIncomingOpts
  } = incoming

  const {
    url,
    secret: outgoingSecret,
    http2,
    tokenExpiry,
    name,
    ...extraOutgoingOpts
  } = outgoing 

  return {
    relation: opts.relation || 'peer',
    plugin: 'ilp-plugin-http',
    ..._getDefaults(opts, extraPluginOpts),
    options: {
      multi: multi || false,
      multiDelimiter: multiDelimiter || '%',
      incoming: {
        port: port || error('port required'),
        secret: incomingSecret || error('incoming secret required'),
        ...extraIncomingOpts
      },
      outgoing: {
        url: url || error('outgoing url required'), 
        secret: outgoingSecret || error('outgoing secret required'),
        http2: http2 || false,
        tokenExpiry: tokenExpiry || 10 * 1000,
        name: name || '',
        ...extraOutgoingOpts
      },
      ...extraHttpOpts
    }
  }
}

function _getMiniAccounts (opts, extraPluginOpts) {
  const {
    wsOpts,
    ...extraMiniAccountsOpts
  } = opts.options 

  const {
    port,
    ...extraWsOpts
  } = wsOpts || {}

  return {
    relation: opts.relation || 'child',
    plugin: 'ilp-plugin-mini-accounts',
    ..._getDefaults(opts, extraPluginOpts),
    options: {
      wsOpts: {
        port: port || error('port required'),
        ...extraWsOpts
      },
      ...extraMiniAccountsOpts
    }
  }
}

function _getServerOrClient (listener, server) {
  if (listener && server) throw Error('only one of listener of server allowed')

  if (listener) {
    const {
      port,
      secret
    } = listener

    return {
      listener: {
        port: port || error('port required'),
        secret: secret || error('secret required')
      }
    }
  }

  if (server) return { server: server || error('server url required') } 

  throw Error('must define one of listener or server')
}

async function _inquireXrpPaychan (xrpOpts) {
  const opts = {}
  const peerAddress = (await inquirer.prompt({
    type: 'input',
    name: 'peerAddress',
    message: 'XRP address for peer:',
    validate: (peerAddress) => isValidAccountID(peerAddress)
  })).peerAddress
  opts.peerAddress = peerAddress

  const relation = (await inquirer.prompt({
    type: 'list',
    name: 'relation',
    message: 'Client or server?',
    choices: [
      'Client',
      'Server'
    ]
  })).relation

  if (relation === 'Server') {
    const port = (await inquirer.prompt({
      type: 'number',
      name: 'port',
      message: 'Port to listen on:',
      validate: (port) => Number.isInteger(port)
    })).port

    const base64Regex = /[A-Za-z0-9+/=]/
    const secret = (await inquirer.prompt({
      type: 'input',
      name: 'secret',
      message: 'Server secret (base64):',
      validate: (secret) => base64Regex.test(secret) 
    })).secret
    opts.listener = {
      port,
      secret
    }
    logger.info(`Give your peer the following URL: btp+ws://:${secret}@<host>:${port}`)
    logger.info('Change <host> to your publically accessible domain or IP')
    logger.info('Change `ws` to `wss` if using TLS')
  } else {
    const peerURL= (await inquirer.prompt({
      type: 'input',
      name: 'peerURL',
      message: 'Peer URL (btp+ws://:<secret>@<host>:<port>):',
    })).peerURL
    opts.server = peerURL
  }

  opts.address = xrpOpts.address
  opts.secret = xrpOpts.secret
  opts.xrpServer = xrpOpts.xrpServer

  return opts
}

function _getXrpPaychan (opts, extraPluginOpts) {
  const {
    listener,
    server,
    address,
    secret,
    xrpServer,
    peerAddress,
    ...extraPaychanOpts
  } = opts.options

  const { 
    balance, 
    ...extraOpts 
  } = extraPluginOpts

  const {
    maximum,
    settleThreshold,
    settleTo
  } = balance || {}
 
  return {
    relation: opts.relation || 'peer',
    plugin: 'ilp-plugin-xrp-paychan',
    balance: {
      maximum: maximum || '1000000000',
      settleThreshold: settleThreshold || '-1000000',
      settleTo: settleTo || '0'
    },
    ..._getDefaults(opts, extraOpts),
    options: {
      ..._getServerOrClient(listener, server),
      address: address || error('xrp address required'),
      secret: secret || error('xrp secret required'),
      xrpServer: xrpServer || error('xrp server required'),
      peerAddress: peerAddress || error('peer xrp address required'),
      ...extraPaychanOpts
    }
  }
}

function _getXrpAsymServer (opts, extraPluginOpts) {
  const {
    port,
    address,
    secret,
    xrpServer,
    maxBalance,
    maxPacketAmount,
    ...extraServerOpts
  } = opts.options

  return {
    relation: opts.relation || 'child',
    plugin: 'ilp-plugin-xrp-asym-server',
    ..._getDefaults(opts, extraPluginOpts),
    options: {
      port: port || error('port required'),
      address: address || error('xrp address required'),
      secret: secret || error('xrp secret required'),
      xrpServer: xrpServer || error('xrp server required'),
      maxBalance: maxBalance || 1000000,
      maxPacketAmount: maxPacketAmount || 1000000,
      ...extraServerOpts
    }
  }
}

module.exports = generatePluginOpts 
