import React from 'react';
import { Link } from 'gatsby';
import { LocaleContext } from '../layout';

export default function Footer({ socialLinks = [] }) {
  const { locale } = React.useContext(LocaleContext);
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
          {locale !== `fr` && (
            <Link to="/" className="icon">
              Français
            </Link>
          )}
          {locale !== `en` && (
            <Link to="/en" className="icon">
              English
            </Link>
          )}
        </li>
      </ul>
    </div>
  );
}
