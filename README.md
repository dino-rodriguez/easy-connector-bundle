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

### NPM 
0) Install deps
```
npm install -g easy-connector-bundle
```

2) Run for usage:
```
ecb --help
```

### Example using the Testnet
0) Initial configuration, prompts you for questions:
```
ecb configure --testnet
```

1) Start connector. Automatically makes `ilp-plugin-mini-accounts` and `ilp-plugin-xrp-asym-server`
and saves to config:
```
ecb start
```

2) Add a peer:
```
ecb addAccount -n xrpPeer 
```
Note: in the server/client prompt, you need to choose *your* side of the relationship, not your peer's.

3) Exchange credentials with your peer, and you will be connected to the network !

TODO
----
- [x] Minimum default config
- [x] Generate config through cli questions
- [x] Configuration instructions
- [ ] Integrate `ilp-plugin-xrp-hybrid`
- [ ] Integrate `connector-peering-service` for autopeering
- [ ] Tests
