import React from 'react';
import { shallow } from 'enzyme';

import { Balance } from 'ui/components/Balance';

const props = {
    summary: false,
    index: 0,
    switchAccount: jest.fn(),
    seedIndex: 0,
    accounts: {
        accountInfo: {
            foo: {
                balance: 500,
            },
            bar: {
                balance: 100,
            },
        },
    },
    accountNames: ['foo', 'bar'],
    settings: {
        currency: 'USD',
        conversionRate: 1,
    },
    marketData: {
        usdPrice: 1,
    },
    t: (str) => str,
};

describe('Balance component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<Balance {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('Balance account name', () => {
        const wrapper = shallow(<Balance {...props} />);
        expect(wrapper.find('h3').text()).toEqual('foo');
    });
});
