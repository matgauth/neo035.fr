import React from 'react';
import { graphql } from 'gatsby';
import matchSorter from 'match-sorter';
import useTranslations from '@hooks/use-translations';
import { format } from 'date-fns';

import { getVideosFromPlaylistId } from '@utils';
import config from '@config';

const apiKey = process.env.GATSBY_YT_APIKEY;

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const FAQ = () => {
  const [{ faq }, dateFormat] = useTranslations();
  console.log(dateFormat);
  const [input, setInput] = React.useState('');
  const onChange = e => setInput(e.currentTarget.value);
  const [state, dispatch] = React.useReducer(reducer, {
    isLoading: false,
    isError: false,
    data: [],
  });
  React.useEffect(() => {
    let didCancel = false;
    const fetchVideos = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await getVideosFromPlaylistId(
          config.faqPlaylistId,
          apiKey
        );
        if (!didCancel) dispatch({ type: 'FETCH_SUCCESS', payload: result });
      } catch (e) {
        if (!didCancel) dispatch({ type: 'FETCH_FAILURE' });
      }
    };
    fetchVideos();
    return () => {
      didCancel = true;
    };
  }, []);
  if (state.isLoading) {
    return <p>Loading...</p>;
  }
  if (state.isError) {
    return <p>Une erreur est survenue</p>;
  }
  const filteredFaqItems = matchSorter(state.data, input, {
    keys: [
      'title',
      i => (i.questions.length > 0 ? i.questions.map(q => q.label) : undefined),
    ],
  });
  return (
    <>
      <div className="container">
        <div className="search">
          <input
            name="search"
            type="text"
            autoFocus
            placeholder={faq.searchPlaceholder}
            onChange={onChange}
            value={input}
          />
        </div>
        {filteredFaqItems.map(faqItem => {
          return (
            <article key={faqItem.id}>
              <div className="row">
                <div className="col-4 col-12-mobile">
                  <div className="item">
                    <a
                      href={`https://www.youtube.com/watch?v=${faqItem.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Watch FAQ video"
                    >
                      <img
                        src={faqItem.thumbnail}
                        alt={faqItem.title}
                        className="image fit"
                      />
                    </a>
                  </div>
                </div>
                <div className="col-8 col-12-mobile">
                  <h3>{faqItem.title}</h3>
                  <p>
                    <strong>{faq.publishedAt}</strong>{' '}
                    {format(new Date(faqItem.publishedAt), 'PPpp')}
                  </p>
                </div>
              </div>
              {faqItem.questions.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>{faq.questions}</th>
                      <th>{faq.time}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqItem.questions.map(({ label, time }, i) => (
                      <tr key={`${faqItem.title}_${i}`}>
                        <td>{label}</td>
                        <td>
                          <a
                            href={time.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Watch FAQ video at ${time.text}`}
                          >
                            {time.text}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </article>
          );
        })}
      </div>
    </>
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
