import React from 'react';
import { graphql } from 'gatsby';
import useTranslations from '@hooks/use-translations';

function ErrataPage({
  data: {
    errata: { edges: videoItems },
  },
}) {
  const { errata } = useTranslations();
  return (
    <div id="main" className="errata-wrapper">
      <section className="alt-2">
        <div className="container">
          <header>
            <h2>{errata.title}</h2>
          </header>
          <p>{errata.description}</p>
          {!!videoItems.length ? (
            videoItems.map(({ node: { frontmatter, id, html } }) => {
              return (
                <article key={id} className="item">
                  <span className="ribbon">
                    <span className="icon link" />
                  </span>
                  <div className="inner-item">
                    <h3>{frontmatter.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  </div>
                </article>
              );
            })
          ) : (
            <article className="item">
              <div className="inner-item">
                <h3>{errata.noVideoFound}</h3>
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}

export default ErrataPage;
export const query = graphql`
  query Index($locale: String!) {
    videos: allMarkdownRemark(
      filter: {
        fields: { locale: { eq: $locale } }
        frontmatter: { key: { eq: "errata" } }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            title
            link
          }
        }
      }
    }
  }
`;
