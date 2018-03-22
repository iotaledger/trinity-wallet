import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';
import { setActivationCode } from 'actions/app';
import { checkActivationCode } from 'libs/crypto';

import Button from 'ui/components/Button';
import Text from 'ui/components/input/Text';

import css from './index.css';

/**
 * Alpha version activation view
 */
class Activation extends React.PureComponent {
    static propTypes = {
        /** UUID of the machine */
        uuid: PropTypes.string.isRequired,
        /** Set activation code
         * @ignore
         */
        setActivationCode: PropTypes.func.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
    };

    state = {
        input: '',
        loading: false,
    };

    setCode = (e) => {
        const { uuid, setActivationCode, generateAlert } = this.props;
        const { input, loading } = this.state;

        e.preventDefault();

        if (loading) {
            return;
        }

        if (input.length < 256 && /(.+)@(.+){2,}\.(.+){2,}/.test(input)) {
            this.setState({
                loading: true,
            });

            const data = {
                email: input,
                uuid: uuid,
            };

            fetch('https://trinity-alpha-fphqhjwuwu.now.sh', {
                method: 'POST',
                body: JSON.stringify(data),
            })
                .then(() => {
                    this.setState({
                        loading: false,
                        input: '',
                    });

                    generateAlert(
                        'success',
                        'Activation code sent',
                        'You should receive an activation code in a few minutes.',
                    );
                })
                .catch(() => {
                    generateAlert('error', 'Error requesting activation code', 'Something went wrong :/');
                });
        } else if (checkActivationCode(input, uuid)) {
            setActivationCode(input);
        } else {
            generateAlert('error', 'Incorrect activation code', 'You entered an invalid activation code or e-mail.');
        }
    };

    render() {
        return (
            <main className={css.onboarding}>
                <header />
                <section>
                    <form className="center" onSubmit={this.setCode}>
                        <fieldset>
                            <h2>Activate your copy of Trinity wallet</h2>
                            <p>Enter your activation code or e-mail below</p>
                            <Text value={this.state.input} onChange={(value) => this.setState({ input: value })} />
                            <Button type="submit" loading={this.state.loading} className="large" variant="primary">
                                Activate
                            </Button>
                        </fieldset>
                    </form>
                </section>
                <footer />
            </main>
        );
    }
}

const mapDispatchToProps = {
    setActivationCode,
    generateAlert,
};

export default connect(null, mapDispatchToProps)(Activation);
