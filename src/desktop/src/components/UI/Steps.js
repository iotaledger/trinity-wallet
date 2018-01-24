import each from 'lodash/each';
import startCase from 'lodash/startCase';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import css from './Steps.css';

export default class Steps extends PureComponent {
    static propTypes = {
        steps: PropTypes.array,
        currentStep: PropTypes.oneOf(['manual', 'clipboard', 'paper']).isRequired
    };

    static defaultProps = {
        steps: ['manual_copy', 'paper_wallet', 'copy_to_clipboard']
    };

    renderSteps(steps, currentStep) {
        const asUiElements = [];
        const pattern = value => new RegExp(value);
        const isSelected = value => pattern(currentStep).test(value);

        let k = 0;
        each(steps, (step, i) => {
            asUiElements.push(
                <span {...isSelected(step) && { className: css.colorOverride }} key={k}>
                    {startCase(step)}
                </span>
            );
            k += 1;
            if (i < steps.length - 1) {
                asUiElements.push(<div key={k + 1} className={css.separator} />);
                k += 2;
            }
        });

        return asUiElements;
    }

    render() {
        const { steps, currentStep } = this.props;
        return <div className={css.wrapper}>{this.renderSteps(steps, currentStep)}</div>;
    }
}
