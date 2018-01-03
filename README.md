# IOTA Trinity Wallet

[![Build Status](https://www.bitrise.io/app/e1c71066b5c75521/status.svg?token=NytmjW1aEHEu-1kNaMRuiQ&branch=develop)](https://www.bitrise.io/app/e1c71066b5c75521)


This is the shared repository for the IOTA Trinity mobile and desktop wallets. The apps are based on React and built with React-Native (mobile) and Electron (desktop).

## Prerequisites

- Node.js (8+) 
- Yarn

## Instructions

1. Clone this repo
```
git clone git@gitlab.com:iota-community/wallet.git
```

2. Go to the wallet directory
```
cd wallet
```

3. Run the setup
```
yarn full-setup
```

## Branches

To create a new feature or bugfix (or chore) please create a new branch and use a prefix (e.g `feature/my-awesome-new-feature` or `bugfix/something-not-working`). The prefixes we use are `bugfix`, `feature`, `chore` and `hotfix`. Please don't use anything else.

If you are adding any text in your work, please follow the instructions in LOCALIZATION.md. 

When creating a new branch try to always branch off from `master`! Avoid branching off from other branches unless it's absolutely necessary.

When you're done with your work create a new Pull Request (Merge Request on Gitlab) and use your branch as **source** branch and **develop** as target branch. Never create Pull Requests directly against **master** as target branch unless you're trying to merge an important hotfix.
