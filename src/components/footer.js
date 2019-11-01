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
          <LocalizedLink to="/legal-notices">
            {footer.legalNotices}
          </LocalizedLink>
        </li>
        <li>
          <img
            src="https://api.netlify.com/api/v1/badges/56387a19-77f5-4c58-b1c6-79b2ec167e69/deploy-status"
            alt="Netlify Status"
          />
        </li>
      </ul>
    </div>
  );
}
