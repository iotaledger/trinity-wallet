import React from 'react';
import { shallow } from 'enzyme';

import { BalanceComponent as Balance } from 'ui/components/Balance';

const props = {
    summary: false,
    index: 0,
    switchAccount: jest.fn(),
    seedIndex: 0,
    accounts: {
        accountInfo: {
            foo: {
                balance: 5500000,
            },
            bar: {
                balance: 4000000,
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

    test('Balance account iotas value', () => {
        const wrapper = shallow(<Balance {...props} />);

        expect(wrapper.find('h1').text()).toEqual('5.5Mi');
    });

    test('Balance account monetary value', () => {
        const wrapper = shallow(<Balance {...props} />);

        expect(wrapper.find('h2').text()).toEqual('$ 5.50');
    });

    test('Summary account name', () => {
        const mockProps = Object.assign({}, props, { summary: true, index: -1 });
        const wrapper = shallow(<Balance {...mockProps} />);

        expect(wrapper.find('h3').text()).toEqual('totalBalance');
    });

    test('Summary iota value', () => {
        const mockProps = Object.assign({}, props, { summary: true, index: -1 });
        const wrapper = shallow(<Balance {...mockProps} />);

        expect(wrapper.find('h1').text()).toEqual('9.5Mi');
    });

    test('Summary monetary value', () => {
        const mockProps = Object.assign({}, props, { summary: true, index: -1 });
        const wrapper = shallow(<Balance {...mockProps} />);

        expect(wrapper.find('h2').text()).toEqual('$ 9.50');
    });

    test('Summary account switch', () => {
        const mockProps = Object.assign({}, props, { summary: true, index: -1 });
        const wrapper = shallow(<Balance {...mockProps} />);

        wrapper
            .find('a')
            .first()
            .simulate('click');
        expect(mockProps.switchAccount).toHaveBeenCalledTimes(1);
    });
});
