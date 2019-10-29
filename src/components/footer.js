import React from 'react';
import { Link } from 'gatsby';
import useTranslations from './hooks/use-translations';

export default function PageFooter() {
  const [{ footer }] = useTranslations();
  return (
    <div id="footer">
      <ul className="copyright">
        <li>{footer.copyright}</li>
        <li>
          <Link to="/legal-notices">{footer.legalNotices}</Link>
        </li>
      </ul>
    </div>
  );
}
