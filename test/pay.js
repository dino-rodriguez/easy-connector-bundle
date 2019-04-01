const BtpPlugin = require('ilp-plugin-btp')
const crypto = require('crypto')
const logger = require('riverpig')('easy-connector-bundle:pay')
const spsp = require('ilp-protocol-spsp')

async function pay (connectorPort, paymentPointer, sourceAmount) {
  const pluginSecret = crypto.randomBytes(16).toString('hex')
  const btpPlugin = new BtpPlugin({
    server: `btp+ws://:${pluginSecret}@localhost:${connectorPort}`
  })

  logger.info(`Connecting to connector on port ${connectorPort}..`)
  await spsp.pay(btpPlugin, {
    receiver: paymentPointer,
    sourceAmount,
    streamOpts: {
      slippage: 0.03
    }
  })

  logger.info(`Payment of size ${sourceAmount} sent to ${paymentPointer}`)
}

module.exports = {
  pay
}
