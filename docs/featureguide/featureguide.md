# Trinity Featureguide

## Table of Contents

  1. [Account Syncing](#account-syncing)
      1. [Initial Syncing](#initial-syncing)
      1. [Manual Syncing](#manual-syncing)
      1. [Auto Syncing](#auto-syncing)
  1. [Promotions](#promotions)
  1. [Transfers](#transfers)
      1. [Zero Value Transfers](#zero-value-transfers)
      1. [Value Transfers](#value-transfers)
  1. [Input Management](#input-management)

## Account Syncing

The application makes sure that it syncs account information with the tangle at regular intervals, especially before critical actions (making a transfer).

### Initial Syncing

Initial syncing starts off with the user's seed. The application starts generating addresses from the seed in bulks (defaults to ten) and for each set of addresses it communicates with the ledger
to see if there are any transaciton hashes associated with those addresses. This process (address generation and checking associated transaction hashes) is repeated till no address in the set has any transaction hash on the tangle.

> **Note:** On initial sync Trinity keeps a single unused address as the receiving address.

After having all the addresses (with transfers) generated, the application constructs all bundles against those addresses. 

> **Note:** For confirmed transfers, the application makes sure that it does not add reattachments and only keep a single bundle.
 
 All bundles are validated before adding to the local application state.

**[⬆ back to top](#table-of-contents)**

### Manual Syncing

Manual syncing is an added feature that forces to clean up the existing account state and brings in all the account information from tangle.
It follows the exact same steps as (Initial Sync)(#initial-syncing). It also cleans up the existing account information on device behing the scenes. 

**[⬆ back to top](#table-of-contents)**

### Auto Syncing

Auto syncing is a service that runs behind the scenes and makes sure that the wallet is always up-to-date with the latest state on the tangle.

It is built in a way to be lightweight as much as possible, so it always updates the local application state whenever it detects a difference between local account state and the tangle state.

The service is responsible for:

- Adding new valid bundles to state if found on the tangle.
- Checking latest balance on all the addresses stored on the device.
- Checking unspent addresses stored on device if they have been spent from some other device. 
- Checking validity on unconfirmed bundles. In case a bundle is no longer valid, the application would stop promoting it

**[⬆ back to top](#table-of-contents)**

## Promotions

The applications keeps track of all the unconfirmed value transfers and automatically promotes them in the background.

> **Note:** The application does not promote zero value and invalid pending transfers.

Unlike the syncing service which only works for the currently selected account, promotion service works for all added accounts.

The application keeps track of all the valid unconfirmed transactions and makes sure it promotes all of them in a sequential manner.

> **Note** The way promotion works, it cannot always promote a valid transaction. One of the reasons being in case a transaction has gone below maximum depth in the tangle. The application if detects that none of the reattachments or the original transaction can be promoted for a valid transaction, it automatically makes a new reattachment to the tangle and promotes that specific reattachment right away.

**[⬆ back to top](#table-of-contents)**

## Transfers

### Zero Value Transfers

The application offers a feature to send zero value transfers to addresses.

This feature allows exchanging messages. There are no signings (inputs) for zero value transfers so no prior checking on address reuse is performed when a user tries to make a zero value transfer.
Since zero value transfers have just outputs and no inputs, the bundle would not have any address from sender's seed. 
This leads to a problem where initial sync and manual sync fail to detect these transfers on the tangle (since they do not have any address information from the sender).
To overcome this issue, the application always adds a new transfer object to the bundle containing first address of the sender.    

> **Note:** There are no pre-requisite checks performed before making zero value transfers (Forcing account sync, checking if the receiving address is already spent from).

**[⬆ back to top](#table-of-contents)**

### Value Transfers

Value transfers pass through a series of validations before the signing process of inputs and broadcasting.

The application would not allow a transfer 
- If the receiving address is already spent from.
- If addresses with balance (used in inputs) have pending incoming transfers.
- If addresses with balance (used in inputs) are already spent from.

> **Note:** The application performs auto syncing at regular intervals, but before making a transfer, it is made sure that the account and addresses are synced with the tangle.


**[⬆ back to top](#table-of-contents)**

### Input Management

The application manages inputs from locally stored addresses and does not rely on the tangle directly.
However, the application makes sure it syncs the account before selecting addresses for inputs.

Input management starts with the **first** address with balance.
It is also made sure that the addresses chosen for inputs were not spent from before by communicating with the tangle.
Since the account is manually synced behind the scenes before choosing inputs, checking spent statuses with the tangle after the inputs are selected can be removed in favor of checking spent statuses locally. 

**[⬆ back to top](#table-of-contents)**