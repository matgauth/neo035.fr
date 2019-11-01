import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Img from 'gatsby-image';
import LocalizedLink from '../localized-link';
import useTranslations from '../hooks/use-translations';

export default function Header() {
  const { home } = useTranslations();
  const {
    site: {
      siteMetadata: { titleAlt, jobTitle },
    },
    avatar,
  } = useStaticQuery(query);
  return (
    <div id="logo">
      <LocalizedLink to="/" aria-label={home.showMe}>
        <span className="image avatar48">
          <Img fluid={avatar.childImageSharp.fluid} alt="Avatar" />
        </span>

        <h1 id="title">{titleAlt}</h1>
        <p>{jobTitle}</p>
      </LocalizedLink>
    </div>
  );
}

const query = graphql`
  query SideBar {
    site {
      siteMetadata {
        titleAlt
        jobTitle
      }
    }
    avatar: file(relativePath: { eq: "avatar.png" }) {
      childImageSharp {
        fluid(maxWidth: 48, traceSVG: { color: "#222629" }) {
          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
  }
`;
