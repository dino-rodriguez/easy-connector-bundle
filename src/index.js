const app = require('./app')
const logger = require('riverpig')('easy-connector-bundle:index')

const config = require(process.env.CONNECTOR_CONFIG_PATH)
app.run(config).catch(e => {
  logger.error(e)
  process.exit(1)
})
