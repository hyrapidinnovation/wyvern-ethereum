/* global artifacts: false */

const WyvernExchange = artifacts.require('./WyvernExchange.sol')
const WyvernProxyRegistry = artifacts.require('./WyvernProxyRegistry.sol')
const WyvernAssetRegistry = artifacts.require('./WyvernAssetRegistry.sol')
const SaleKindInterface = artifacts.require('./SaleKindInterface.sol')

const { setConfig } = require('./config.js')

module.exports = (deployer, network) => {
  if (network === 'development' || network === 'rinkeby') {
    return deployer.deploy(WyvernProxyRegistry)
      .then(() => {
        setConfig('deployed.' + network + '.WyvernProxyRegistry', WyvernProxyRegistry.address)
        return deployer.deploy(WyvernAssetRegistry)
        .then(() => {
          setConfig('deployed.' + network + '.WyvernAssetRegistry', WyvernAssetRegistry.address)
          return deployer.deploy(SaleKindInterface)
            .then(() => {
              setConfig('deployed.' + network + '.SaleKindInterface', SaleKindInterface.address)
              deployer.link(SaleKindInterface, WyvernExchange)
              return deployer.deploy(WyvernExchange, WyvernProxyRegistry.address, '0x056017c55ae7ae32d12aef7c679df83a85ca75ff')
                .then(() => {
                  setConfig('deployed.' + network + '.WyvernExchange', WyvernExchange.address)
                }).then(() => {
                  return WyvernProxyRegistry.deployed().then(proxyRegistry => {
                    return WyvernExchange.deployed().then(exchange => {
                      return proxyRegistry.updateContract(exchange.address, true)
                    })
                  })
                })
            })
        })
      })
  }
}
