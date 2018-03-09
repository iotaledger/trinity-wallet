# Trinity codebase and UI styleguide
The goal of this documentation is to comprehensively define best practice for the Trinity codebase and user interface styling.

## Table of Contents

### Codebase
   1. [Naming](#naming)
   1. [Formatting](#formatting)
   1. [Documentation](#documentation)
   1. [Design patterns](#design-patterns)
      1. [Presentational components](#presentational-components)
      1. [Container components](#container-components)
   1. [State](#state)
      1. [Reducers](#reducers)
      1. [Actions](#actions)
   1. [Unit Testing](#unit-testing)
      1. [React components](#react-components)
      1. [Reducers](#reducers)
      1. [Actions](#actions)

### Assets and themes
   1. [Assets](#assets)
      1. [Icons](#icons)
      1. [Animations](#animations)
   1. [Themes](#themes)
      1. [Color meaning and usage](#color-meaning-and-usage)
      1. [Styleguide](#styleguide)

---

## Naming

- **Filenames**: Use PascalCase for filenames.
- **Component Naming**: Use the filename as the component name. Do not use `displayName` for naming components.
- **Reference Naming**: Use PascalCase for React components and camelCase for their instances.
- **Props Naming**: Always use camelCase for prop names.

```jsx
// Component names match filenames in PascalCase
import HistoryList from 'components/HistoryList';
// Props names in camelCase
<HistoryList historyItems={items} />
// Reference names in camelCase
const historyList = <HistoryList />;
```
- **Container Naming:** Provide the passed-in component's name and the containers name as the displayName on the generated component.

```jsx
export default function withChartData(ChartComponent) {
    class ChartData extends React.Component {
        render() {
            const chartProps = {};
            return <ChartComponent {...chartProps}/>;
        }
    }
    // Set displayName containing wrapped component's name
    ChartData.displayName = `withChartData(${ChartComponent.name})`;
    
    return ChartData;
}
```

## Formatting
Follow the code structure, formatting and overall best practice described in detail in [Airbnb React Style Guide](https://github.com/airbnb/javascript) and defined in Eslint configuration of the wallet. Run `eslint src/desktop/src/` or `eslint src/mobile/src/` to check for formatting errors.

## Documentation
All React components and containers should have a general description (purpose, functionality) and the description of it's propTypes in [JSDoc](http://usejsdoc.org) format:

```javascript
import React from 'react'
import PropTypes from 'prop-types'

/**
 * General component description.
 */
export default class Button extends React.Component {
  static propTypes = {
    /** Description of prop "foo". */
    foo: PropTypes.number,
    /** Description of prop "baz". */
    baz: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }
}
```
## Design patterns
The application follows higher-order component pattern by splitting platform (mobile and desktop) dependent presentational components and shared platform independent container components.

### Presentational components

- Presentational components are concerned only with the UI output. They are not bound to the redux state and have no external dependencies (except UI libraries and helpers).
- Presentational components are split between desktop and mobile.
- By default presentational components should be implemented as stateless functional components without internal state. The exception are components dealing with non-persistent visual state (e.g. a password input toggle for hidden/visible characters).

```jsx
import React, { PureComponent } from 'react';
import withPriceData from 'containers/components/Price';

/**
 * Description of the Price component
 */
class Price extends PureComponent {

    static propTypes = {
       /* Current market price */
       price: PropTypes.number.isRequired,
    };
    
    render() {
        return (
            <h1>{this.props.price}</h1>
        );
    }
}

export default withPriceData(Price);

```
For a full example, see the components located at `/src/desktop/src/ui/` or `/src/mobile/src/ui/`.

### Container components

- Container components deal with the business logic of the application. They are bound to the redux state, deal with component lifecycle (mounting) hooks and data processing.
- Container components should be resuable for desktop and mobile.
- Container component render function holds only the presentational component passed as a prop to the container.

```jsx
import React from 'react';
import { connect } from 'react-redux';

/**
 * Description of the Price container
 * @ignore
 */
export default function withPriceData(PriceComponent) {
    class PriceData extends React.Component {
        static propTypes = {
            marketData: PropTypes.object.isRequired,
        };

        preparePrice(marketData){
           //[...] 
        }

        render() {

            const priceProps = {
                price: this.preparePrice(this.props.marketData)
            };

            return <PriceComponent {...priceProps} />;
        }
    }

    PriceData.displayName = `withPriceData(${PriceComponent.name})`;

    const mapStateToProps = (state) => ({
        marketData: state.marketData
    });

    return connect(mapStateToProps)(PriceData));
}
```
For a full example, see the containers located at `/src/shared/containers/`.

## WIP: State
[WIP]

### Reducers
- Expose reducers as the default export.
- Expose handlers as named exports for unit testing.
- Use constants instead of inline strings for action types.
- Always define an `initialState` variable.

```javascript
import { ActionTypes } from '../actions/account';

const initialState = {};

export default (state = initialState, action) => { };
```
- Aggregate all booleans associated with components in a single `ui` reducer and based on their purposes further break them down via `combineReducers`.
- Aggregate similar state into a single reducer. Since redux allows you to update multiple reducers with a single action, makes it easier to update different parts of the state.

```js
import { ActionTypes } from '../actions/account';

const initialState = {
    isUpdatingAccount: false
};

export default (state = initialState, action) => {
    case ActionTypes.ACCOUNT_INFO_FETCH_SUCCESS:
        return {
            ...state,
            isUpdatingAccount: true
        };
    default:
         return state;
};

```
- Blacklist reducer in case the state does not need to be persisted to local storage.

### [WIP]: Actions
[WIP]

## Unit Testing

- **Filenames**: Use `*.spec.js` for test filenames.
- **Structure**: Nest test suites to logically structure tests in subsets.

```javascript
describe('selectors: account', () => {
      describe('#getAccountFromState', () => {
        describe('when "account" prop is not defined in argument', () => {
            it('should return an empty object', () => { });
        });

        describe('when "account" prop is defined in argument', () => {
            it('should return value for "account" prop', () => { });
        });
    });
});
```

- **Expectations**: Do not write unnecessary expectations in a single test. A test should just be a design specification of a certain behavior for how it should work.
- **Multiple Concerns**: Always test a single concern. If a function has different end results, each of them should be tested separately.

### React components
- Test named exports for container components.
- Define a global `getProps` function for injecting props to a component.

```javascript
const getProps = (overrides) => {
    return assign({}, {
        pollFor: 'accountInfo',
        allPollingServices: ['accountInfo', 'marketData'],
        setPollFor: noop
    }, overrides);
};

describe('component: Poll', () => {
    describe('when renders', () => {
        it('should return null', () => {
            const props = getProps();

            const wrapper = shallow(<Poll {...props} />);
            expect(wrapper.type()).toEqual(null);
        });
    });
});
```
- Test all instance methods that lead to state updates.
- Test all instance methods that dispatch redux actions.

### Reducers
- Always test initial state for a reducer.

```javascript
it('should have an initial state', () => {
    const initialState = {
        firstUse: true,
        onboardingComplete: false,
        accountInfo: {}
    };

    expect(reducer(undefined, {})).to.eql(initialState);
});
```

- Use action creators in tests for returing type and payloads.

```javascript
it('should assign payload to unconfirmedBundleTails prop in state', () => {
    const action = actions.updateUnconfirmedBundleTails({ foo: {} });

    const newState = reducer({}, action);
    const expectedState = {
        unconfirmedBundleTails: { foo: {} },
    };

    expect(newState).to.eql(expectedState);
});
```

- Test handlers as separate functions.

```javascript
describe('#setNetPollIfSuccessful', () => {
    let state;

    beforeEach(() => {
        state = {
            allPollingServices: ['marketData', 'price', 'chartData', 'accountInfo', 'promotion'],
            pollFor: 'marketData',
        };
    });

    describe('when pollFor value exists in allPollingServices array', () => {
        it('should return an object with prop pollFor equals value of next element in allPollingServices array', () => {
            expect(setNextPollIfSuccessful(state)).to.eql({ pollFor: 'price' });
        });
    });
});
```

### WIP: Actions
[WIP]

## Assets
All following static assets should be shared between desktop and mobile, stored at `/src/shared/assets/`.

### Icons
To ensure cross-platform compatibility and identical display, all icons should follow these rules:
- SVG icon file should be 64x64px in size without any position transform:
    ```
    <svg width="64" height="64" viewBox="0 0 64 64"></svg>
    ```
- The icon itself should be 64px wide with the height adjusted to the icons ratio.
- Do not use `stroke` - all strokes should be expanded as outlines.
- Do not use `fill` - the icon color is defined in the theme declaration.

### Animations
All animations used in the wallet should be made using [Lottie](http://airbnb.io/lottie/) for cross platfrom compatibillity.

## Themes

A theme consists of a color scheme used by the UI of the mobile and desktop wallets. All themes are located in separate js files at `/src/shared/themes/`.

### WIP: Color meaning and usage

The color scheme consists of following mandatory sets and colors:
- `body`, `bar` - base color sets used for the application and secondary navigation. Both sets have three colors required: 
    - `color` - **required**, the body color. Used for text, icons.
    - `bg` - **required**, the background color.
    - `alt` - **required**, accent color used for info block background, dividers and borders.
- `primary`, `secondary`, `positive`, `negative`, `highlight`, `extra` - accent color sets used by their name meaning. Possible colors to be defined:
    - `color` - **required**; the accent color itself.
    - `hover` - **required**; the accent colors hover state.
    - `body` - optional; used for content when the accent color is it's background. Defaults to `body.color`.
- `input` - colors for input elements:
    - `color` - **required**; text color of input elements
    - `bg` - **required**; background color of input elements
    - `alt` - optional; used for icons and links inside input elements. Defaults to `input.color`.
- `label` - input element label color:
    - `color` - **required**; label color
    - `hover` - **required**; active input element label color
- `chart.color` - **required**; chart line color.

### WIP: Styleguide

When updating or creating a new UI component or theme, it should be checked for contrast and readability against the Styleguide containing all main UI elements.

To launch the styleguide, inside wallets root directory run:
```
yarn run start:styleguide
```