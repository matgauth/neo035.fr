import React from 'react';
import { graphql } from 'gatsby';
import BackgroundImage from 'gatsby-background-image';

import useTranslations from '@hooks/use-translations';
import LocalizedLink from '@components/localized-link';
import SideBar from '@components/sidebar';
import HTML from '@components/inner-html';

const IndexPage = ({ data: { notFoundBg } }) => {
  const { notFound, faq } = useTranslations();
  return (
    <>
      <SideBar />
      <div id="wrapper">
        <div id="main">
          <BackgroundImage
            Tag="section"
            id="top"
            title="background"
            className="dark cover"
            role="img"
            aria-label="not found background"
            fluid={notFoundBg.childImageSharp.fluid}
          >
            <div className="container">
              <header>
                <h1>{notFound.title}</h1>
                <HTML markdown={notFound.description} />
              </header>
              <footer>
                <LocalizedLink to="/" className="button">
                  {faq.goBackHome}
                </LocalizedLink>
              </footer>
            </div>
          </BackgroundImage>
        </div>
      </div>
    </>
  );
};

export default IndexPage;

export const query = graphql`
  query NotFound {
    notFoundBg: file(relativePath: { eq: "404.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1920) {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`;