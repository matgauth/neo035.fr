import React from 'react';

import Footer from './footer';
import Header from './header';
import TopNav from './top-nav';

export default function SideBar({ pathname, children }) {
  const [headerOpen, toggleHeader] = React.useState(false);

  return (
    <div className={`${headerOpen ? 'header-visible' : ' '}`}>
      <TopNav onMenuClick={() => toggleHeader(!headerOpen)} />
      <div id="header">
        <div className="top">
          <Header />
          {children}
        </div>
        <Footer pathname={pathname} />
      </div>
    </div>
  );
}
