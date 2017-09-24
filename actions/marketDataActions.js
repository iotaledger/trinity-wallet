// FIXME: Hacking no-console linting.
// FIXME: Get rid of the unnecessary break statements.
// FIXME: Add a default case for all the switch statements
// Should rather be dispatching an action.

/* eslint-disable no-console */

export function setTimeFrame(timeFrame) {
  return {
    type: 'SET_TIMEFRAME',
    payload: timeFrame,
  };
}

function setChartData(json, timeValue) {
  const data = [];
  for (let i = 0; i <= timeValue; i++) {
    data[i] = { x: i, y: parseFloat(json.Data[i].close) };
  }
  return {
    type: 'SET_CHARTDATA',
    payload: data,
  };
}

export function setMarketData(data) {
  return {
    type: 'SET_MARKETDATA',
    usdPrice: data.RAW.IOT.USD.PRICE,
    mcap: (Math.round(data.RAW.IOT.USD.PRICE * 2779530283)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    volume: (Math.round(data.RAW.IOT.USD.VOLUME24HOUR)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    change24h: parseFloat(Math.round(data.RAW.IOT.USD.CHANGEPCT24HOUR * 100) / 100).toFixed(2),
  };
}

export function setCurrency(currency) {
  return {
    type: 'SET_CURRENCY',
    payload: currency,
  };
}

export function setPrice(currency, data) {
  switch (currency) {
    case 'USD':
      return {
        type: 'SET_PRICE',
        payload: data.RAW.IOT[currency].PRICE,
      };
    case 'BTC':
      return {
        type: 'SET_PRICE',
        payload: parseFloat(data.RAW.IOT[currency].PRICE).toFixed(6),
      };
    case 'ETH':
      return {
        type: 'SET_PRICE',
        payload: parseFloat(data.RAW.IOT[currency].PRICE).toFixed(5),
      };
  }
}


function getUrlTimeFormat(timeFrame) {
  // Used for setting correct CryptoCompare URL when fetching chart data
  switch (timeFrame) {
    case '24h':
      return 'hour';
      break;
    case '7d':
      return 'day';
      break;
    case '1m':
      return 'day';
      break;
    case '1h':
      return 'minute';
      break;
    case '6h':
      return 'hour';
      break;
  }
}

function getUrlNumberFormat(timeFrame) {
  // Used for setting correct CryptoCompare URL when fetching chart data
  switch (timeFrame) {
    case '24h':
      return '23';
      break;
    case '7d':
      return '6';
      break;
    case '1m':
      return '29';
      break;
    case '1h':
      return '59';
      break;
    case '6h':
      return '5';
      break;
  }
}

export function getPrice(currency) {
  return dispatch => fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,BTC,ETH').then(
    response => response.json(),
    error => console.log('SOMETHING WENT WRONG: ', error),
  ).then(json => dispatch(setPrice(currency, json)),
  );
}

export function getChartData(currency, timeFrame) {
  return (dispatch) => {
    const url = `https://min-api.cryptocompare.com/data/histo${getUrlTimeFormat(timeFrame)}?fsym=IOT&tsym=${currency}&limit=${getUrlNumberFormat(timeFrame)}`;
    return fetch(url)
      .then(
        response => response.json(),
        error => console.log('SOMETHING WENT WRONG: ', error),
      ).then(json => dispatch(setChartData(json, getUrlNumberFormat(timeFrame))));
  };
}

export function getMarketData() {
  return dispatch => fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
    .then(
      response => response.json(),
      error => console.log('SOMETHING WENT WRONG: ', error),
    ).then(json => dispatch(setMarketData(json)));
}

export function changeCurrency(currency, timeFrame) {
  return (dispatch) => {
    dispatch(setCurrency(currency));
    dispatch(getPrice(currency));
    dispatch(getChartData(currency, timeFrame));
  };
}
export function changeTimeFrame(currency, timeFrame) {
  return (dispatch) => {
    dispatch(setTimeFrame(timeFrame));
    dispatch(getPrice(currency));
    dispatch(getChartData(currency, timeFrame));
  };
}
