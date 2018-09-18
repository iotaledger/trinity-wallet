/*eslint-disable no-unused-vars*/
export const ChartDataSchema = {
  name: 'ChartData',
  primaryKey: 'currency',
  properties: {
    currency: 'string',
    data: 'DataForTimeframe[]',
  },
};

export const DataForTimeframeSchema = {
  name: 'DataForTimeframe',
  primaryKey: 'timeframe',
  properties: {
    timeframe: 'string',
    data: 'DataPoint[]'
  },
};

export const DataPointSchema = {
  name: 'DataPoint',
  primaryKey: 'id',
  properties: {
    id: 'string',
    x: 'int',
    y: 'float',
    time: 'int',
  },
};
