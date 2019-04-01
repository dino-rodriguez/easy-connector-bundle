const app = require('./src/app')
const logger = require('riverpig')('easy-connector-bundle:index')

if (require.main === module) {
  const config = require(process.env.CONNECTOR_CONFIG_PATH)
  app.run(config).catch(e => {
    logger.error(e)
    process.exit(1)
  })
}

module.exports = app
