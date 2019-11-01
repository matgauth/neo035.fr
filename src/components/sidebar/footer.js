import React from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import l from '@i18n';

const locales = Object.keys(l);

export default function Footer() {
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
              to={`/${l[lang].default ? `` : l[lang].path}`}
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
