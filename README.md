# Equilibria Electron GUI Wallet

### Introduction
A Private and Decentralized Oracle Solution

More information on the project can be found on the [website](https://equilibriacc.github.io). Equilibria is an open source project, and we encourage contributions from anyone with something to offer.


### About this project

This is the new electron GUI for Equilibria. It is open source and completely free to use without restrictions, anyone may create an alternative implementation of the Equilibria Electron GUI that uses the protocol and network in a compatible manner.

Please submit any changes as pull requests to the development branch, all changes are assessed in the development branch before being merged to master, release tags are considered stable builds for the GUI.

#### Pre-requisites
- Download latest [Equilibria](https://github.com/EquilibriaCC/Equilibria)
- Windows only: Set execution policy to [Unrestricted]((If you are on windows, set your execution policy to Unrestricted (https://docs.vmware.com/en/vRealize-Automation/7.6/com.vmware.vra.iaas.hp.doc/GUID-9670AFC5-76B8-4321-822A-BCE05800DB5B.html)).

#### Commands
```
nvm use 11.9.0
npm install -g quasar-cli
git clone https://github.com/EquilibriaCC/equilibria-wallet -b development
cd equilibria-wallet
cp path_to_equilibria_binaries/daemon bin/
cp path_to_equilibria_binaries/equilibria-wallet-rpc bin/
npm install

//build
quasar build -m electron -t mat

//dev
quasar dev -m electron -t mat

```
