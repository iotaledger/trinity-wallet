import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { showNotification } from 'actions/notifications';
import { clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Button from 'ui/components/Button';
import Template, { Content, Footer } from './Template';
import BoxedSeed from '../UI/BoxedSeed';
// import { ipcRenderer } from 'electron';

// ipcRenderer.on('wrote-pdf', function (event, path) {
//   const message = `Wrote PDF to: ${path}`
//   document.getElementById('pdf-path').innerHTML = message
// })

// ipcRenderer.removeListener('')

// const print = () => {
//     ipcRenderer.send('print-to-pdf');
// };

import css from '../Layout/Onboarding.css';

class SaveYourSeed extends PureComponent {
    static propTypes = {
        showNotification: PropTypes.func.isRequired,
        seed: PropTypes.string,
        t: PropTypes.func.isRequired,
    };

    render() {
        const { seed, showNotification, t } = this.props;

        return (
            <Template className={css.saveYourSeed} headline={t('title')}>
                <Content>
                    <p>{t('text1')}</p>
                    <div className={css.seedWrapper}>
                        <div className={css.seed}>
                            <BoxedSeed t={t} seed={seed} color="black" size="default" />
                        </div>
                        <div className={css.qr}>
                            <QRCode size={192} value={seed} />
                        </div>
                    </div>
                    <p>{t('saveYourSeed2:explanation')}</p>
                    <div className="printHidden">
                        <CopyToClipboard text={seed}>
                            <Button
                                variant="cta"
                                onClick={() =>
                                    showNotification({
                                        type: 'success',
                                        title: 'Seed copied to clipboard!',
                                        text:
                                            'Copy your seed to a password manager and do not store the seed in plain text. The seed will stay in your clipboard for 60 seconds',
                                    })
                                }
                            >
                                {t('optionC')}
                            </Button>
                        </CopyToClipboard>
                        <Button onClick={() => window.print()} variant="cta">
                            {t('optionB')}
                        </Button>
                    </div>
                </Content>
                <Footer className="printHidden">
                    <Button to="/seed/generate" variant="negative">
                        {t('button2')}
                    </Button>
                    {/* TODO: Remove the console log and think of a solution when to actually clear the seeds */}
                    <Button to="/seed/enter" onClick={() => console.log('CLEAR SEEDS HERE')} variant="success">
                        {t('button1')}
                    </Button>
                </Footer>
            </Template>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    clearSeeds,
    showNotification,
};

export default translate(['saveYourSeed', 'saveYourSeed2'])(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeed));
