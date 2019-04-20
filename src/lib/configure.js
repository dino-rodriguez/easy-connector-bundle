const base64url = buf => buf
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
const crypto = require('crypto')
const { deriveKeypair, deriveAddress } = require('ripple-keypairs')
const fetch = require('node-fetch')
const fs = require('fs')
const inquirer = require('inquirer')
const { isValidAccountID, isValidSeed } = require('ripple-address-codec')
const logger = require('riverpig')('ecb:configure')
const rippledList = {
  live: [
    "wss://s1.ripple.com", 
    "wss://s2.ripple.com"
  ],
  test: [
    "wss://s.altnet.rippletest.net:51233"
  ]
}

function updateConfig (config, connector) {
  // These are unecessary on startup 
  const entriesToClear = [
  '_validate',
  '_validateAccount'
  ]
  const connectorConfig = JSON.parse(JSON.stringify(connector.config))
  
  entriesToClear.map(k => delete connectorConfig[k])
  Object.keys(connectorConfig).map(k => {
    if (k !== 'accounts') {
      config.connector[k] = connectorConfig[k]
    }
  })
}

function dumpConfig (config, path) {
  config = JSON.stringify(config, null, 2)
  fs.writeFileSync(path, config, 'utf-8')
  logger.info(`config written to ${path}`)
}

async function getBaseConfig (testnet, inquire) {
  const ilpAddressRegex = /([a-zA-Z0-9_~-]+)+$/
  const env = testnet ? 'test' : 'production'
  let name
  if (inquire) {
    name = (await inquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'connector name (with no network prefix):',
      validate: (name) => (ilpAddressRegex.test(name))
    })).name
  }
  
  name = name || process.env.CONNECTOR_NAME
  return { env, name }
}

async function getXRPCredentials (testnet, inquire) {
  const rippledServers = rippledList[testnet ? 'test' : 'live']
  const defaultRippled = rippledServers[Math.floor(Math.random() * rippledServers.length)]
  const res = { xrpServer: defaultRippled }
  if (inquire) {
    res.secret = (await inquirer.prompt({
      type: 'password',
      name: 'secret',
      message: 'XRP secret (master or regular key)' + (testnet ? ' (optional):' : ':'),
      mask: '*',
      validate: (secret) => (testnet && secret.length === 0) || isValidSeed(secret)
    })).secret
  }
  res.secret = res.secret || process.env.XRP_SECRET

  // generate testnet credentials if none passed in
  if (testnet && !res.secret) {
    logger.info('acquiring testnet account...')
    const resp = await fetch('https://faucet.altnet.rippletest.net/accounts', { method: 'POST' })
    const json = await resp.json()

    res.address = json.account.address
    res.secret = json.account.secret
    logger.info('got testnet address "' + res.address + '"')
    logger.info('waiting for testnet API to fund address...')
    await new Promise(resolve => setTimeout(resolve, 10000))
  } else {
    if (inquire) {
      res.address = (await inquirer.prompt({
        type: 'input',
        name: 'address',
        message: 'XRP address:',
        default: deriveAddress(deriveKeypair(res.secret).publicKey),
        validate: (address) => isValidAccountID(address)
      })).address
    }
    res.address = res.address || process.env.XRP_ADDRESS
  }

  return res 
}

module.exports = {
  dumpConfig,
  getBaseConfig, 
  getXRPCredentials,
  updateConfig
} 
