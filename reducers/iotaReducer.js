const iotaReducer = (state = {
  balance: 0, ready: false, addresses: [], seed: ''
}, action) => {
  switch (action.type) {
    case 'SET_ACCOUNTINFO':
      state = {
        ...state,
        balance: action.balance,
        fullBalance: action.fullBalance,
        balanceUnit: action.balanceUnit,
        needPlusSign: action.needPlusSign,
        transactions: action.transactions,
      };
      break;
    case 'SET_SEED':
      state = {
        ...state,
        seed: action.payload,
      };
      break;
    case 'SET_ADDRESS':
      state = {
        ...state,
        addresses: [...state.addresses, action.payload],
      };
      break;
    case 'SET_READY':
      state = {
        ...state,
        ready: action.payload,
      };
      break;
  }
  return state;
};

export default iotaReducer;
