import React from 'react';
import { shallow } from 'enzyme';
import { LineChart } from 'recharts';

import { ChartComponent as Chart } from 'ui/components/Chart';
import defaultTheme from 'themes/themes/Default';

const props = {
    priceData: {
        currency: 'USD',
        globalSymbol: '$',
        symbol: '$',
        price: 1,
        volume: '100',
        change24h: '3',
        mcap: '1000000',
        rates: {}
    },
    chartData: {
        data: [{ x: 0, y: 0, time: 0 }],
        timeframe: '24h',
        yAxis: { ticks: [0] },
    },
    setCurrency: jest.fn(),
    setTimeframe: jest.fn(),
    getPriceForCurrency: (str) => str,
    getPriceFormat: (str) => str,
    theme: defaultTheme,
    t: (str) => str,
};

describe('Chart component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Chart {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Chart currency title', () => {
        const wrapper = shallow(<Chart {...props} />);

        expect(wrapper.find('h3').text()).toEqual('MIOTA/USD');
    });

    test('Render chart component', () => {
        const wrapper = shallow(<Chart {...props} />);

        expect(wrapper.find(LineChart)).toHaveLength(1);
    });

    test('Chart alter controls', () => {
        const wrapper = shallow(<Chart {...props} />);

        const buttonItems = wrapper.find('Button');
        const callbacks = [props.setCurrency, props.setTimeframe];

        buttonItems.forEach((item, index) => {
            item.simulate('click');
            expect(callbacks[index]).toHaveBeenCalledTimes(1);
        });
    });

    test('Market data stats', () => {
        const wrapper = shallow(<Chart {...props} />);

        const listItems = wrapper.find('ul li');
        const listValues = ['chart:mcap: $ 1000000', 'chart:change: 3%', 'chart:volume: $ 100'];

        listItems.forEach((item, index) => {
            expect(item.text()).toEqual(listValues[index]);
        });
    });
});
