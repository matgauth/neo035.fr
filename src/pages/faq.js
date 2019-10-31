import React from 'react';
import Img from 'gatsby-image';
import { graphql } from 'gatsby';
import matchSorter from 'match-sorter';
import useTranslations from '@hooks/use-translations';

const FAQ = ({
  data: {
    allMarkdownRemark: { edges: faqItems },
  },
}) => {
  const [{ faq }] = useTranslations();
  const [input, setInput] = React.useState('');
  const onChange = e => setInput(e.currentTarget.value);
  const filteredFaqItems = matchSorter(faqItems, input, {
    keys: [item => item.node.frontmatter.questions.map(q => q.label)],
  });
  return (
    <div className="container">
      <div id="wrap">
        <input
          id="search"
          name="search"
          type="text"
          placeholder={faq.searchPlaceholder}
          onChange={onChange}
          value={input}
        />
        <button type="button" id="search_submit">
          Rechercher
        </button>
      </div>
      {filteredFaqItems.map(({ node: { frontmatter, id, html } }) => {
        return (
          <article key={id}>
            <div className="row">
              <div className="col-3 col-12-mobile">
                <div className="item">
                  <a
                    href={frontmatter.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Img
                      fluid={frontmatter.thumbnail.childImageSharp.fluid}
                      alt={frontmatter.title}
                    />
                  </a>
                </div>
              </div>
              <div className="col-9 col-12-mobile">
                <h2>{frontmatter.title}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>{faq.questions}</th>
                      <th>{faq.time}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frontmatter.questions.map(({ label, time }, i) => {
                      return (
                        <tr key={`${frontmatter.title}_${i}`}>
                          <td>{label}</td>
                          <td>{time}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export const query = graphql`
  query FAQ($locale: String!) {
    allMarkdownRemark(
      filter: {
        fields: { slug: { regex: "/^(/faq/)/" }, locale: { eq: $locale } }
      }
    ) {
      edges {
        node {
          id
          html
          frontmatter {
            thumbnail {
              childImageSharp {
                fluid(maxWidth: 480, traceSVG: { color: "#222629" }) {
                  ...GatsbyImageSharpFluid_tracedSVG
                }
              }
            }
            questions {
              label
              time
            }
            title
            link
          }
        }
      }
    }
  }
`;

export default FAQ;
