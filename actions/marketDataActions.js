export function getPrice(currency) {
  return function (dispatch) {
    return fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD,BTC,ETH')
          .then(
              response => response.json(),
              error => console.log('SOMETHING WENT WRONG: ', error),
          )
          .then(json => dispatch(setPrice(currency, json)),
          );
  };
}

export function getChartData(currency, timeFrame) {
  return function (dispatch) {
    const url = `https://min-api.cryptocompare.com/data/histo${getTimeValues(timeFrame)[0]}?fsym=IOT&tsym=${currency}&limit=${getTimeValues(timeFrame)[1]}`;
    return fetch(url)
          .then(
              response => response.json(),
              error => console.log('SOMETHING WENT WRONG: ', error),
          )
          .then(json => dispatch(setChartData(json, getTimeValues(timeFrame)[1])),
          );
  };
}

export function getMarketData() {
  return function (dispatch) {
    return fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=IOT&tsyms=USD')
          .then(
              response => response.json(),
              error => console.log('SOMETHING WENT WRONG: ', error),
          )
          .then(json => dispatch(setMarketData(json)),
          );
  };
}

function getTimeValues(timeFrame) {
  // Used for setting correct CryptoCompare URL when fetching chart data
  switch (timeFrame) {
    case '24h':
      return (['hour', '23']);
      break;
    case '7d':
      return (['day', '6']);
      break;
    case '1m':
      return (['day', '29']);
      break;
    case '1h':
      return (['minute', '59']);
      break;
    case '6h':
      return (['hour', '5']);
      break;
  }
}

export function changeCurrency(currency, timeFrame) {
  return function (dispatch) {
    dispatch(setCurrency(currency));
    dispatch(getPrice(currency));
    dispatch(getChartData(currency, timeFrame));
  };
}
export function changeTimeFrame(currency, timeFrame) {
  return function (dispatch) {
    dispatch(setTimeFrame(timeFrame));
    dispatch(getPrice(currency));
    dispatch(getChartData(currency, timeFrame));
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

export function setMarketData(data) {
  return {
    type: 'SET_MARKETDATA',
    usdPrice: data.RAW.IOT.USD.PRICE,
    mcap: (Math.round(data.RAW.IOT.USD.PRICE * 2779530283)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    volume: (Math.round(data.RAW.IOT.USD.VOLUME24HOUR)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
    change24h: parseFloat(Math.round(data.RAW.IOT.USD.CHANGEPCT24HOUR * 100) / 100).toFixed(2),
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

export function setCurrency(currency) {
  return {
    type: 'SET_CURRENCY',
    payload: currency,
  };
}

export function setTimeFrame(timeFrame) {
  return {
    type: 'SET_TIMEFRAME',
    payload: timeFrame,
  };
}
