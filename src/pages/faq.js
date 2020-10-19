import React from 'react';
import prop from 'ramda/src/prop';
import { matchSorter } from 'match-sorter';
import { formatDistanceToNow } from 'date-fns';
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
  formatDistanceToNow(new Date(dateStr), {
    locale,
    addSuffix: true,
    includeSeconds: true,
  });

const matchQuery = (data, query, key) =>
  matchSorter(data, query, {
    keys: [key],
    threshold: matchSorter.rankings.CONTAINS,
  });

const FAQItem = ({ videoId, thumbnail, title, publishDate, questions }) => {
  const { faq } = useTranslations();
  return (
    <article>
      <div className="item">
        <div className="row">
          <div className="col-4 col-12-mobile">
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Watch FAQ video"
            >
              <img src={thumbnail} alt={title} className="image fit" />
            </a>
          </div>
          <div className="col-8 col-12-mobile">
            <h3>{title}</h3>
            <p>
              <span className="icon fa-calendar" />
              {faq.publishedAt} <em>{publishDate}</em>
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Watch FAQ video"
            >
              {faq.watchVideo} <span className="icon fa-arrow-right" />
            </a>
          </div>
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
};

const FAQ = ({ pageContext: { locale } }) => {
  const {
    faq: { searchPlaceholder, noFaqItems },
  } = useTranslations();
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
        if (!didCancel)
          dispatch({ type: 'FETCH_SUCCESS', payload: result.reverse() });
      } catch (e) {
        if (!didCancel) dispatch({ type: 'FETCH_FAILURE' });
      }
    };

    const supportedLanguages = {
      en: async () => await import('date-fns/locale/en-GB/index.js'),
      fr: async () => await import('date-fns/locale/fr/index.js'),
    };

    const fetchLocaleFile = async (locale) => {
      const localeFile = await supportedLanguages[locale]();
      setLocaleFile(localeFile);
    };
    Promise.all([fetchVideos(), fetchLocaleFile(locale)]);
    return () => {
      didCancel = true;
    };
  }, [locale]);
  const filteredFaqItems = matchQuery(state.data, input, (item) =>
    item.questions.length > 0 ? item.questions.map(prop`label`) : undefined
  );
  return (
    <div id="main" className="article-wrapper">
      <section className="alt-2">
        <div className="container">
          <div className="search">
            <input
              name="search"
              type="search"
              placeholder={searchPlaceholder}
              onChange={(e) => setInput(e.currentTarget.value)}
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
            filteredFaqItems.map(({ id, publishedAt, questions, ...rest }) => (
              <FAQItem
                key={id}
                publishDate={formatDate(publishedAt, localeFile)}
                questions={matchQuery(questions, input, 'label')}
                {...rest}
              />
            ))}
          {!state.isLoading && !filteredFaqItems.length && (
            <header>
              <h2>{noFaqItems}</h2>
            </header>
          )}
        </div>
      </section>
    </div>
  );
};

export default FAQ;
