import React from 'react';
import PropTypes from 'prop-types';

import SEO from './seo';

export const LocaleContext = React.createContext();

const Layout = ({
  children,
  location: { pathname },
  pageContext: { locale, dateFormat },
}) => (
  <LocaleContext.Provider value={{ locale, dateFormat }}>
    <SEO lang={locale} pathname={pathname} />
    <main className="main-body">{children}</main>
  </LocaleContext.Provider>
);

Layout.propTypes = {
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
};

export default Layout;
