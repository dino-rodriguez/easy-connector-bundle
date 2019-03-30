const logger = require('riverpig')('ilp-node:gui')
const { spawn } = require('child_process')

function runGui (serverPort, adminApiPort) {
  process.env.PORT = serverPort
  const child = spawn('npx', ['moneyd-gui', '--admin-api-port', adminApiPort])

  child.stdout.on('data', (data) => {
    logger.info(data.toString().replace(/\n$/, ''));
  });

  child.stderr.on('data', (data) => {
    logger.info(data.toString().replace(/\n$/, ''));
  });

  child.on('error', err => {
    logger.error(err)
  })

  child.on('exit', code => {
    logger.info(`Child process for moneyd-gui exited with code ${code}`)
  })

  return child
}

module.exports = {
  runGui 
}
