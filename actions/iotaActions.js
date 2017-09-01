import { iota } from '../libs/iota';
import { randomBytes } from 'react-native-randombytes';

export function checkNode() {
  return (dispatch) => {
    iota.api.getNodeInfo((error) => {
      if (!error) {
        dispatch(getAccountInfo(seed));
        console.log('SUCCESSFULLY CHECKED NODE');
      } else {
        console.log(error);
      }
    });
  };
}

export function getAccountInfo(seed) {
  return (dispatch) => {
    iota.api.getAccountData(seed, (error, success) => {
      if (!error) {
        Promise.resolve(dispatch(setAccountInfo(success))).then(dispatch(setReady()));
      } else {
        console.log('SOMETHING WENT WRONG: ', error);
      }
    });
  };
}

export function generateNewAddress(seed) {
  return (dispatch) => {
    iota.api.getNewAddress(seed, { checksum: true }, (error, success) => {
      if (!error) {
        dispatch(setAddress(success));
      } else {
        console.log('SOMETHING WENT WRONG: ', error);
      }
    });
  };
}

export function sendTransaction(seed, address, value, message) {
    // Stringify to JSON
  const messageStringified = JSON.stringify(message);
    // Convert to Trytes
  const messageTrytes = iota.utils.toTrytes(messageStringified);
  const transfer = [{
    address,
    value,
    message: messageTrytes,
  }];
    // Send transfer with depth 4 and minWeightMagnitude 18
  iota.api.sendTransfer(seed, 4, 18, transfer, (error, success) => {
    if (!error) {
      console.log('SOMETHING WENT WRONG: ', error);
    } else {
      console.log('SUCCESSFULLY SENT TRANSFER: ', success);
    }
  });
}

export function randomiseSeed() {
  return (dispatch) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    let seed = '';

    // uncomment for synchronous API, uses SJCL
    { /* var rand = randomBytes(1) */ }

    // asynchronous API, uses iOS-side SecRandomCopyBytes
    randomBytes(100, (error, bytes) => {
      if (!error) {
        Object.keys(bytes).map((key, index) => {
          if (bytes[key] < 243 && seed.length < 81) {
            const randomNumber = bytes[key] % 27;
            const randomLetter = charset.charAt(randomNumber);
            seed += randomLetter;
          }
        });
        dispatch(setSeed(seed));
      } else {
        console.log(error);
      }
    });
  };
}

function sortTransactions(transactions) {
  // Order transactions from oldest to newest
  const sortedTransactions = transactions.sort((a, b) => {
    if (a[0].timestamp > b[0].timestamp) {
      return -1;
    }
    if (a[0].timestamp < b[0].timestamp) {
      return 1;
    }
    return 0;
  });
  return sortedTransactions;
}

function addTransactionValues(transactions, addresses) {
  // Add transaction value property to each transaction object
  const updatedTransactions = transactions.map((arr) => {
    arr[0].transactionValue = 0;
    arr.map((obj) => {
      if (addresses.includes(obj.address)) {
        arr[0].transactionValue += obj.value;
      }
      return obj;
    });
    return arr;
  });
  return updatedTransactions;
}

export function setAccountInfo(accountInfo) {
  const balance = accountInfo.balance;
  let transactions = sortTransactions(accountInfo.transfers);
  transactions = addTransactionValues(transactions, accountInfo.addresses);
  return {
    type: 'SET_ACCOUNTINFO',
    balance,
    transactions,
  };
}

export function clearIOTA() {
  return {
    type: 'CLEAR_IOTA',
  };
}

export function setReady() {
  console.log('SUCCESSFULLY SET READY');
  return {
    type: 'SET_READY',
    payload: true,
  };
}

export function setPassword(password) {
  return {
    type: 'SET_PASSWORD',
    payload: password,
  };
}
export function setSeed(seed) {
  return {
    type: 'SET_SEED',
    payload: seed,
  };
}

export function setAddress(address) {
  return {
    type: 'SET_ADDRESS',
    payload: address,
  };
}
