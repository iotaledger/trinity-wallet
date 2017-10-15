import toUpper from 'lodash/toUpper';
import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { translate } from 'react-i18next';
import BoxedSeed from '../UI/BoxedSeed';
import Header from './Header';
import Button from '../UI/Button';
import Steps from '../UI/Steps';

class SeedCopyToClipboard extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    static defaultProps = {
        seed: 'BSWMMBSBPVWAXYYVTYAAHDONCCZIXGJCMQOXTRGKK9PIVVRCMXYJWKUBWHOP9VUIZNFTIKHOIYKTIODGD',
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
                            <Button variant="success">{t('button1')}</Button>
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

export default translate('saveYourSeed3')(SeedCopyToClipboard);
