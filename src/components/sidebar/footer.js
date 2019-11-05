import React from 'react';
import PropTypes from 'prop-types';
import { Link, useStaticQuery, graphql } from 'gatsby';
import l from '@i18n';

const locales = Object.keys(l);

export default function Footer({ pathname }) {
  const {
    site: {
      siteMetadata: { socialLinks },
    },
  } = useStaticQuery(query);
  return (
    <div className="bottom">
      <ul className="icons">
        {socialLinks.map((social, i) => {
          const { icon, name, url } = social;
          return [
            <li key={url}>
              <a
                href={url}
                className={`icon ${icon}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="label">{name}</span>
              </a>
            </li>,
            i === socialLinks.length - 1 && (
              <li key="separator">
                <span className="icon">●</span>
              </li>
            ),
          ];
        })}
        <li>
          {locales.map((lang, i) => [
            <Link
              key={lang}
              to={`/${
                l[lang].default
                  ? pathname
                  : `${l[lang].path}${pathname ? `/${pathname}` : ``}`
              }`}
              className="icon"
              hrefLang={lang}
            >
              {lang.toUpperCase()}
            </Link>,
            i < locales.length - 1 && ` / `,
          ])}
        </li>
      </ul>
    </div>
  );
}

Footer.defaultProps = {
  pathname: ``,
};

Footer.propTypes = {
  pathname: PropTypes.string,
};

const query = graphql`
  query Footer {
    site {
      siteMetadata {
        socialLinks {
          icon
          name
          url
        }
      }
    }
  }
`;
