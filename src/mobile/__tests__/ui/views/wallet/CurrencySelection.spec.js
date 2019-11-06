import PropTypes from 'prop-types';
import { CurrencySelection } from 'ui/views/wallet/CurrencySelection';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));
jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

describe('Testing CurrencySelection component', () => {
    describe('propTypes', () => {
        it('should require a setCurrency function as a prop', () => {
            expect(CurrencySelection.propTypes.setCurrency).toBe(PropTypes.func.isRequired);
        });

        it('should require a currency string as a prop', () => {
            expect(CurrencySelection.propTypes.currency).toBe(PropTypes.string.isRequired);
        });

        it('should require a sendDenomination string as a prop', () => {
            expect(CurrencySelection.propTypes.sendDenomination).toBe(PropTypes.string.isRequired);
        });

        it('should require a qrDenomination string as a prop', () => {
            expect(CurrencySelection.propTypes.qrDenomination).toBe(PropTypes.string.isRequired);
        });

        it('should require a t function as a prop', () => {
            expect(CurrencySelection.propTypes.t).toBe(PropTypes.func.isRequired);
        });

        it('should require a setSetting function as a prop', () => {
            expect(CurrencySelection.propTypes.setSetting).toBe(PropTypes.func.isRequired);
        });

        it('should require a theme object as a prop', () => {
            expect(CurrencySelection.propTypes.theme).toBe(PropTypes.object.isRequired);
        });
    });
});
