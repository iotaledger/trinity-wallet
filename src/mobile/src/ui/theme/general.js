import { width } from 'libs/dimensions';
import { isIPhoneX } from 'libs/device';

export default {
    contentWidth: isIPhoneX ? width / 1.08 : width / 1.15,
    borderRadius: width / 60,
    borderRadiusSmall: width / 90,
    borderRadiusLarge: width / 40,
    fontSize0: width / 37,
    fontSize1: width / 34,
    fontSize2: width / 31,
    fontSize3: width / 25,
    fontSize4: width / 22,
    fontSize5: width / 19,
    fontSize6: width / 8,
};
