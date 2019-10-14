const path = require('path');
const config = require('./config');

module.exports = {
  pathPrefix: config.pathPrefix,
  siteMetadata: {
    title: config.siteTitle,
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-alias-imports`,
      options: {
        alias: {
          '@config': path.resolve(__dirname, 'config'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@static': path.resolve(__dirname, 'static/'),
        },
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: config.manifestName,
        short_name: config.manifestShortName,
        start_url: config.pathPrefix || config.manifestStartUrl,
        background_color: config.manifestBackgroundColor,
        theme_color: config.manifestThemeColor,
        display: config.manifestDisplay,
        icon: config.manifestIcon,
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-offline',
  ],
};
