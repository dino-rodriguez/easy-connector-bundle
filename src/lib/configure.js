const base64url = buf => buf
  .toString('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
const crypto = require('crypto')
const { deriveKeypair, deriveAddress } = require('ripple-keypairs')
const fetch = require('node-fetch')
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

async function getBaseILPConfig (testnet) {
  return { }
}

async function getXRPCredentials (testnet) {
  const rippledServers = rippledList[testnet ? 'test' : 'live']
  const defaultRippled = rippledServers[Math.floor(Math.random() * rippledServers.length)]
  const res = { xrpServer: defaultRippled }
  res.secret = (await inquirer.prompt({
    type: 'password',
    name: 'secret',
    message: 'XRP secret (master or regular key)' + (testnet ? ' (optional):' : ':'),
    mask: '*',
    validate: (secret) => (testnet && secret.length === 0) || isValidSeed(secret)
  })).secret

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
    res.address = (await inquirer.prompt({
      type: 'input',
      name: 'address',
      message: 'XRP address:',
      default: deriveAddress(deriveKeypair(res.secret).publicKey),
      validate: (address) => isValidAccountID(address)
    })).address

    // Ensure that the given account exists and has enough XRP to create a channel.
    await validateAddress(res.xrpServer, res.address).catch((err) => {
      console.error('Error configuring xrp address: ' + err.message)
      process.exit(1)
    })
  }

  return res 
}

module.exports = {
  getBaseILPConfig, 
  getXRPCredentials
} 
