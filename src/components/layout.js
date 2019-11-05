import React from 'react';
import PropTypes from 'prop-types';
import { toast, Slide } from 'react-toastify';
import Konami from 'konami';

import useTranslations from './hooks/use-translations';
import LocalizedLink from './localized-link';
import SEO from './seo';
import SideBar from './sidebar';
import PageFooter from './footer';
import config from '@config';

import 'react-toastify/dist/ReactToastify.min.css';

toast.configure({ position: `top-right`, transition: Slide });

export const LocaleContext = React.createContext();

const Nav = () => {
  const {
    home,
    about,
    events,
    videos,
    faq,
    partners,
    contact,
  } = useTranslations();
  const sections = [
    { id: 'top', name: home.nav, icon: 'fa-home' },
    { id: 'about', name: about.nav, icon: 'fa-user' },
    { id: 'events', name: events.nav, icon: 'fa-calendar' },
    { id: 'videos', name: videos.nav, icon: 'fa-youtube-play' },
    { id: 'faq', name: faq.nav, icon: 'fa-question' },
    { id: 'partners', name: partners.nav, icon: 'fa-group' },
    { id: 'contact', name: contact.nav, icon: 'fa-envelope' },
  ];
  return (
    <nav id="nav">
      <ul>
        {sections.map(s => {
          return (
            <li key={s.id}>
              <LocalizedLink to={`/#${s.id}`} title={s.name}>
                <span className={`icon ${s.icon}`}>{s.name}</span>
              </LocalizedLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const Layout = ({
  children,
  location: { pathname },
  pageContext: { locale, isDefault, slug },
}) => {
  React.useEffect(() => {
    new Konami(config.easterEggLink);
  }, []);
  const regex = new RegExp(`^/${isDefault ? `` : locale}/?$`);
  const isHomePage = pathname.match(regex);
  return (
    <LocaleContext.Provider value={locale}>
      <SEO lang={locale} pathname={pathname} />
      <main className="main-body">
        {!isHomePage && (
          <SideBar pathname={slug}>
            <Nav />
          </SideBar>
        )}
        {children}
        <PageFooter />
      </main>
    </LocaleContext.Provider>
  );
};

Layout.propTypes = {
  location: PropTypes.object.isRequired,
  pageContext: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired,
};

export default Layout;
