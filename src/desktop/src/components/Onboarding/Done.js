import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { setOnboardingCompletionStatus } from 'actions/app';
import Button from 'ui/components/Button';
import Template, { Content, Footer } from './Template';
import css from '../Layout/Onboarding.css';

class Done extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        setOnboardingCompletionStatus: PropTypes.func.isRequired,
    };

    onRequestNext = () => {
        const { history, setOnboardingCompletionStatus } = this.props;

        setOnboardingCompletionStatus(true);
        history.push('/');
    };

    render() {
        const { t } = this.props;
        return (
            <Template bodyClass={css.bodyHome}>
                <Content>
                    <div>
                        <p>{t('onboardingComplete:walletReady')}</p>
                    </div>
                </Content>
                <Footer>
                    <Button onClick={this.onRequestNext} className="outline" variant="primary">
                        {t('global:done')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    setOnboardingCompletionStatus,
};

export default translate('onboardingComplete')(connect(mapStateToProps, mapDispatchToProps)(Done));
