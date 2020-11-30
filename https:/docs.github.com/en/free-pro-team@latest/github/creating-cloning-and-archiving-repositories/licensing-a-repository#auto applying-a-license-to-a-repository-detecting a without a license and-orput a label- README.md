<h1 align="center">
  <br>
  <a href="https://docs.iota.org/docs/wallets/0.1/trinity/introduction/overview"><img src="trinity.png"></a>
</h1>

<h2 align="center">The official IOTA wallet</h2>

<p align="center">
    <a href="https://docs.iota.org/docs/wallets/0.1/trinity/introduction/overview" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Documentation%20portal-blue.svg?style=for-the-badge" alt="Developer documentation portal">
</p>
<p align="center">
  <a href="https://discord.iota.org/" style="text-decoration:none;"><img src="https://img.shields.io/badge/Discord-9cf.svg?logo=discord" alt="Discord"></a>
    <a href="https://iota.stackexchange.com/" style="text-decoration:none;"><img src="https://img.shields.io/badge/StackExchange-9cf.svg?logo=stackexchange" alt="StackExchange"></a>
    <a href="https://raw.githubusercontent.com/iotaledger/trinity-wallet/develop/LICENSE" style="text-decoration:none;"><img src="https://img.shields.io/badge/License-Apache%202.0-green.svg" alt="Apache 2.0 license"></a>
    <a href="https://dependabot.com" style="text-decoration:none;"><img src="https://api.dependabot.com/badges/status?host=github&repo=iotaledger/trinity-wallet" alt=""></a>
</p>
      
<p align="center">
  <a href="#about">About</a> ◈
  <a href="#prerequisites">Prerequisites</a> ◈
  <a href="#installation">Installation</a> ◈
  <a href="#getting-started">Getting started</a> ◈
  <a href="#supporting-the-project">Supporting the project</a> ◈
  <a href="#joining-the-discussion">Joining the discussion</a> 
</p>

---

## About

This is the **official** IOTA wallet, which allows you to do the following:
* Create password-protected accounts to store and access your seeds
* Send transactions
* Generate addresses
* Read your balance and transaction history

Please report any issues in our [issue tracker](https://github.com/iotaledger/trinity/issues/new).

## Prerequisites

To compile Trinity, you must have the following:

* [Node.js 10 (>=10.19) or 11](https://nodejs.org/dist/)
* [Yarn](https://yarnpkg.com/) package manager.

## Installation

The latest downloadable versions of Trinity are available on the [Trinity website](https://trinity.iota.org/).

If you want to run a local version of Trinity, compile the code by doing the following:

1. Clone this repository

    ```
    git clone https://github.com/iotaledger/trinity-wallet.git
    ```

2. Change into the `trinity-wallet` directory

    ```
    cd trinity-wallet
    ```

3. Install the shared dependencies

    ```
    yarn && yarn deps:shared
    ```

4. Follow the instructions to compile either [Trinity Mobile](https://github.com/iotaledger/trinity-wallet/blob/develop/src/mobile/README.md) or [Trinity Desktop](https://github.com/iotaledger/trinity-wallet/blob/develop/src/desktop/README.md).

## Getting started

If you want help getting started as a user of the wallet, see the [documentation portal](https://docs.iota.org/docs/wallets/0.1/trinity/introduction/overview).

If you are contributing to the Trinity codebase, see the following resources:

- [How to develop new features in Trinity](https://docs.iota.org/docs/wallets/0.1/trinity/how-to-guides/develop-features-on-trinity)
- [Contributing guidelines](.github/CONTRIBUTING.md)

## Supporting the project

If Trinity has been useful to you and you feel like contributing, consider posting a [bug report](https://github.com/iotaledger/trinity-wallet/issues/new?labels=T+-+Bug&template=bug_report.md&title=), [feature request](https://github.com/iotaledger/trinity-wallet/issues/new?labels=&template=feature_request.md&title=) or a [pull request](https://github.com/iotaledger/trinity-wallet/pulls/).

See the [contributing guidelines](.github/CONTRIBUTING.md) for more information.

## Joining the discussion

If you want to get involved in the community, need help with getting setup, have any issues related to Trinity or just want to discuss IOTA, Distributed Ledger Technology (DLT) and IoT with other people, feel free to join our [Discord](https://discord.iota.org/).
