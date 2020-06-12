import React from 'react';
import { graphql } from 'gatsby';
import useTranslations from '@hooks/use-translations';

function ErrataPage({
  data: {
    videos: { edges: videoItems },
  },
}) {
  const { errata, faq } = useTranslations();
  return (
    <div id="main" className="article-wrapper">
      <section className="alt-2">
        <div className="container">
          <header>
            <h2>{errata.title}</h2>
          </header>
          {!!videoItems.length ? (
            videoItems.map(({ node: { frontmatter, id, html } }) => {
              return (
                <article key={id} className="item">
                  <span className="ribbon">
                    <a
                      href={frontmatter.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="disabled-hover"
                      title={`${faq.watchVideo} ${frontmatter.title}`}
                    >
                      <span className="icon fa-youtube-play" /> {faq.watchVideo}
                    </a>
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
  query Errata($locale: String!) {
    videos: allMarkdownRemark(
      sort: { fields: [frontmatter___title], order: ASC }
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
