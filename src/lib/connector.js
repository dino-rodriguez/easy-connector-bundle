const Connector = require('ilp-connector')

async function runConnector (opts) {
  const connector = Connector.createApp({
    env: opts.env,
    ilpAddress: opts.env + '.' + opts.name,
    spread: 0,
    store: 'leveldown',
    storePath: './leveldown',
    backend: 'ecb-plus-xrp',
    adminApi: true,
    adminApiPort: opts.adminApiPort,
    accounts: {
      peer: {
        relation: 'peer',
        plugin: 'ilp-plugin-http',
        assetCode: 'XRP',
        assetScale: 9,
        maxPacketAmount: '1000000',
        rateLimit: {
          refillCount: 1000000
        },
        options: {
          incoming: {
            port: opts.http.incomingPort,
            secret: 'secret'
          },
          outgoing: {
            url: `http://localhost:${opts.http.outgoingPort}`,
            secret: 'secret',
            http2: false,
            tokenExpiry: 10 * 1000,
            name: opts.name
          }
        }
      },
      miniAccounts: {
        relation: 'child',
        plugin: 'ilp-plugin-mini-accounts',
        assetCode: 'XRP',
        assetScale: 9,
        maxPacketAmount: '1000000',
        rateLimit: {
          refillCount: 1000000
        },
        options: {
          wsOpts: {
            port: opts.miniAccounts.port 
          }
        }
      },
      xrp: {
        relation: 'child',
        plugin: 'ilp-plugin-xrp-asym-server',
        assetCode: 'XRP',
        assetScale: 9,
        maxPacketAmount: '1000000',
        rateLimit: {
          refillCount: 1000000
        },
        options: {
          port: opts.xrp.port,
          address: opts.xrp.address,
          secret: opts.xrp.secret,
          xrpServer: opts.xrp.xrpServer,
          maxBalance: 1000000,
          maxPacketAmount: 1000000,
        }
      }
    }
  })
  await connector.listen()
}

module.exports = {
  runConnector
}
