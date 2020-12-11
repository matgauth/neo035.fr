const path = require('path');
const config = require('./config.json');

const cloudfrontId = `d33wubrfki0l68`;

const setFeed = (locale, title, output) => {
  return {
    serialize: ({ query: { site, allMarkdownRemark } }) =>
      allMarkdownRemark.edges.map(
        ({ node: { frontmatter, html, excerpt } }) => ({
          title: frontmatter.title,
          description: excerpt,
          date: frontmatter.date,
          url: site.siteMetadata.siteUrl + `/${locale}#events`,
          guid: site.siteMetadata.siteUrl + `/${locale}#events`,
          custom_elements: [{ 'content:encoded': html }],
        })
      ),
    query: `
{
  allMarkdownRemark(
    sort: { fields: [frontmatter___date], order: DESC }
    filter: { frontmatter: { date: { ne: null } }, fields: { locale: { eq: "${locale}" } } }
    limit: 1000
  ) {
    edges {
      node {
        html
        excerpt(pruneLength: 150)
        frontmatter {
          title
          link
          date(formatString: "DD MMMM YYYY", locale: "${locale}")
        }
      }
    }
  }
}
`,
    title,
    output,
    setup: ({
      query: {
        site: { siteMetadata },
      },
    }) => ({
      title: siteMetadata.defaultTitle,
      description: siteMetadata.defaultDescription,
      feed_url: siteMetadata.siteUrl + output,
      site_url: siteMetadata.siteUrl,
      generator: siteMetadata.defaultTitle,
    }),
  };
};

module.exports = {
  siteMetadata: {
    defaultTitle: config.siteTitle,
    titleAlt: `Neo035`,
    jobTitle: config.jobTitle,
    defaultDescription: config.heading,
    author: `Mathieu Gauthier <www.mathieugauthier.fr>`,
    logo: `/img/avatar.png`,
    siteUrl: `https://www.neo035.fr`,
    socialLinks: config.socialLinks,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://www.neo035.fr`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/static/img`,
        name: `uploads`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/data`,
        name: `data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/translations`,
        name: `translations`,
      },
    },
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-relative-images`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              linkImagesToOriginal: true,
              withWebp: true,
              quality: 90,
            },
          },
          `gatsby-remark-external-links`,
          {
            resolve: `gatsby-remark-copy-linked-files`,
            options: { destinationDir: `static` },
          },
        ],
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-catch-links`,
    'gatsby-plugin-react-helmet',
    `gatsby-plugin-sitemap`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                defaultTitle
                defaultDescription
                author
                siteUrl
              }
            }
          }
        `,
        feeds: [
          setFeed('fr', 'Flux RSS des événements', '/evenements.xml'),
          setFeed('en', 'Events RSS Feed', '/events.xml'),
        ],
      },
    },
    {
      resolve: `gatsby-plugin-alias-imports`,
      options: {
        alias: {
          '@i18n': path.resolve(__dirname, 'src/i18n'),
          '@config': path.resolve(__dirname, 'config'),
          '@utils': path.resolve(__dirname, 'src/utils'),
          '@assets': path.resolve(__dirname, 'src/assets'),
          '@components': path.resolve(__dirname, 'src/components'),
          '@hooks': path.resolve(__dirname, 'src/components/hooks'),
          '@static': path.resolve(__dirname, 'static/'),
        },
      },
    },
    'gatsby-plugin-sass',
    'gatsby-plugin-remove-serviceworker',
    {
      resolve: `gatsby-plugin-netlify-cms`,
      options: {
        htmlFavicon: `static/img/favicon.png`,
        htmlTitle: `Oyé oyé, maître Bourboulon 👋`,
      },
    },
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        headers: {
          '/*': [
            `X-UA-Compatible: IE=Edge`,
            `Content-Security-Policy: block-all-mixed-content; base-uri 'self'; default-src 'self' data: i.ytimg.com ${cloudfrontId}.cloudfront.net dev.matm.at; script-src 'self' 'unsafe-inline' dev.matm.at; style-src 'self' 'unsafe-inline' fonts.googleapis.com; object-src 'none'; form-action 'self'; font-src 'self' data: ${cloudfrontId}.cloudfront.net fonts.gstatic.com; connect-src 'self' www.googleapis.com dev.matm.at`,
          ],
          '/admin/*': [
            `Content-Security-Policy: block-all-mixed-content; base-uri 'self'; default-src 'self' blob: data: raw.githubusercontent.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; object-src 'none'; form-action 'self'; font-src 'self' data:; connect-src 'self' blob: api.github.com`,
          ],
          '/icons/*.png': [`cache-control: public, max-age=31536000,immutable`],
        },
      },
    },
  ],
};
