import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import path from 'ramda/src/path';
import { useStaticQuery, graphql } from 'gatsby';
import { socialLinks } from '@config';

import useTranslations from '@hooks/use-translations';
import { str, parsePath } from '@utils';

const SEO = ({ lang, pathname }) => {
  const t = useTranslations();
  const {
    site: {
      siteMetadata: {
        defaultTitle,
        defaultDescription,
        jobTitle,
        author,
        logo,
        siteUrl,
      },
    },
  } = useStaticQuery(query);
  const digMetadata = attr => {
    const regex = new RegExp(`^/(${lang})?/?$`);
    const pageMetadata = pathname.match(regex) ? `home` : parsePath(pathname);
    return path(['pageMetadata', pageMetadata, attr], t);
  };
  const seo = {
    title: digMetadata('title') || t.notFound.title,
    description: digMetadata('description') || defaultDescription,
    image: `${siteUrl}${logo}`,
    author,
    url: `${siteUrl}${pathname || `/`}`,
  };
  return (
    <Helmet title={seo.title} titleTemplate={`%s | ${defaultTitle}`}>
      <html lang={lang} />
      <meta property="image" content={seo.image} />
      <meta name="description" content={seo.description} />
      <script type="application/ld+json">
        {str({
          '@context': 'https://schema.org/',
          '@type': 'Person',
          name: author,
          url: siteUrl,
          image: seo.image,
          jobTitle,
          worksFor: {
            '@type': 'Organization',
            name: defaultTitle,
          },
          sameAs: socialLinks.map(link => link.url),
        })}
      </script>
      {/* OpenGraph  */}
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
    </Helmet>
  );
};

SEO.propTypes = {
  lang: PropTypes.string,
  pathname: PropTypes.string,
};

SEO.defaultProps = {
  lang: `fr`,
  pathname: null,
};

export default SEO;

const query = graphql`
  query SEO {
    site {
      siteMetadata {
        defaultTitle
        defaultDescription
        jobTitle
        author
        logo
        siteUrl
      }
    }
  }
`;
