const { ContextReplacementPlugin } = require('webpack');
const { basename } = require(`path`);
const { fmImagesToRelative } = require('gatsby-remark-relative-images');
const { createFilePath } = require(`gatsby-source-filesystem`);
const locales = require(`./src/i18n`);

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
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  fmImagesToRelative(node);

  if (node.internal.type === `MarkdownRemark`) {
    const name = basename(node.fileAbsolutePath, `.md`);
    const splittedName = name.split(`.`);
    const isDefault = splittedName.length === 1;
    const defaultKey = findKey(locales, o => o.default === true);
    const lang = isDefault ? defaultKey : splittedName[1];
    const value = createFilePath({ node, getNode });
    const slug = isDefault
      ? removeTrailingSlash(value)
      : value.replace(/.[a-z]{2}\/$/, ``);

    createNodeField({ name: `slug`, node, value: slug });
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
