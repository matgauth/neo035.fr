/* eslint-disable no-useless-escape */
const { ContextReplacementPlugin } = require('webpack');
const { basename, resolve } = require(`path`);
const { fmImagesToRelative } = require('gatsby-remark-relative-images');
const locales = require(`./src/i18n`);

const localizeSlug = (isDefault, locale, slug) =>
  isDefault ? slug : `/${locale}/${slug}`;

const removeTrailingSlash = path =>
  path === `/` ? path : path.replace(/\/$/, ``);

const findKey = (object, predicate) => {
  let result;
  if (object == null) {
    return result;
  }
  Object.keys(object).some(key => {
    const value = object[key];
    if (predicate(value, key, object)) {
      result = key;
      return true;
    }
    return false;
  });
  return result;
};

exports.onCreatePage = ({ page, actions }) => {
  const { createPage, deletePage } = actions;

  deletePage(page);

  Object.keys(locales).map(lang => {
    const { default: isDefault, locale, path } = locales[lang];
    const localizedPath = isDefault
      ? removeTrailingSlash(page.path)
      : `${path}${page.path}`;
    return createPage({
      ...page,
      path: localizedPath,
      context: {
        ...page.context,
        locale: lang,
        dateFormat: locale,
        isDefault,
        slug: page.path.replace(/^\/+|\/+$/g, ``),
      },
    });
  });
};

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;

  fmImagesToRelative(node);

  if (node.internal.type === `MarkdownRemark`) {
    const name = basename(node.fileAbsolutePath, `.md`);
    const defaultKey = findKey(locales, o => o.default === true);
    const isDefault = name === `index.${defaultKey}`;
    const lang = isDefault ? defaultKey : name.split(`.`)[1];

    createNodeField({ name: `locale`, node, value: lang });
    createNodeField({ name: `isDefault`, node, value: isDefault });
  }
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    plugins: [
      new ContextReplacementPlugin(
        /date-fns[/\\]/,
        new RegExp(
          `[/\\\\\](${Object.keys(locales).map(key => locales[key].locale)
            .join`|`})[/\\\\\]`
        )
      ),
    ],
  });
};

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(
    `
      {
        notices: allFile(filter: { relativeDirectory: { eq: "notices" } }) {
          edges {
            node {
              relativeDirectory
              childMarkdownRemark {
                frontmatter {
                  title
                }
                fields {
                  locale
                  isDefault
                }
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()));
      return Promise.reject(result.errors);
    }

    const notices = result.data.notices.edges;

    notices.forEach(({ node }) => {
      const slug = node.relativeDirectory;
      const title = node.childMarkdownRemark.frontmatter.title;
      const { locale, isDefault } = node.childMarkdownRemark.fields;

      createPage({
        path: localizeSlug(isDefault, locale, slug),
        component: resolve(`src/templates/notice.js`),
        context: { title, locale, isDefault, slug },
      });
    });
  });
};
