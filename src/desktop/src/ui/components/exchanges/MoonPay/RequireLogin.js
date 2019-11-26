import React from 'react';
import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';
import { getAnimation } from 'animations';
import PropTypes from 'prop-types';
import css from './requireLogin.scss';

/**
 * (MoonPay) require login view
 */
export default class RequireLogin extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { history, t, themeName } = this.props;

        return (
            <div className={css.container}>
                <p>{t('moonpay:loginToViewPurchaseHistory')}</p>
                <div>
                    <Lottie
                        width={230}
                        height={230}
                        data={getAnimation('language', themeName)}
                        segments={[52, 431]}
                        loop
                    />
                </div>
                <div>
                    <Button className="small" onClick={() => history.push('/exchanges/moonpay')}>
                        {t('moonpay:loginToMoonPay')}
                    </Button>
                </div>
            </div>
        );
    }
}
