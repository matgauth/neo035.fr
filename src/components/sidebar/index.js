import React, { useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';

import Footer from './footer';
import Header from './header';
import Nav from './nav';
import TopNav from './top-nav';

export default function SideBar({ sections = [] }) {
  const [headerOpen, toggleHeader] = useState(false);
  const {
    site: {
      siteMetadata: { titleAlt, headline, logo, socialLinks },
    },
  } = useStaticQuery(query);
  return (
    <div className={`${headerOpen ? 'header-visible' : ' '}`}>
      <TopNav title={titleAlt} onMenuClick={() => toggleHeader(!headerOpen)} />
      <div id="header">
        <div className="top">
          <Header avatar={logo} title={titleAlt} heading={headline} />
          <Nav sections={sections} />
        </div>
        <Footer socialLinks={socialLinks} />
      </div>
    </div>
  );
}

const query = graphql`
  query Sidebar {
    site {
      siteMetadata {
        titleAlt
        headline
        logo
        socialLinks {
          icon
          name
          url
        }
      }
    }
  }
`;
