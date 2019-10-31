import React from 'react';
import PropTypes from 'prop-types';
import { toast, Slide } from 'react-toastify';

import SEO from './seo';

import 'react-toastify/dist/ReactToastify.min.css';

toast.configure({ position: `top-right`, transition: Slide });

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
