import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import path from 'ramda/src/path';
import { useStaticQuery, graphql } from 'gatsby';
import { socialLinks } from '@config';

import useTranslations from '@hooks/use-translations';
import { str, parsePath } from '@utils';

const SEO = ({ lang, image, pathname }) => {
  const t = useTranslations();
  const {
    site: {
      siteMetadata: {
        defaultTitle,
        defaultDescription,
        headline,
        author,
        logo,
        siteUrl,
      },
    },
  } = useStaticQuery(query);
  const digMetadata = attr => {
    const pageMetadata = pathname !== `/` ? parsePath(pathname) : `home`;
    return path(['pageMetadata', pageMetadata, attr], t);
  };
  const seo = {
    title: digMetadata('title') || defaultTitle,
    description: digMetadata('description') || defaultDescription,
    image: `${siteUrl}${image || logo}`,
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
          jobTitle: headline,
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

      {/* <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="tessigroupe" />
            <meta name="twitter:title" content={seo.title} />
            <meta name="twitter:description" content={seo.description} />
            <meta name="twitter:image" content={seo.image} /> */}
    </Helmet>
  );
};

SEO.propTypes = {
  lang: PropTypes.string,
  image: PropTypes.string,
  pathname: PropTypes.string,
};

SEO.defaultProps = {
  lang: `fr`,
  image: null,
  pathname: null,
};

export default SEO;

const query = graphql`
  query SEO {
    site {
      siteMetadata {
        defaultTitle
        defaultDescription
        headline
        author
        logo
        siteUrl
      }
    }
  }
`;
