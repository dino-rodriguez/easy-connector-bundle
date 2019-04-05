'use strict'
const app = require('./src/app')
const argv = require('yargs')
const logger = require('riverpig')('ecb:index')

if (require.main == module) {
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
          description: 'Interledger testnet' 
        }
      }, 
      handler: async (argv) => {
        await app.configure(argv.testnet).catch(e => {
          logger.error(e)
          process.exit(1)
        })
      }
    })
    .command({
      command: 'start', 
      describe: 'Start connector bundle', 
      builder: {}, 
      handler: async () => {
        await app.start().catch(e => {
          logger.error(e)
          process.exit(1)
        })
      }
    })
    .command({
      command: 'addPlugin', 
      describe: 'Add plugin to a running connector', 
      builder: {}, 
      handler: async () => {
        console.log('define addPlugin')
      }
    })
    .help('h')
    .alias('h', 'help')
    .argv
}

module.exports = app
