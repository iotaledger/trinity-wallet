import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Template, { Content, Footer } from '../Onboarding/Template';
import PasswordInput from 'components/UI/PasswordInput';
import Button from 'components/UI/Button';
import css from '../Layout/Onboarding.css';

class Login extends React.Component {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };

    handleSubmit = () => {
        this.props.history.push('/balance');
    };

    render() {
        // const { t } = this.props;
        return (
            <div className={css.wrapper}>
                <Template type="form" onSubmit={this.handleSubmit}>
                    <Content>
                        <p>
                            <label>Password:</label>
                            <PasswordInput name="password" />
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
    // addCustomNode,
    // setFullNode,
};

export default translate('balance')(connect(mapStateToProps, mapDispatchToProps)(Login));
