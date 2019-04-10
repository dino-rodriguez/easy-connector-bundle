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
### NPM 
0) Install deps
```
npm install -g easy-connector-bundle
```

2) Run for usage instructions:
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

2) Add a testnet XRP peer:
```
ecb addAccount -n xrpPeer 
```
**Note**: in the server/client prompt, the choice represents your role in the relationship (e.g. choosing `server` means you are the server).

3) If you chose `server`, give your peer the URL returned in the logs of the format
`btp+ws://<host>:<port>`<host>:<port>. If you have HTTPS set up on your machine, replace `btp+ws` for `btp+wss` in the URL.

4) Check
TODO
----
- [x] Minimum default config
- [x] Generate config through cli questions
- [x] Configuration instructions
- [ ] Configuration through environment variables
- [ ] Dockerize
- [ ] Terraform script for automatically deploying to cloud provider(s) 
- [ ] Integrate `ilp-plugin-xrp-hybrid` for on-ledger w/o payment channels settlement
- [ ] Integrate `connector-peering-service` for autopeering
- [ ] Tests
