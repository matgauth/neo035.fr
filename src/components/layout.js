import React from 'react';
import PropTypes from 'prop-types';
import { toast, Slide } from 'react-toastify';
import Konami from 'konami';

import SEO from './seo';
import config from '@config';

import 'react-toastify/dist/ReactToastify.min.css';

toast.configure({ position: `top-right`, transition: Slide });

export const LocaleContext = React.createContext();

const Layout = ({
  children,
  location: { pathname },
  pageContext: { locale },
}) => {
  React.useEffect(() => {
    new Konami(config.easterEggLink);
  }, []);
  return (
    <LocaleContext.Provider value={locale}>
      <SEO lang={locale} pathname={pathname} />
      <main className="main-body">{children}</main>
    </LocaleContext.Provider>
  );
};

Layout.propTypes = {
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
};

export default Layout;
