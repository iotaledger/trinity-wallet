# IOTA Trinity Wallet

[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=iotaledger/trinity-wallet)](https://dependabot.com)


This is the shared repository for the IOTA Trinity Mobile and Desktop wallets. The apps are based on React and built with React-Native (mobile) and Electron (desktop).

## Prerequisites

- Node.js (8+)
- Yarn

## Instructions

1. Clone this repo
```
git clone https://github.com/iotaledger/trinity-wallet.git
```

2. Go to the trinity-wallet directory
```
cd trinity-wallet
```

3. Install the shared dependencies
```
yarn && yarn deps:shared
```

4. Follow the instructions to install dependencies for [Trinity Mobile](https://github.com/iotaledger/trinity-wallet/blob/develop/src/mobile/README.md) or [Trinity Desktop](https://github.com/iotaledger/trinity-wallet/blob/develop/src/desktop/README.md)


## Branches

To create a new feature or bugfix (or chore) please create a new branch and use a prefix (e.g `feature/my-awesome-new-feature` or `bugfix/something-not-working`). The prefixes we use are `bug`, `feat`, `chore` and `hotfix`. Please don't use anything else.

If you are adding any text in your work, please follow the instructions in [localisation.md](https://github.com/iotaledger/trinity-wallet/blob/develop/docs/dev/localisation.md).

When creating a new branch try to always branch off from `develop`. Avoid branching off from other branches unless it's absolutely necessary.

When you're done with your work create a new Pull Request and use your branch as **source** branch and **develop** as target branch. Never create Pull Requests directly against **master** as target branch unless you're trying to merge an important hotfix.
