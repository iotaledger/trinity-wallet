import React from 'react';
import PropTypes from 'prop-types';

import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';
import Scrollbar from 'ui/components/Scrollbar';

import { getAnimation } from 'animations';

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
        /** @ignore */
        setLoggingIn: PropTypes.func.isRequired,
    };

    render() {
        const { setLoggingIn, history, t, themeName } = this.props;

        return (
            <Scrollbar>
                <div className={css.container}>
                    <p>{t('moonpay:loginToViewPurchaseHistory')}</p>
                    <div>
                        <Lottie
                            width={150}
                            height={150}
                            data={getAnimation('welcome', themeName)}
                            segments={[161, 395]}
                            loop
                        />
                    </div>
                    <div>
                        <Button className="small" onClick={() => {
                            setLoggingIn(true);
                            history.push('/exchanges/moonpay')}
                        }>
                            {t('moonpay:openMoonPay')}
                        </Button>
                    </div>
                </div>
            </Scrollbar>
        );
    }
}
