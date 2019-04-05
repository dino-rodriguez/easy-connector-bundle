'use strict'
const app = require('./src/app')
const argv = require('yargs')
const logger = require('riverpig')('ecb:index')

function run () {
  argv 
    .usage('Usage: $0 <command> [options]')
    .command({
      command: 'configure', 
      describe: 'Initial configuration for connector-bundle', 
      builder: {
        testnet: {
          type: 'boolean',
          alias: 't',
          default: false,
          description: 'Interledger mainnet or testnet' 
        },
        filePath: {
          type: 'string',
          alias: 'f',
          default: 'config.json',
          description: 'Filepath to store configuration'
        }
      }, 
      handler: async (argv) => {
        await app.configure(argv.testnet, argv.filePath).catch(e => {
          logger.error(e)
          process.exit(1)
        })
      }
    })
    .command({
      command: 'start', 
      describe: 'Start connector bundle', 
      builder: {
        filePath: {
          type: 'string',
          alias: 'f',
          default: 'config.json',
          description: 'Filepath to store configuration'
        }
      }, 
      handler: async (argv) => {
        await app.start(argv.filePath).catch(e => {
          logger.error(e)
          process.exit(1)
        })
      }
    })
    .command({
      command: 'addAccount', 
      describe: 'Add account to a running connector', 
      builder: {
        testnet: {
          type: 'boolean',
          alias: 't',
          default: false,
          description: 'Interledger mainnet or testnet' 
        },
        filePath: {
          type: 'string',
          alias: 'f',
          default: 'config.json',
          description: 'Filepath to store configuration'
        },
        plugin: {
          type: 'string',
          alias: 'p',
          default: 'ilp-plugin-xrp-paychan',
          description: 'The type of plugin to use for the connector account'
        },
        name: {
          type: 'string',
          alias: 'n',
          description: 'The name of the plugin to use for the connector account',
          demandOption: true
        }
      }, 
      handler: async (argv) => {
        await app.addAccount(argv).catch(e => {
          logger.error(e)
          process.exit(1)
        })
      }
    })
    .help('h')
    .alias('h', 'help')
    .argv
}

if (require.main == module) {
  run()
}

module.exports = {
  app,
  run
} 
