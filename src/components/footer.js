import React from 'react';
import useTranslations from './hooks/use-translations';
import LocalizedLink from './localized-link';

export default function PageFooter() {
  const { footer } = useTranslations();
  return (
    <div id="footer">
      <ul className="copyright">
        <li>{footer.copyright}</li>
        <li>
          <LocalizedLink to="/notices">{footer.legalNotices}</LocalizedLink>
        </li>
      </ul>
    </div>
  );
}
