import React from 'react';

import Footer from './footer';
import Header from './header';
import Nav from './nav';
import TopNav from './top-nav';

export default function SideBar({ sections = [] }) {
  const [headerOpen, toggleHeader] = React.useState(false);

  return (
    <div className={`${headerOpen ? 'header-visible' : ' '}`}>
      <TopNav onMenuClick={() => toggleHeader(!headerOpen)} />
      <div id="header">
        <div className="top">
          <Header />
          <Nav sections={sections} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
