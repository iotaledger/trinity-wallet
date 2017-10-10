import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';
import ButtonLink from '../UI/ButtonLink';

class SeedManualCopy extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;
        return <section>Seed Manual Copy</section>;
    }
}

export default translate('seedManualCopy')(SeedManualCopy);
