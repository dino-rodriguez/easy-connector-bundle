# Easy Connector Bundle 

> An easy to run connector bundle
* Overview
* Usage

## Overview
All the components necessary to operate an [ilp-connector]() in a single process:

* Connector to connect to the network
* SPSP server to receive payments
* MoneyD-GUI to manage the connector

Significantly reduces configuration necessary to run the connector by providing 
sensible defaults for plugins and most connector options. Configuration for all
components are specified in one JSON file.

## Usage
Refer `test/test.js` for example usage and `test/config.json` for an example
config file. In the example config, the connector, the plugins, and the spsp
server are using a minimum viable configuration (only required options).

### Local
1) Store the path of your `config.json` in the env

```
CONNECTOR_CONFIG_PATH=./config.json
```

2) Run

```
node index.js
```

TODO
----
- [ ] Load config into Dockerfile
- [ ] Docker instructions
- [ ] Integrate `ilp-plugin-xrp-hybrid`
- [ ] Tests
