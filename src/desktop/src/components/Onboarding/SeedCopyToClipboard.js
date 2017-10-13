import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showNotification } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';
import BoxedSeed from './BoxedSeed';
import Header from './Header';
import Button from '../UI/Button';
import Steps from '../UI/Steps';

class SeedCopyToClipboard extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <Header title={t('title')} />
                <Steps />
                <main>
                    <div style={{ display: 'flex', flex: 5, flexDirection: 'column', justifyContent: 'space-around' }}>
                        <BoxedSeed t={t} seed={seed} />
                        <CopyToClipboard text={seed}>
                            <Button
                                variant="success"
                                onClick={() =>
                                    this.props.showNotification({
                                        type: 'success',
                                        title: 'Seed copied to clipboard!',
                                    })}
                            >
                                {t('button1')}
                            </Button>
                        </CopyToClipboard>
                    </div>
                </main>
                <footer>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/" variant="warning">
                            {t('button2')}
                        </Button>
                    </div>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showNotification,
};

export default translate('saveYourSeed3')(connect(mapStateToProps, mapDispatchToProps)(SeedCopyToClipboard));
