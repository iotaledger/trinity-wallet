# Trinity UI codebase and styleguide
The goal of this documentation is to comprehensively define best practice for the Trinity UI component codebase and styling.

## Table of Contents

   1. [Naming](#naming)
   1. [Formatting](#formatting)
   1. [Documentation](#documentation)
   1. [Design patterns](#design-patterns)
      1. [Presentational components](#containers)
      1. [Container components](#containers)
   1. State[#state]
      1. [Reducers](#Reducers) 
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
```javascript
// Component names match filenames in PascalCase
import HistoryList from 'components/HistoryList';
// Props names in camelca 
<HistoryList historyItems={items}/ >
// Reference names in camelCase
const historyList = <HistoryList />;
```
- **Container Naming:** Provide the passed-in component's name and the containers name as the displayName on the generated component.
```javascript
export default function withChartData(ChartComponent) {
    class ChartData extends React.Component {
        render() {
            const chartProps = {};
            return <ChartComponent {...chartProps}/>;
        }
    }
    // Set displayName containing wrapped component's name
    ChartData.displayName = `withChartData(${ChartComponent.displayName || ChartComponent.name})`;
    
    return ChartData;
}
```

## Formatting
Follow the alignment, spacing, ordering and quote usage rules described in detail in [Airbnb React Style Guide](https://github.com/airbnb/javascript/tree/master/react#alignment) and defined in Eslint configuration of the wallet. Run `eslint src/desktop/src/` or `eslint src/mobile/src/` to check for formatting errors.

## Documentation
All React components and containers should have a general description (purpose, functionality) and the description of it's propTypes in [JSDoc](http://usejsdoc.org/]) format:

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
The application follows higher-order component pattern by splitting platform (mobile and desktop) dependent presentational components and shared platform independent container components:

### Presentational components

- Presentational components are concerned only with the UI output. They are not bound to the redux state and have no external dependencies (except UI libraries and helpers).
- Presentational components are split between desktop and mobile.
- By default presentational components should be implemented as stateless functional components without internal state. The exception are components dealing with non-persistent visual state (e.g. a password input toggle for hidden/visible characters).

### Container components

- Container components deal with the business logic of the application. They are bound to the redux state, deal with component lifecycle (mounting) hooks and data processing.
- Container components should be resuable for desktop and mobile.
- Container component render function holds only the presentational component passed as a prop to the container.

## State

### Reducers
- Expose reducers as the default export.
- Expose handlers as named exports for unit testing.
- Use constants instead of inline strings for action types.
- Always define an `initialState` variable.
```js
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

### Color meaning and usage

The color scheme consists of following mandatory sets and colors:
- `body`, `bar` - base color sets used for the application and secondary navigation. Both sets have three colors required: 
    - `color` - **required**, the body (text, icon, label) color
    - `background` - **required**, the background color
    - `secondary` - **required**, accent color used for info block background, dividers and borders

- `positive`, `secondary`, `negative`,  `highlight`, `extra`, - accent color sets used by their name meaning. Possible colors to be defined:
    - `color` - **required**; the accent color
    - `background` - optional; used when the accent color is a background. Defaults to the accent color itself.
    - `body` - optional; used for content when the accent color is it's background. Defaults to `body.color`.
- `input` - colors for input elements:
    - `color` - **required**; text color of input elements
    - `background` - **required**; tbackground color of input elements
    - `secondary` - optional; used for icons and links inside input elements. Defaults to `input.color`.
    - `border` - optional; border color of input elements. Defaults to `input.background` (no visible border).
- `hover.color` - **required**; color for element (buttons, list items) hover state
- `chart.color` - **required**; chart line color.

### Styleguide

When updating or creating a new theme, it should be checked for contrast and readability against the Styleguide containing all main UI elements.

To launch the styleguide, inside wallets root directory run:
```
yarn run start:styleguide
```