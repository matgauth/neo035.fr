import React from 'react';
import prop from 'ramda/src/prop';
import matchSorter from 'match-sorter';
import { format } from 'date-fns';
import LocalizedLink from '@components/localized-link';
import useTranslations from '@hooks/use-translations';

import { getVideosFromPlaylistId } from '@utils';
import config from '@config';

const apiKey = process.env.GATSBY_YT_APIKEY;

const reducer = (state, action) => {
  switch (action.type) {
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

const formatDate = (dateStr, locale) =>
  format(new Date(dateStr), 'PPPp', { locale });

const FAQ = ({ pageContext: { locale } }) => {
  const { faq } = useTranslations();
  const [input, setInput] = React.useState('');
  const [localeFile, setLocaleFile] = React.useState(null);
  const [state, dispatch] = React.useReducer(reducer, {
    isLoading: true,
    data: [],
  });
  React.useEffect(() => {
    let didCancel = false;
    const fetchVideos = async () => {
      try {
        const result = await getVideosFromPlaylistId(
          config.faqPlaylistId,
          apiKey
        );
        if (!didCancel) dispatch({ type: 'FETCH_SUCCESS', payload: result });
      } catch (e) {
        console.error('Error for DEV', e.message);
        if (!didCancel) dispatch({ type: 'FETCH_FAILURE' });
      }
    };

    const supportedLanguages = {
      en: async () => await import('date-fns/locale/en-GB/index.js'),
      fr: async () => await import('date-fns/locale/fr/index.js'),
    };

    const fetchLocaleFile = async locale => {
      const localeFile = await supportedLanguages[locale]();
      setLocaleFile(localeFile);
    };
    Promise.all([fetchVideos(), fetchLocaleFile(locale)]);
    return () => {
      didCancel = true;
    };
  }, [locale]);
  const filteredFaqItems = matchSorter(state.data, input, {
    keys: [
      'title',
      i => (i.questions.length > 0 ? i.questions.map(prop`label`) : undefined),
    ],
  });
  return (
    <div id="main-faq">
      <section className="alt-1">
        <LocalizedLink to="/#faq">
          <span className="icon fa-close" /> {faq.goBackHome}
        </LocalizedLink>
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
          {filteredFaqItems.length > 0 &&
            filteredFaqItems.map(
              ({ id, publishedAt, videoId, thumbnail, title, questions }) => {
                const date = formatDate(publishedAt, localeFile);
                const filteredQuestions = matchSorter(questions, input, {
                  keys: [
                    { threshold: matchSorter.rankings.CONTAINS, key: 'label' },
                  ],
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
                    {filteredQuestions.length > 0 && (
                      <table>
                        <thead>
                          <tr>
                            <th>{faq.questions}</th>
                            <th>{faq.time}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQuestions.map(({ label, time }, i) => (
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
            )}
          {!state.isLoading && !filteredFaqItems.length && (
            <header>
              <h2>{faq.noFaqItems}</h2>
            </header>
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQ;
