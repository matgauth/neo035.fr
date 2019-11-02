import React from 'react';
import { navigate } from 'gatsby';
import prop from 'ramda/src/prop';
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
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
      };
    default:
      throw new Error();
  }
};

const FAQ = ({ pageContext: { dateFormat, locale, isDefault } }) => {
  const { faq } = useTranslations();
  const [input, setInput] = React.useState('');
  const [state, dispatch] = React.useReducer(reducer, {
    isLoading: false,
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
        console.error('Error for DEV', e.message);
        navigate(`/${isDefault ? `` : locale}#faq`);
      }
    };
    fetchVideos();
    return () => {
      didCancel = true;
    };
  }, []);
  const filteredFaqItems = matchSorter(state.data, input, {
    keys: [
      'title',
      i => (i.questions.length > 0 ? i.questions.map(prop`label`) : undefined),
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
            onChange={e => setInput(e.currentTarget.value)}
            value={input}
          />
        </div>
        {state.isLoading && (
          <div className="folding-cube">
            <div className="cube1 cube"></div>
            <div className="cube2 cube"></div>
            <div className="cube4 cube"></div>
            <div className="cube3 cube"></div>
          </div>
        )}
        {filteredFaqItems.length > 0 && !state.isLoading ? (
          filteredFaqItems.map(
            ({ id, publishedAt, videoId, thumbnail, title, questions }) => {
              const date = format(new Date(publishedAt), 'PPPPp', {
                locale: require(`date-fns/locale/${dateFormat}`).default,
              });
              return (
                <article key={id}>
                  <div className="row">
                    <div className="col-4 col-12-mobile">
                      <div className="item">
                        <a
                          href={`https://www.youtube.com/watch?v=${videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Watch FAQ video"
                        >
                          <img
                            src={thumbnail}
                            alt={title}
                            className="image fit"
                          />
                        </a>
                      </div>
                    </div>
                    <div className="col-8 col-12-mobile">
                      <h3>{title}</h3>
                      <p>
                        <strong>{faq.publishedAt}</strong> {date}
                      </p>
                      <a
                        href={`https://www.youtube.com/watch?v=${videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Watch FAQ video"
                      >
                        {faq.watchVideo}{' '}
                        <span className="icon fa-arrow-right" />
                      </a>
                    </div>
                  </div>
                  {questions.length > 0 && (
                    <table>
                      <thead>
                        <tr>
                          <th>{faq.questions}</th>
                          <th>{faq.time}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questions.map(({ label, time }, i) => (
                          <tr key={`${title}_${i}`}>
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
            }
          )
        ) : (
          <p>{faq.noFaqItems}</p>
        )}
      </div>
    </>
  );
};

export default FAQ;
