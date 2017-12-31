// from https://github.com/i18next/react-i18next/blob/master/test/translate.render.spec.js

import React from 'react';
import { shallow, render, mount } from 'enzyme';
import i18n from '../i18n';
import { translate } from 'react-i18next';

const context = {
  i18next
};

describe('translate', () => {
  const TestElement = ({ t }) => {
    return (
      <div>{t('key1')}</div>
    );
  }

  it('should render correct translation', () => {
    const HocElement = translate(['translation'], {})(TestElement);

    const wrapper = mount(<HocElement />, { context });
    // console.log(wrapper.debug());
    expect(wrapper.contains(<div>test</div>)).toBe(true);
  });

  it('should bind / unbind', () => {
    const HocElement = translate(['translation'], {})(TestElement);

    const wrapper = mount(<HocElement i18n={i18n} />, context);
    // console.log(wrapper.debug());

    // has bound events
    expect(i18n.observers.languageChanged.length).toBe(2)
    expect(i18n.observers.loaded.length).toBe(2)

    // unbind after unmount
    wrapper.unmount()
    expect(i18n.observers.languageChanged.length).toBe(1)
    expect(i18n.observers.loaded.length).toBe(1)
  });
});