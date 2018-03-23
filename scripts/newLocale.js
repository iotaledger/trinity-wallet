/**
 * @overview Use this script to automate the addition of new languages to Trinity
 * See https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes for a list of ISO 639-1 language codes
 *
 * @example node newLocale.js "es-ES" "Español (España)" "Spanish (Spain)"
 */

/*eslint-disable no-console*/
/*eslint-disable no-unused-vars*/
/*eslint-disable prefer-const*/

const localeLib = require('../src/shared/libs/locale');
const i18nLib = require('../src/shared/libs/i18n');
const fs = require('fs');

const detectLocale = localeLib.detectLocale;
const selectLocale = localeLib.selectLocale;
const I18N_LOCALES = i18nLib.I18N_LOCALES;
const I18N_LOCALE_LABELS = i18nLib.I18N_LOCALE_LABELS;
const getLocaleFromLabel = i18nLib.getLocaleFromLabel;

// Get files to edit
const localeLists = fs.readFileSync('../src/shared/libs/i18n.js').toString();
const sharedi18nResources = fs.readFileSync('../src/shared/i18next.js').toString();
const mobilei18nResources = fs.readFileSync('../src/mobile/i18next.js').toString();
const desktopi18nResources = fs.readFileSync('../src/desktop/src/libs/i18next.js').toString();
const sharedi18nResourcesArr = fs.readFileSync('../src/shared/i18next.js').toString().split('\n');
const mobilei18nResourcesArr = fs.readFileSync('../src/mobile/i18next.js').toString().split('\n');
const desktopi18nResourcesArr = fs.readFileSync('../src/desktop/src/libs/i18next.js').toString().split('\n');

// Get file descriptors
const localeListsFd = fs.openSync('../src/shared/libs/i18n.js', 'r+');
const sharedi18nResourcesFd = fs.openSync('../src/shared/i18next.js', 'r+');
const mobilei18nResourcesFd = fs.openSync('../src/mobile/i18next.js', 'r+');
const desktopi18nResourcesFd = fs.openSync('../src/desktop/src/libs/i18next.js', 'r+');

// Store arguments
const langCode = process.argv[2];
const localizedLangName = process.argv[3];
const englishLangName = process.argv[3];

// Concatenate the string to format it for the UI
const langName = localizedLangName + ' - ' + englishLangName;

// Copy the constants so we don't mutate the original
let LOCALES_COPY = I18N_LOCALES;
let LOCALE_LABELS_COPY = I18N_LOCALE_LABELS;

/**
 * Adds the language to Trinity files
 * @param {String} langCode          ISO 639-1 language code
 * @param {String} langName          Concatenated string of localizedLangName and englishLangName
 */
const addLocale = (langCode, langName) => {

  // Check if langauge is already added
  if ((I18N_LOCALES.indexOf(langCode) !== -1) || (I18N_LOCALE_LABELS.indexOf(langName) !== -1)) {
    console.log('Error: Language is already added');
    process.exit();
  }

  LOCALES_COPY.push(langCode);
  LOCALES_COPY.sort(sortLocales);
  const langCodeIndex = LOCALES_COPY.indexOf(langCode);

  function addLocaleToLocaleLists() {
    const positionToWriteAt = localeLists.match(LOCALES_COPY[langCodeIndex -1]).index + LOCALES_COPY[langCodeIndex -1].length + 2;
    const stringToWrite = '\n    \'' + langCode + '\',';
    console.log('Adding ' + langCode + '...');
    write(localeListsFd, localeLists, stringToWrite, positionToWriteAt);
  }

  function addLocaleToResources() {
    let r = sharedi18nResources.substring(sharedi18nResources.match(/resources: \{/).index);
    let rArr = r.split('\n');
    console.log(rArr);
    let positionToWriteAt = r.match(LOCALES_COPY[langCodeIndex -1]).index + rArr[langCodeIndex -1].length + 14;
    console.log(r.match(LOCALES_COPY[langCodeIndex -1]).index);
    console.log(r.charAt(r.match(LOCALES_COPY[langCodeIndex -1]).index));
    console.log(positionToWriteAt);
    console.log(r.substring(positionToWriteAt));
  }

  addLocaleToResources();

};

/**
 * Custom sort rule for locales
 * @param  {String} a locale
 * @param  {String} b locale
 * @return {int}      index
 */
const sortLocales = (a, b) => {
  // Make an array of the locales
  const arr = [a, b];
  // Clone the array so we don't mutate the original
  let sortedArr = arr;
  // Sort the array alphabetically
  sortedArr.sort();

  // If the label is 'en', it should always come first
  if (a === 'en') {
    return -1;
  }
  if (b === 'en') {
    return 1;
  }

  // Otherwise, refer to the order of sortedArr
  if (sortedArr.indexOf(a) === 0) {
    return -1;
  }
  if (sortedArr.indexOf(a) === 1) {
    return 1;
  }
};

/**
 * Custom write function to insert strings into files
 * @param  {int} fd   file descriptor
 * @param  {String} file original contents of the file
 * @param  {String} str  string to be inserted
 * @param  {int} pos  position to insert the string
 * @return {void}
 */
const write = (fd, file, str, pos) => {
  const newFile = file.substring(0, pos) + str + file.substring(pos);
  console.log(newFile);
  fs.writeFileSync(fd, newFile);
};
addLocale(langCode, langName);
