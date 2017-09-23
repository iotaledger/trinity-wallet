const iotaReducer = (state = {
  balance: 0, 
  ready: false, 
  addresses: [], 
  password: '', 
  seed: ''
}, action) => {
  switch (action.type) {
    case 'SET_ACCOUNTINFO':
      state = {
        ...state,
        balance: action.balance,
        transactions: action.transactions,
      };
      break;
    case 'SET_SEED':
      state = {
        ...state,
        seed: action.payload,
      };
      break;
    case 'SET_PASSWORD':
      state = {
        ...state,
        password: action.payload,
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
    case 'CLEAR_IOTA':
      state = {
        ...state,
        balance: 0,
        transactions: [],
        addresses: [],
        seed: '',
        password: '',
        ready: false,
      };
      break;
  }
  return state;
};

export default iotaReducer;
