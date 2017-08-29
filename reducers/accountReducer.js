const accountReducer = (state = {
}, action) => {
  switch (action.type) {

    case 'SET_LOGGEDIN':
      state = {
        ...state,
        loggedIn: action.payload,
      };
      break;
  }
  return state;
};

export default accountReducer;
