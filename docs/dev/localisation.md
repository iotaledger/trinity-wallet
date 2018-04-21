# Localisation

The IOTA community is very large and diverse. In order to achieve widespread adoption, it is important that users can use IOTA in their native language. The i18next and react-i18next libraries are used to make localisation easier.

If you are making a contribution that includes adding or changing text, please follow the instructions for localisation.

## Instructions

1. Import the `translate` higher order component (HOC)
```
import { translate } from ‘react-i18next’;
```

2. Set a constant `t` equal to the props
```
const { t } = this.props;
```

3. Tell i18next to get the translations for your keys (please name the key appropriately)
```
<Text>Hello world!</Text>
```
changes to
```
<Text>{t(‘helloWorld’)}</Text>
```

4. Wrap the component
```
export translate(‘myContainer’)(MyContainer);
```

5. Update the JSON (located in `src/shared/locales/en/translation.json`) accordingly
```
“myContainer”:{
    “helloWorld”: “Hello world!”
}
```

You're all done! Your strings will be shown on Crowdin once your merge request has been merged into the develop branch.
