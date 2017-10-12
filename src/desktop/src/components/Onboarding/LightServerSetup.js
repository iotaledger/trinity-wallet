import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { addCustomNode, setFullNode } from 'actions/settings';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';
import Button from '../UI/Button';
import ServerSelect from '../UI/ServerSelect';

import css from '../Layout/Onboarding.css';

class LightServerSetup extends React.PureComponent {
    static propTypes = {
        addCustomNode: PropTypes.func.isRequired,
        setFullNode: PropTypes.func.isRequired,
        fullNode: PropTypes.string.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    };

    state = {
        fullNode: this.props.fullNode,
    };

    onCustomServerChange = e => {
        const { target: { value: customServer } } = e;
        this.setState(() => ({
            customServer,
        }));
    };

    onRequestNext = () => {
        const { customServer, fullNode } = this.state;
        const { history, addCustomNode, setFullNode } = this.props;

        if (customServer) {
            if (addCustomNode(customServer) && setFullNode(customServer)) {
                history.push('/onboarding/wallet');
                return;
            }
            return;
        }

        if (setFullNode(fullNode)) {
            history.push('/onboarding/wallet');
            return;
        }
    };

    setServer = server => {
        this.setState(() => ({
            fullNode: server,
            customServer: null,
        }));
    };

    render() {
        const { t } = this.props;
        const { fullNode } = this.state;
        return (
            <div>
                <Header headline={t('title')} />
                <main>
                    <p>{t('text1')}</p>
                    <p>{t('text2')}</p>
                    <p>{t('text3')}</p>
                    <div className={css.formGroup}>
                        <label>{t('server_label')}</label>
                        <ServerSelect onChange={this.setServer} fullNode={fullNode} />
                    </div>
                    {fullNode === '' && (
                        <div className={css.formGroup}>
                            <label>{t('custom_server_label')}</label>
                            <input type="text" name="customServer" onChange={this.onCustomServerChange} autoFocus />
                        </div>
                    )}
                </main>
                <footer>
                    <ButtonLink to="/onboarding/instructions" variant="warning">
                        {t('button2')}
                    </ButtonLink>
                    <Button onClick={this.onRequestNext} variant="success">
                        {t('button1')}
                    </Button>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    fullNode: state.settings.fullNode,
});

const mapDispatchToProps = {
    addCustomNode,
    setFullNode,
};

export default translate('lightserver')(connect(mapStateToProps, mapDispatchToProps)(LightServerSetup));
