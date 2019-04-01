# Easy Connector Bundle 

> A bundle to easily run an Interledger connector
* [Overview](#overview)
* [Usage](#usage)

## <a name="overview"></a>Overview
All the components necessary to operate an [ilp-connector](https://github.com/interledgerjs/ilp-connector) in a single process:

* Connector to connect to the network
* SPSP server to receive payments
* MoneyD-GUI to manage the connector

Significantly reduces configuration necessary to run the connector by providing 
sensible defaults for plugins and most connector options. Configuration for all
components are specified in one JSON file.

## <a name="usage"></a>Usage
Refer `test/test.js` for example usage and `test/config.json` for an example
config file. In the example config, the connector, the plugins, and the spsp
server are using a minimum viable configuration (only required options). 

Store the connector config path in the environment variable `CONNECTOR_CONFIG_PATH`.
Replace the `./test/config.json` path for your custom connector config when you have
created one.

### Source 
0) Install deps
```
git clone git@github.com:d1no007/easy-connector-bundle.git
cd easy-connector-bundle
yarn
```

1) Run
```
CONNECTOR_CONFIG_PATH=./test/config.json node index.js
```

### NPM 
0) Install deps
```
yarn add easy-connector-bundle
```

1) **index.js**
```
const app = require('easy-connector-bundle')

const config = require(process.env.CONNECTOR_CONFIG_PATH)
app.run(config).catch(e => {
  logger.error(e)
  process.exit(1)
})
```

2) Run
```
CONNECTOR_CONFIG_PATH=./test/config.json node index.js
```


TODO
----
- [ ] Load config into Dockerfile
- [ ] Docker instructions
- [ ] Configuration instructions
- [ ] Integrate `ilp-plugin-xrp-hybrid`
- [ ] Tests
