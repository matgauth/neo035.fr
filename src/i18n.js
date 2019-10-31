const localeFr = require('date-fns/locale/fr');
const enGB = require('date-fns/locale/en-GB');

module.exports = {
  fr: {
    default: true,
    path: `fr`,
    locale: `fr-FR`,
    dateFormat: localeFr,
  },
  en: {
    default: false,
    path: `en`,
    locale: `en-GB`,
    dateFormat: enGB,
  },
};
