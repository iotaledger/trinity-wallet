import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import CustomTextInput from 'ui/components/CustomTextInput';
import DropdownComponent from 'ui/components/Dropdown';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: height / 60,
        height: height / 10,
        width,
    },
    inner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: Styling.contentWidth,
        flex: 1,
    },
    filterButton: {
        width: Styling.contentWidth * 0.28,
        height: height / 14,
        marginBottom: height / 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Styling.borderRadius,
    },
    filterText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
    },
    filterQuantityText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
    },
});

export default class TransactionFilters extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        totals: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Set history filter */
        setFilter: PropTypes.func.isRequired,
        /** Set search query */
        setSearch: PropTypes.func.isRequired,
        /** Current search query */
        search: PropTypes.string.isRequired,
        /** Current history filter */
        filter: PropTypes.string.isRequired,
    };

    renderFilterButton() {
        const {
            t,
            theme: { input },
            totals,
            filter,
        } = this.props;

        return (
            <TouchableOpacity
                style={[styles.filterButton, { backgroundColor: input.bg }]}
                onPress={() => this.openDropdown()}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ maxWidth: Styling.contentWidth * 0.26, textAlign: 'center' }}>
                        <Text numberOfLines={1} style={[styles.filterText, { color: input.color }]}>
                            {t(filter.toLowerCase())}{' '}
                        </Text>
                        <Text style={[styles.filterQuantityText, { color: input.color }]}>({totals[filter]})</Text>
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        const filters = ['All', 'Sent', 'Received', 'Pending'];
        const { theme, t, filter, search } = this.props;

        const dropdownOptions = filters.map((item) => {
            return t(item.toLowerCase());
        });

        return (
            <View style={styles.container}>
                <View style={styles.inner}>
                    <DropdownComponent
                        value={filter}
                        options={dropdownOptions}
                        saveSelection={(item) => this.props.setFilter(filters[dropdownOptions.indexOf(item)])}
                        customView={this.renderFilterButton()}
                        dropdownStyle={{ width: Styling.contentWidth * 0.2, marginRight: Styling.contentWidth * 0.03 }}
                    />
                    <CustomTextInput
                        onRef={(c) => {
                            this.search = c;
                        }}
                        value={search}
                        inputWidth={Styling.contentWidth * 0.69}
                        onValidTextChange={(search) => this.props.setSearch(search)}
                        returnKeyType="next"
                        theme={theme}
                        autoCapitalize="none"
                        autoCorrect={false}
                        enablesReturnKeyAutomatically
                        widgets={['search']}
                        placeholder={t('history:typeHelp')}
                        searchValue={search}
                        clearSearch={() => this.props.setSearch('')}
                    />
                </View>
            </View>
        );
    }
}
