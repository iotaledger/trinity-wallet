import toUpper from 'lodash/toUpper';
import React from 'react';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { translate } from 'react-i18next';
import OnboardingTemplate from './OnboardingTemplate';
import BoxedSeed from './BoxedSeed';
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
            <OnboardingTemplate
                header={toUpper('save your seed')}
                subHeader={<Steps />}
                main={
                    <div style={{ display: 'flex', flex: 5, flexDirection: 'column', justifyContent: 'space-around' }}>
                        <BoxedSeed t={t} seed={seed} />
                        <CopyToClipboard text={seed}>
                            <Button variant="success">{t(toUpper('Copy to clipboard'))}</Button>
                        </CopyToClipboard>
                    </div>
                }
                footer={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/" variant="warning">
                            {t(toUpper('done'))}
                        </Button>
                    </div>
                }
            />
        );
    }
}

export default translate('seedManualCopy')(SeedCopyToClipboard);
