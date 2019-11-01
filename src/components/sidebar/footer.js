import React from 'react';
import { Link } from 'gatsby';

export default function Footer({ socialLinks = [] }) {
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
          <Link to="/" className="icon" hrefLang="fr">
            FR
          </Link>{' '}
          /{' '}
          <Link to="/en" className="icon" hrefLang="en">
            EN
          </Link>
        </li>
      </ul>
    </div>
  );
}
