import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSecurelyPersistedSeeds } from 'libs/util';
import { showError } from 'actions/notifications';
import Template, { Content, Footer } from '../Onboarding/Template';
import PasswordInput from 'components/UI/PasswordInput';
import Button from 'components/UI/Button';
import css from '../Layout/Onboarding.css';

class Login extends React.Component {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        showError: PropTypes.func.isRequired,
    };

    changeHandler = e => {
        const { target: { name, value } } = e;
        this.setState(() => ({
            [name]: value,
        }));
    };

    handleSubmit = e => {
        e.preventDefault();
        const { password } = this.state;
        const { showError } = this.props;
        try {
            const seeds = getSecurelyPersistedSeeds(password);
            console.log('SEEDS:', seeds);
            // if (seeds) {
            // }
            this.props.history.push('/balance');
        } catch (err) {
            showError({
                title: 'Wrong PW',
                text: 'Your password was wrong',
            });
        }
    };

    render() {
        // const { t } = this.props;
        return (
            <div className={css.wrapper}>
                <Template type="form" onSubmit={this.handleSubmit}>
                    <Content>
                        <p>
                            <label>Password:</label>
                            <PasswordInput name="password" onChange={this.changeHandler} />
                        </p>
                    </Content>
                    <Footer>
                        <Button to="/seedlogin" variant="warning">
                            USE SEED
                        </Button>
                        <Button variant="success">DONE</Button>
                    </Footer>
                </Template>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    // fullNode: state.settings.fullNode,
});

const mapDispatchToProps = {
    showError,
    // addCustomNode,
    // setFullNode,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Login));
