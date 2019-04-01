const app = require('../src/app')
const logger = require('riverpig')('easy-connector-bundle:index')

const config = require('../test/config.json')
app.run(config).catch(e => {
  logger.error(e)
  process.exit(1)
})
