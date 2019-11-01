import React from 'react';
import LocalizedLink from '../localized-link';
import useTranslations from '../hooks/use-translations';

export default function Header({ title, heading, avatar }) {
  const { home } = useTranslations();
  return (
    <div id="logo">
      <LocalizedLink to="/" aria-label={home.showMe}>
        <span className="image avatar48">
          <img height="128px" src={avatar} alt="Avatar" />
        </span>

        <h1 id="title">{title}</h1>
        <p>{heading}</p>
      </LocalizedLink>
    </div>
  );
}
