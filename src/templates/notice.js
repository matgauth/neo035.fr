import React from 'react';
import { graphql } from 'gatsby';

const Notice = ({
  data: {
    markdownRemark: { frontmatter, html },
  },
}) => {
  return (
    <div id="main" className="faq-wrapper">
      <section id="about">
        <div className="container">
          <header>
            <h2>{frontmatter.title}</h2>
          </header>
          <article dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    </div>
  );
};

export default Notice;

export const pageQuery = graphql`
  query Notice($locale: String!, $title: String!) {
    markdownRemark(
      frontmatter: { title: { eq: $title } }
      fields: { locale: { eq: $locale } }
    ) {
      html
      frontmatter {
        title
      }
    }
  }
`;
