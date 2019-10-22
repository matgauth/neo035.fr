const { frLocale } = require('date-fns/locale/fr');

module.exports = {
  fr: {
    default: true,
    path: `fr`,
    locale: `fr-FR`,
    dateFormat: frLocale,
  },
};
