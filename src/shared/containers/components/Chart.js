import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

/**
 * Chart component container
 * @ignore
 */
export default function withChartData(ChartComponent) {
    class ChartData extends React.Component {
        static propTypes = {
            marketData: PropTypes.object.isRequired,
            setTimeframe: PropTypes.func.isRequired,
            setCurrency: PropTypes.func.isRequired,
        };

        componentWillMount() {
            switch (this.props.marketData.currency) {
                case 'USD':
                    this.setState({ price: this.props.marketData.usdPrice });
                    break;
                case 'BTC':
                    this.setState({ price: this.props.marketData.btcPrice });
                    break;
                case 'ETH':
                    this.setState({ price: this.props.marketData.ethPrice });
                    break;
            }
        }

        render() {
            return <ChartComponent {...this.chartProps} />;
        }
    }

    const mapStateToProps = state => ({
        marketData: state.marketData,
    });

    const mapDispatchToProps = {};

    return translate()(connect(mapStateToProps, mapDispatchToProps)(ChartData));
}
