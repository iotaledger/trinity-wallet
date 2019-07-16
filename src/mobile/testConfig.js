import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { i18nextInit } from 'shared-modules/libs/i18next';

configure({ adapter: new Adapter() });
i18nextInit();
