import React from 'react';

import PasswordInput from 'ui/components/input/Password';
import SeedInput from 'ui/components/input/Seed';
import AmountInput from 'ui/components/input/Amount';
import MessageInput from 'ui/components/input/Message';
import Select from 'ui/components/input/Select';

class Inputs extends React.PureComponent {
    state = {
        password: '',
        seed: '',
        ammount: '0',
        message: '',
    };

    render() {
        return (
            <div>
                <h1>Input fields</h1>
                <form>
                    <Select label="Select" defaultValue="en" onChange={() => {}}>
                        <option value="en">English (International)</option>
                        <option value="ar">عربى - Arabic</option>
                        <option value="da">Dansk - Danish</option>
                        <option value="de">Deutsch - German</option>
                        <option value="el">Ελληνικά - Greek</option>
                    </Select>
                    <PasswordInput
                        value={this.state.password}
                        label="Password"
                        name="password"
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <SeedInput
                        seed={this.state.seed}
                        label="Seed"
                        closeLabel="Back"
                        onChange={(value) => this.setState({ seed: value })}
                    />
                    <AmountInput
                        amount={this.state.ammount}
                        settings={{ currency: 'USD' }}
                        label="Amount"
                        labelMax="Send maximum"
                        balance={2000}
                        onChange={(value) => this.setState({ ammount: value })}
                    />
                    <MessageInput
                        message={this.state.message}
                        label="Auto size"
                        onChange={(value) => this.setState({ message: value })}
                    />
                </form>
            </div>
        );
    }
}

export default Inputs;
